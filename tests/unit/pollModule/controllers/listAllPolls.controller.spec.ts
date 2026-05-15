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

describe('PollController.listAll', () => {
    it('lists all polls and returns 200', async () => {
        const { controller, dependencies } = makeController();
        const polls = [makePollEntity()];
        const reply = makeReplyMock();

        vi.mocked(dependencies.listAllPollsUseCase.execute).mockResolvedValue(
            polls,
        );

        await controller.listAll(makeRequestMock(), reply);

        expect(dependencies.listAllPollsUseCase.execute).toHaveBeenCalledWith({});
        expect(reply.status).toHaveBeenCalledWith(200);
    });
});
