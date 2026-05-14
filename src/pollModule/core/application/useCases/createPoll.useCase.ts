import { PollEntity } from '../../entities/poll.entity.js';
import { PollStatus } from '../../enum/pollStatus.enum.js';
import {
    type CreatePollRepositoryInput,
    type PollRepository,
} from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';
import {
    ensurePollScheduleIsValid,
    normalizePollOptions,
    normalizePollTitle,
    parsePollDate,
} from './pollValidation.util.js';

export interface CreatePollUseCaseInput {
    title: string;
    startDate: Date | string;
    endDate: Date | string;
    options: string[];
}

export class CreatePollUseCase implements IUseCase<
    CreatePollUseCaseInput,
    PollEntity
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(input: CreatePollUseCaseInput): Promise<PollEntity> {
        const title = normalizePollTitle(input.title);
        const options = normalizePollOptions(input.options);
        const startDate = parsePollDate(input.startDate, 'start date');
        const endDate = parsePollDate(input.endDate, 'end date');

        ensurePollScheduleIsValid(startDate, endDate);

        const pollData: CreatePollRepositoryInput = {
            title,
            startDate,
            endDate,
            status: PollStatus.NOT_STARTED,
            options,
        };

        return this.pollRepository.create(pollData);
    }
}
