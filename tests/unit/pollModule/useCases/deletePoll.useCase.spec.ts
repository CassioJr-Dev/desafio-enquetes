import { describe, expect, it, vi } from 'vitest';

import { DeletePollUseCase } from '../../../../src/pollModule/core/application/useCases/deletePoll.useCase.js';
import { NotFoundException } from '../../../../src/pollModule/core/exceptions/notFound.exception.js';
import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('DeletePollUseCase', () => {
    it('deletes a poll when it exists', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(makePollEntity());
        vi.mocked(repository.delete).mockResolvedValue(undefined);

        const useCase = new DeletePollUseCase(repository);

        await expect(useCase.execute({ pollId: 'poll-1' })).resolves.toBeUndefined();
        expect(repository.delete).toHaveBeenCalledWith('poll-1');
    });

    it('throws not found when deleting a missing poll', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(null);

        const useCase = new DeletePollUseCase(repository);

        await expect(useCase.execute({ pollId: 'poll-1' })).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
