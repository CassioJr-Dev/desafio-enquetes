import { vi } from 'vitest';

import { type PollRepository } from '../../src/pollModule/core/repositories/poll.repository.js';

export const makePollRepositoryMock = (): PollRepository => ({
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    registerVote: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    findByStatus: vi.fn(),
});
