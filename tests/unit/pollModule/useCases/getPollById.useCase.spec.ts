import { describe, expect, it, vi } from 'vitest';

import { GetPollByIdUseCase } from '../../../../src/pollModule/core/application/useCases/getPollById.useCase.js';
import { NotFoundException } from '../../../../src/pollModule/core/exceptions/notFound.exception.js';
import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('GetPollByIdUseCase', () => {
    it('returns a poll by id', async () => {
        const repository = makePollRepositoryMock();
        const poll = makePollEntity();
        vi.mocked(repository.findById).mockResolvedValue(poll);

        const useCase = new GetPollByIdUseCase(repository);

        await expect(useCase.execute({ pollId: 'poll-1' })).resolves.toBe(poll);
    });

    it('throws not found when poll does not exist by id', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(null);

        const useCase = new GetPollByIdUseCase(repository);

        await expect(useCase.execute({ pollId: 'poll-1' })).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
