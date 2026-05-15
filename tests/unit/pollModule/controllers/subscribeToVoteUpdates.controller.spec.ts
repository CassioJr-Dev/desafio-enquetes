import { afterEach, describe, expect, it, vi } from 'vitest';

import { makePollEntity } from '../../../helpers/poll-fixtures.js';
import {
    makeController,
    makeRequestMock,
    makeSocketMock,
} from './poll.controller.test-helpers.js';

afterEach(() => {
    vi.clearAllMocks();
});

describe('PollController.subscribeToVoteUpdates', () => {
    it('subscribes a websocket client to poll vote updates', async () => {
        const { controller, dependencies } = makeController();
        const poll = makePollEntity();
        const request = makeRequestMock({
            params: { pollId: 'poll-1' },
        });
        const socket = makeSocketMock();

        vi.mocked(dependencies.getPollByIdUseCase.execute).mockResolvedValue(poll);

        await controller.subscribeToVoteUpdates(socket, request);

        expect(dependencies.getPollByIdUseCase.execute).toHaveBeenCalledWith({
            pollId: 'poll-1',
        });
        expect(dependencies.pollRealtimeGateway.subscribe).toHaveBeenCalledWith(
            'poll-1',
            socket,
            poll,
        );
    });

    it('sends an error payload and closes the websocket on subscription failure', async () => {
        const { controller, dependencies } = makeController();
        const request = makeRequestMock({
            params: { pollId: '   ' },
        });
        const socket = makeSocketMock();

        vi.mocked(dependencies.getPollByIdUseCase.execute).mockRejectedValue(
            new Error('should not be called'),
        );

        await controller.subscribeToVoteUpdates(socket, request);

        expect(socket.send).toHaveBeenCalled();
        expect(socket.close).toHaveBeenCalledWith(1008);
        expect(dependencies.pollRealtimeGateway.subscribe).not.toHaveBeenCalled();
    });
});
