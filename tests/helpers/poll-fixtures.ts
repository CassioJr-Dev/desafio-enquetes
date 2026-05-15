import { OptionEntity } from '../../src/pollModule/core/entities/option.entity.js';
import { PollEntity } from '../../src/pollModule/core/entities/poll.entity.js';
import { VoteEntity } from '../../src/pollModule/core/entities/vote.entity.js';
import { PollStatus } from '../../src/pollModule/core/enum/pollStatus.enum.js';

export const makeOptionEntity = (
    overrides: Partial<OptionEntity> = {},
): OptionEntity =>
    new OptionEntity({
        optionId: 'option-1',
        title: 'Option 1',
        votesCount: 0,
        pollId: 'poll-1',
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
        ...overrides,
    });

export const makeVoteEntity = (
    overrides: Partial<VoteEntity> = {},
): VoteEntity =>
    new VoteEntity({
        voteId: 'vote-1',
        pollId: 'poll-1',
        optionId: 'option-1',
        createdAt: new Date('2026-01-01T11:00:00.000Z'),
        ...overrides,
    });

export const makePollEntity = (
    overrides: Partial<PollEntity> = {},
): PollEntity =>
    new PollEntity({
        pollId: 'poll-1',
        title: 'Best backend framework',
        startDate: new Date('2026-01-01T10:00:00.000Z'),
        endDate: new Date('2026-01-10T10:00:00.000Z'),
        status: PollStatus.NOT_STARTED,
        options: [
            makeOptionEntity({
                optionId: 'option-1',
                title: 'Fastify',
            }),
            makeOptionEntity({
                optionId: 'option-2',
                title: 'Express',
            }),
            makeOptionEntity({
                optionId: 'option-3',
                title: 'Nest',
            }),
        ],
        votes: [],
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
        ...overrides,
    });
