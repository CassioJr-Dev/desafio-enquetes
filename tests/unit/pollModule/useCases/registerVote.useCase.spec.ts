import { describe, expect, it, vi } from 'vitest';

import { RegisterVoteUseCase } from '../../../../src/pollModule/core/application/useCases/registerVote.useCase.js';
import { NotFoundException } from '../../../../src/pollModule/core/exceptions/notFound.exception.js';
import { makePollEntity, makeVoteEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('RegisterVoteUseCase', () => {
    it('registers a vote for an existing poll option', async () => {
        const repository = makePollRepositoryMock();
        const poll = makePollEntity();
        const updatedPoll = makePollEntity({
            options: poll.options.map((option, index) =>
                index === 0
                    ? { ...option, votesCount: 1 }
                    : option,
            ) as typeof poll.options,
            votes: [makeVoteEntity()],
        });

        vi.mocked(repository.findById).mockResolvedValue(poll);
        vi.mocked(repository.registerVote).mockResolvedValue(updatedPoll);

        const useCase = new RegisterVoteUseCase(repository);

        const result = await useCase.execute({
            pollId: poll.pollId,
            optionId: poll.options[0].optionId,
        });

        expect(result).toBe(updatedPoll);
        expect(repository.registerVote).toHaveBeenCalledWith({
            pollId: poll.pollId,
            optionId: poll.options[0].optionId,
        });
    });

    it('throws not found when registering a vote for a missing poll', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(null);

        const useCase = new RegisterVoteUseCase(repository);

        await expect(
            useCase.execute({
                pollId: 'poll-1',
                optionId: 'option-1',
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws not found when registering a vote for a missing option', async () => {
        const repository = makePollRepositoryMock();
        vi.mocked(repository.findById).mockResolvedValue(makePollEntity());

        const useCase = new RegisterVoteUseCase(repository);

        await expect(
            useCase.execute({
                pollId: 'poll-1',
                optionId: 'option-999',
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
