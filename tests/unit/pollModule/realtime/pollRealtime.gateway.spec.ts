import { afterEach, describe, expect, it, vi } from 'vitest';
import { type WebSocket } from 'ws';

import {
    makePollEntity,
    makeVoteEntity,
} from '../../../helpers/poll-fixtures.js';
import { PollRealtimeGateway } from '../../../../src/pollModule/http/realtime/pollRealtime.gateway.js';

interface SocketMockOptions {
    readyState?: number;
}

const makeSocketMock = (
    options: SocketMockOptions = {},
): WebSocket & {
    emitClose: () => void;
    send: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
} => {
    let closeHandler: (() => void) | undefined;

    const socket = {
        OPEN: 1,
        readyState: options.readyState ?? 1,
        send: vi.fn(),
        on: vi.fn((event: string, handler: () => void) => {
            if (event === 'close') {
                closeHandler = handler;
            }
        }),
        emitClose: () => {
            closeHandler?.();
        },
    };

    return socket as unknown as WebSocket & {
        emitClose: () => void;
        send: ReturnType<typeof vi.fn>;
        on: ReturnType<typeof vi.fn>;
    };
};

afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
});

describe('PollRealtimeGateway', () => {
    it('sends the current vote snapshot when a client subscribes', () => {
        vi.useFakeTimers();

        const gateway = new PollRealtimeGateway();
        const poll = makePollEntity();
        const socket = makeSocketMock();

        gateway.subscribe(poll.pollId, socket, poll);

        vi.runAllTimers();

        expect(socket.on).toHaveBeenCalledWith('close', expect.any(Function));
        expect(JSON.parse(vi.mocked(socket.send).mock.calls[0][0])).toMatchObject({
            type: 'poll.vote.snapshot',
            pollId: poll.pollId,
            totalVotes: 0,
        });
    });

    it('broadcasts updated vote counts only to currently open subscribers', () => {
        vi.useFakeTimers();

        const gateway = new PollRealtimeGateway();
        const poll = makePollEntity();
        const openSocket = makeSocketMock();
        const closedSocket = makeSocketMock({ readyState: 3 });

        gateway.subscribe(poll.pollId, openSocket, poll);
        gateway.subscribe(poll.pollId, closedSocket, poll);
        vi.runAllTimers();

        vi.mocked(openSocket.send).mockClear();
        vi.mocked(closedSocket.send).mockClear();

        const updatedPoll = makePollEntity({
            updatedAt: new Date('2026-01-01T11:00:00.000Z'),
            votes: [makeVoteEntity()],
            options: poll.options.map((option, index) => ({
                ...option,
                votesCount: index === 0 ? 1 : 0,
            })),
        });

        gateway.broadcastVoteUpdated(updatedPoll);
        openSocket.emitClose();
        gateway.broadcastVoteUpdated(updatedPoll);

        expect(openSocket.send).toHaveBeenCalledTimes(1);
        expect(JSON.parse(vi.mocked(openSocket.send).mock.calls[0][0])).toMatchObject({
            type: 'poll.vote.updated',
            pollId: updatedPoll.pollId,
            totalVotes: 1,
        });
        expect(closedSocket.send).not.toHaveBeenCalled();
    });
});
