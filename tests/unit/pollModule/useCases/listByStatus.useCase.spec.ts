import { describe, expect, it, vi } from 'vitest';

import { ListByStatusUseCase } from '../../../../src/pollModule/core/application/useCases/listByStatus.useCase.js';
import { ValidationException } from '../../../../src/pollModule/core/exceptions/validation.exception.js';
import { PollStatus } from '../../../../src/pollModule/core/enum/pollStatus.enum.js';
import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('ListByStatusUseCase', () => {
    it('lists polls by status', async () => {
        const repository = makePollRepositoryMock();
        const polls = [makePollEntity({ status: PollStatus.STARTED })];
        vi.mocked(repository.findByStatus).mockResolvedValue(polls);

        const useCase = new ListByStatusUseCase(repository);

        await expect(
            useCase.execute({ status: PollStatus.STARTED }),
        ).resolves.toBe(polls);
        expect(repository.findByStatus).toHaveBeenCalledWith(
            PollStatus.STARTED,
        );
    });

    it('rejects listing polls by an invalid status', async () => {
        const repository = makePollRepositoryMock();
        const useCase = new ListByStatusUseCase(repository);

        await expect(
            useCase.execute({ status: 'INVALID' as PollStatus }),
        ).rejects.toBeInstanceOf(ValidationException);
    });
});
