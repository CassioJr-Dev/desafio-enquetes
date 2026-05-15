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

describe('PollController.registerVote', () => {
    it('registers a vote, broadcasts realtime update and returns 201', async () => {
        const { controller, dependencies } = makeController();
        const poll = makePollEntity();
        const request = makeRequestMock({
            params: { pollId: 'poll-1' },
            body: { optionId: 'option-1' },
        });
        const reply = makeReplyMock();

        vi.mocked(dependencies.registerVoteUseCase.execute).mockResolvedValue(
            poll,
        );

        await controller.registerVote(request, reply);

        expect(dependencies.registerVoteUseCase.execute).toHaveBeenCalledWith({
            pollId: 'poll-1',
            optionId: 'option-1',
        });
        expect(
            dependencies.pollRealtimeGateway.broadcastVoteUpdated,
        ).toHaveBeenCalledWith(poll);
        expect(reply.status).toHaveBeenCalledWith(201);
    });
});
