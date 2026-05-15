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

describe('PollController.listByStatus', () => {
    it('lists polls by status and returns 200', async () => {
        const { controller, dependencies } = makeController();
        const polls = [makePollEntity()];
        const request = makeRequestMock({
            params: { status: 'NOT_STARTED' },
        });
        const reply = makeReplyMock();

        vi.mocked(dependencies.listByStatusUseCase.execute).mockResolvedValue(
            polls,
        );

        await controller.listByStatus(request, reply);

        expect(dependencies.listByStatusUseCase.execute).toHaveBeenCalledWith({
            status: 'NOT_STARTED',
        });
        expect(reply.status).toHaveBeenCalledWith(200);
    });
});
