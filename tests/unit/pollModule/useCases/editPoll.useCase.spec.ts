import { describe, expect, it, vi } from 'vitest';

import { EditPollUseCase } from '../../../../src/pollModule/core/application/useCases/editPoll.useCase.js';
import { BusinessRuleViolationException } from '../../../../src/pollModule/core/exceptions/businessRuleViolation.exception.js';
import { NotFoundException } from '../../../../src/pollModule/core/exceptions/notFound.exception.js';
import { makePollEntity, makeVoteEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('EditPollUseCase', () => {
    it('updates a poll when data changes', async () => {
        const repository = makePollRepositoryMock();
        const currentPoll = makePollEntity();
        const updatedPoll = makePollEntity({ title: 'Updated title' });

        vi.mocked(repository.findById).mockResolvedValue(currentPoll);
        vi.mocked(repository.update).mockResolvedValue(updatedPoll);

        const useCase = new EditPollUseCase(repository);

        const result = await useCase.execute({
            pollId: 'poll-1',
            title: ' Updated title ',
        });

        expect(result).toBe(updatedPoll);
        expect(repository.update).toHaveBeenCalledWith({
            pollId: 'poll-1',
            title: 'Updated title',
            startDate: currentPoll.startDate,
            endDate: currentPoll.endDate,
            status: currentPoll.status,
            options: undefined,
        });
    });

    it('returns the current poll when no fields change during update', async () => {
        const repository = makePollRepositoryMock();
        const currentPoll = makePollEntity();
        vi.mocked(repository.findById).mockResolvedValue(currentPoll);

        const useCase = new EditPollUseCase(repository);

        const result = await useCase.execute({
            pollId: 'poll-1',
            title: currentPoll.title,
        });

        expect(result).toBe(currentPoll);
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('rejects option changes when the poll already has votes', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(
            makePollEntity({
                votes: [makeVoteEntity()],
            }),
        );

        const useCase = new EditPollUseCase(repository);

        await expect(
            useCase.execute({
                pollId: 'poll-1',
                options: ['Option A', 'Option B', 'Option C'],
            }),
        ).rejects.toBeInstanceOf(BusinessRuleViolationException);
    });

    it('throws not found when trying to update a missing poll', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(null);

        const useCase = new EditPollUseCase(repository);

        await expect(useCase.execute({ pollId: 'poll-1' })).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
