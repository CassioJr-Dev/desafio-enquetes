import { PollEntity } from '../../entities/poll.entity.js';
import { type PollRepository } from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';

export type ListAllPollsUseCaseInput = Record<string, never>;

export class ListAllPollsUseCase implements IUseCase<
    ListAllPollsUseCaseInput,
    PollEntity[]
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(
        _input: ListAllPollsUseCaseInput = {},
    ): Promise<PollEntity[]> {
        return this.pollRepository.findAll();
    }
}
