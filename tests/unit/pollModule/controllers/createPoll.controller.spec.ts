import { afterEach, describe, expect, it, vi } from 'vitest';

import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import {
    makeController,
    makeReplyMock,
    makeRequestMock,
} from './poll.controller.test-helpers.js';

afterEach(() => {
    vi.clearAllMocks();
});

describe('PollController.create', () => {
    it('creates a poll and returns 201', async () => {
        const { controller, dependencies } = makeController();
        const poll = makePollEntity();
        const request = makeRequestMock({
            body: {
                title: 'Favorite framework',
                startDate: '2026-01-01T10:00:00.000Z',
                endDate: '2026-01-10T10:00:00.000Z',
                options: ['Fastify', 'Express', 'Nest'],
            },
        });
        const reply = makeReplyMock();

        vi.mocked(dependencies.createPollUseCase.execute).mockResolvedValue(poll);

        await controller.create(request, reply);

        expect(dependencies.createPollUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Favorite framework',
                options: ['Fastify', 'Express', 'Nest'],
            }),
        );
        expect(reply.status).toHaveBeenCalledWith(201);
        expect(reply.send).toHaveBeenCalled();
    });
});
