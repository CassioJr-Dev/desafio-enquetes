import { PollEntity } from '../../entities/poll.entity.js';
import { NotFoundException } from '../../exceptions/notFound.exception.js';
import {
    type PollRepository,
    type RegisterVoteRepositoryInput,
} from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';
import { normalizePollId } from './pollValidation.util.js';

export interface RegisterVoteUseCaseInput {
    pollId: string;
    optionId: string;
}

export class RegisterVoteUseCase implements IUseCase<
    RegisterVoteUseCaseInput,
    PollEntity
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(input: RegisterVoteUseCaseInput): Promise<PollEntity> {
        const pollId = normalizePollId(input.pollId);
        const optionId = input.optionId.trim();

        if (!optionId) {
            throw new NotFoundException('Poll option not found.');
        }

        const poll = await this.pollRepository.findById(pollId);

        if (!poll) {
            throw new NotFoundException('Poll not found.');
        }

        const optionExists = poll.options.some(
            (option) => option.optionId === optionId,
        );

        if (!optionExists) {
            throw new NotFoundException('Poll option not found.');
        }

        const voteData: RegisterVoteRepositoryInput = {
            pollId,
            optionId,
        };

        return this.pollRepository.registerVote(voteData);
    }
}
