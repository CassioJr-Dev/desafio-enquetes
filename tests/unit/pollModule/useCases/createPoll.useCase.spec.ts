import { describe, expect, it, vi } from 'vitest';

import { CreatePollUseCase } from '../../../../src/pollModule/core/application/useCases/createPoll.useCase.js';
import { BusinessRuleViolationException } from '../../../../src/pollModule/core/exceptions/businessRuleViolation.exception.js';
import { ValidationException } from '../../../../src/pollModule/core/exceptions/validation.exception.js';
import { PollStatus } from '../../../../src/pollModule/core/enum/pollStatus.enum.js';
import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import { makePollRepositoryMock } from '../../../helpers/poll-repository.mock.js';

describe('CreatePollUseCase', () => {
    it('creates a poll with normalized data and default NOT_STARTED status', async () => {
        const repository = makePollRepositoryMock();
        const createdPoll = makePollEntity();
        vi.mocked(repository.create).mockResolvedValue(createdPoll);

        const useCase = new CreatePollUseCase(repository);

        const result = await useCase.execute({
            title: '  Favorite framework  ',
            startDate: '2026-01-01T10:00:00.000Z',
            endDate: '2026-01-10T10:00:00.000Z',
            options: [' Fastify ', 'Express', 'Nest'],
        });

        expect(result).toBe(createdPoll);
        expect(repository.create).toHaveBeenCalledWith({
            title: 'Favorite framework',
            startDate: new Date('2026-01-01T10:00:00.000Z'),
            endDate: new Date('2026-01-10T10:00:00.000Z'),
            status: PollStatus.NOT_STARTED,
            options: ['Fastify', 'Express', 'Nest'],
        });
    });

    it('rejects poll creation with fewer than three options', async () => {
        const repository = makePollRepositoryMock();
        const useCase = new CreatePollUseCase(repository);

        await expect(
            useCase.execute({
                title: 'Favorite framework',
                startDate: '2026-01-01T10:00:00.000Z',
                endDate: '2026-01-10T10:00:00.000Z',
                options: ['Fastify', 'Express'],
            }),
        ).rejects.toBeInstanceOf(BusinessRuleViolationException);

        expect(repository.create).not.toHaveBeenCalled();
    });

    it('rejects poll creation with an empty title', async () => {
        const repository = makePollRepositoryMock();
        const useCase = new CreatePollUseCase(repository);

        await expect(
            useCase.execute({
                title: '   ',
                startDate: '2026-01-01T10:00:00.000Z',
                endDate: '2026-01-10T10:00:00.000Z',
                options: ['Fastify', 'Express', 'Nest'],
            }),
        ).rejects.toBeInstanceOf(ValidationException);
    });
});
