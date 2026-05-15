import { type FastifyReply, type FastifyRequest } from 'fastify';
import { vi } from 'vitest';
import { type WebSocket } from 'ws';

import { PollController } from '../../../../src/pollModule/http/controllers/poll.controller.js';
import { PollRealtimeGateway } from '../../../../src/pollModule/http/realtime/pollRealtime.gateway.js';

export const makeReplyMock = (): FastifyReply =>
    ({
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    }) as unknown as FastifyReply;

export const makeRequestMock = (
    payload: Partial<FastifyRequest> = {},
): FastifyRequest => payload as FastifyRequest;

export const makeSocketMock = (): WebSocket =>
    ({
        send: vi.fn(),
        close: vi.fn(),
        on: vi.fn(),
    }) as unknown as WebSocket;

export const makeController = () => {
    const dependencies = {
        createPollUseCase: { execute: vi.fn() },
        editPollUseCase: { execute: vi.fn() },
        deletePollUseCase: { execute: vi.fn() },
        getPollByIdUseCase: { execute: vi.fn() },
        listAllPollsUseCase: { execute: vi.fn() },
        listByStatusUseCase: { execute: vi.fn() },
        registerVoteUseCase: { execute: vi.fn() },
        pollRealtimeGateway: {
            subscribe: vi.fn(),
            broadcastVoteUpdated: vi.fn(),
        } as unknown as PollRealtimeGateway,
    };

    return {
        controller: new PollController(dependencies),
        dependencies,
    };
};
