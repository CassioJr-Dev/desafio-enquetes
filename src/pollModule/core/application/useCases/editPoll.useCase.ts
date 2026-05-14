import { PollEntity } from '../../entities/poll.entity.js';
import { BusinessRuleViolationException } from '../../exceptions/businessRuleViolation.exception.js';
import { NotFoundException } from '../../exceptions/notFound.exception.js';
import { PollStatus } from '../../enum/pollStatus.enum.js';
import {
    type PollRepository,
    type UpdatePollRepositoryInput,
} from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';
import {
    ensurePollScheduleIsValid,
    ensureValidPollStatus,
    normalizePollId,
    normalizePollOptions,
    normalizePollTitle,
    parsePollDate,
} from './pollValidation.util.js';

export interface EditPollUseCaseInput {
    pollId: string;
    title?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    status?: PollStatus;
    options?: string[];
}

export class EditPollUseCase implements IUseCase<
    EditPollUseCaseInput,
    PollEntity
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(input: EditPollUseCaseInput): Promise<PollEntity> {
        const pollId = normalizePollId(input.pollId);
        const currentPoll = await this.pollRepository.findById(pollId);

        if (!currentPoll) {
            throw new NotFoundException('Poll not found.');
        }

        const title =
            input.title !== undefined
                ? normalizePollTitle(input.title)
                : currentPoll.title;

        const startDate =
            input.startDate !== undefined
                ? parsePollDate(input.startDate, 'start date')
                : currentPoll.startDate;

        const endDate =
            input.endDate !== undefined
                ? parsePollDate(input.endDate, 'end date')
                : currentPoll.endDate;

        const status = input.status ?? currentPoll.status;
        ensureValidPollStatus(status);
        ensurePollScheduleIsValid(startDate, endDate);

        const currentOptionTitles = currentPoll.options.map(
            (option) => option.title,
        );

        const normalizedOptions =
            input.options !== undefined
                ? normalizePollOptions(input.options)
                : undefined;

        const optionsChanged =
            normalizedOptions !== undefined &&
            !this.areOptionsEqual(normalizedOptions, currentOptionTitles);

        if (optionsChanged && currentPoll.votes.length > 0) {
            throw new BusinessRuleViolationException(
                'Poll options cannot be changed after votes have been cast.',
            );
        }

        const hasChanges =
            title !== currentPoll.title ||
            startDate.getTime() !== currentPoll.startDate.getTime() ||
            endDate.getTime() !== currentPoll.endDate.getTime() ||
            status !== currentPoll.status ||
            optionsChanged;

        if (!hasChanges) {
            return currentPoll;
        }

        const pollData: UpdatePollRepositoryInput = {
            pollId,
            title,
            startDate,
            endDate,
            status,
            options: optionsChanged ? normalizedOptions : undefined,
        };

        return this.pollRepository.update(pollData);
    }

    private areOptionsEqual(
        nextOptions: string[],
        currentOptions: string[],
    ): boolean {
        const normalizedCurrentOptions = currentOptions.map((option) =>
            option.trim(),
        );

        if (nextOptions.length !== normalizedCurrentOptions.length) {
            return false;
        }

        return nextOptions.every(
            (option, index) => option === normalizedCurrentOptions[index],
        );
    }
}
