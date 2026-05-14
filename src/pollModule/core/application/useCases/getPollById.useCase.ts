import { PollEntity } from '../../entities/poll.entity.js';
import { NotFoundException } from '../../exceptions/notFound.exception.js';
import { type PollRepository } from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';
import { normalizePollId } from './pollValidation.util.js';

export interface GetPollByIdUseCaseInput {
    pollId: string;
}

export class GetPollByIdUseCase implements IUseCase<
    GetPollByIdUseCaseInput,
    PollEntity
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(input: GetPollByIdUseCaseInput): Promise<PollEntity> {
        const pollId = normalizePollId(input.pollId);
        const poll = await this.pollRepository.findById(pollId);

        if (!poll) {
            throw new NotFoundException('Poll not found.');
        }

        return poll;
    }
}
