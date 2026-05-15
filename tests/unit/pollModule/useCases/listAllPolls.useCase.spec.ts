import { describe, expect, it, vi } from 'vitest';

import { ListAllPollsUseCase } from '../../../../src/pollModule/core/application/useCases/listAllPolls.useCase.js';
import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('ListAllPollsUseCase', () => {
    it('returns all polls from the repository', async () => {
        const repository = makePollRepositoryMock();
        const polls = [makePollEntity()];
        vi.mocked(repository.findAll).mockResolvedValue(polls);

        const useCase = new ListAllPollsUseCase(repository);

        await expect(useCase.execute({})).resolves.toBe(polls);
        expect(repository.findAll).toHaveBeenCalledOnce();
    });
});
