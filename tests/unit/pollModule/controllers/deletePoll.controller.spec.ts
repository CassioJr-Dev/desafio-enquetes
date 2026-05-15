import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    makeController,
    makeReplyMock,
    makeRequestMock,
} from './poll.controller.test-helpers.js';

afterEach(() => {
    vi.clearAllMocks();
});

describe('PollController.delete', () => {
    it('deletes a poll and returns 204', async () => {
        const { controller, dependencies } = makeController();
        const request = makeRequestMock({
            params: { pollId: 'poll-1' },
        });
        const reply = makeReplyMock();

        vi.mocked(dependencies.deletePollUseCase.execute).mockResolvedValue(
            undefined,
        );

        await controller.delete(request, reply);

        expect(dependencies.deletePollUseCase.execute).toHaveBeenCalledWith({
            pollId: 'poll-1',
        });
        expect(reply.status).toHaveBeenCalledWith(204);
    });
});
