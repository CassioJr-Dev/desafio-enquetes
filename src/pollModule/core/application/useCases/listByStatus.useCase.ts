import { PollEntity } from '../../entities/poll.entity.js';
import { PollStatus } from '../../enum/pollStatus.enum.js';
import { type PollRepository } from '../../repositories/poll.repository.js';
import { type IUseCase } from '../../useCase/default.useCase.js';
import { ensureValidPollStatus } from './pollValidation.util.js';

export interface ListByStatusUseCaseInput {
    status: PollStatus;
}

export class ListByStatusUseCase implements IUseCase<
    ListByStatusUseCaseInput,
    PollEntity[]
> {
    constructor(private readonly pollRepository: PollRepository) {}

    async execute(input: ListByStatusUseCaseInput): Promise<PollEntity[]> {
        ensureValidPollStatus(input.status);

        return this.pollRepository.findByStatus(input.status);
    }
}
