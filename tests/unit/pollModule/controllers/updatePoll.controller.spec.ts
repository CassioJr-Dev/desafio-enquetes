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

describe('PollController.update', () => {
    it('updates a poll and returns 200', async () => {
        const { controller, dependencies } = makeController();
        const poll = makePollEntity({ title: 'Updated title' });
        const request = makeRequestMock({
            params: { pollId: 'poll-1' },
            body: { title: 'Updated title' },
        });
        const reply = makeReplyMock();

        vi.mocked(dependencies.editPollUseCase.execute).mockResolvedValue(poll);

        await controller.update(request, reply);

        expect(dependencies.editPollUseCase.execute).toHaveBeenCalledWith({
            pollId: 'poll-1',
            title: 'Updated title',
        });
        expect(reply.status).toHaveBeenCalledWith(200);
    });
});
