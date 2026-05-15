import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app.js';
import { InMemoryPollRepository } from '../helpers/in-memory-poll.repository.js';

describe('Poll websocket e2e', () => {
    let cleanup: (() => Promise<void>) | undefined;

    afterEach(async () => {
        if (cleanup) {
            await cleanup();
            cleanup = undefined;
        }
    });

    it('sends a snapshot on connect and broadcasts updated vote counts after a new vote', async () => {
        const repository = new InMemoryPollRepository();
        const app = buildApp({
            pollModule: {
                pollRepository: repository,
            },
        });

        cleanup = async () => {
            await app.close();
        };

        await app.ready();

        const createResponse = await app.inject({
            method: 'POST',
            url: '/polls',
            payload: {
                title: 'Favorite framework',
                startDate: '2026-01-01T10:00:00.000Z',
                endDate: '2026-01-10T10:00:00.000Z',
                options: ['Fastify', 'Express', 'Nest'],
            },
        });

        expect(createResponse.statusCode).toBe(201);

        const createdPoll = createResponse.json();
        const firstOptionId = createdPoll.options[0].optionId as string;

        const websocket = await app.injectWS(
            `/polls/${createdPoll.pollId}/votes/ws`,
        );

        const snapshot = await new Promise<string>((resolve) => {
            websocket.once('message', (message) => {
                resolve(message.toString());
            });
        });

        expect(JSON.parse(snapshot)).toMatchObject({
            type: 'poll.vote.snapshot',
            pollId: createdPoll.pollId,
            totalVotes: 0,
        });

        const updatedMessage = new Promise<string>((resolve) => {
            websocket.once('message', (message) => {
                resolve(message.toString());
            });
        });

        const voteResponse = await app.inject({
            method: 'POST',
            url: `/polls/${createdPoll.pollId}/votes`,
            payload: {
                optionId: firstOptionId,
            },
        });

        expect(voteResponse.statusCode).toBe(201);

        const voteUpdate = JSON.parse(await updatedMessage);

        expect(voteUpdate).toMatchObject({
            type: 'poll.vote.updated',
            pollId: createdPoll.pollId,
            totalVotes: 1,
        });
        expect(voteUpdate.options[0]).toMatchObject({
            optionId: firstOptionId,
            votesCount: 1,
        });

        websocket.close();
    });
});
