import { NotFoundException } from '../../exceptions/notFound.exception.js';
import { type PollRepository } from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';
import { normalizePollId } from './pollValidation.util.js';

export interface DeletePollUseCaseInput {
    pollId: string;
}

export class DeletePollUseCase implements IUseCase<
    DeletePollUseCaseInput,
    void
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(input: DeletePollUseCaseInput): Promise<void> {
        const pollId = normalizePollId(input.pollId);
        const currentPoll = await this.pollRepository.findById(pollId);

        if (!currentPoll) {
            throw new NotFoundException('Poll not found.');
        }

        await this.pollRepository.delete(pollId);
    }
}
