import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app.js';
import { InMemoryPollRepository } from '../helpers/in-memory-poll.repository.js';

describe('Poll module e2e', () => {
    let cleanup: (() => Promise<void>) | undefined;

    afterEach(async () => {
        if (cleanup) {
            await cleanup();
            cleanup = undefined;
        }
    });

    it('creates a poll, registers a vote and exposes updated counts through the API', async () => {
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

        const voteResponse = await app.inject({
            method: 'POST',
            url: `/polls/${createdPoll.pollId}/votes`,
            payload: {
                optionId: firstOptionId,
            },
        });

        expect(voteResponse.statusCode).toBe(201);

        const updatedPoll = voteResponse.json();

        expect(updatedPoll).toMatchObject({
            pollId: createdPoll.pollId,
            totalVotes: 1,
        });
        expect(updatedPoll.options[0]).toMatchObject({
            optionId: firstOptionId,
            votesCount: 1,
        });

        const listResponse = await app.inject({
            method: 'GET',
            url: '/polls',
        });

        expect(listResponse.statusCode).toBe(200);
        expect(listResponse.json()[0]).toMatchObject({
            pollId: createdPoll.pollId,
            totalVotes: 1,
        });
    });

    it('returns 400 when the create payload has invalid date-time fields', async () => {
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

        const response = await app.inject({
            method: 'POST',
            url: '/polls',
            payload: {
                title: 'qual o melhor framework',
                startDate: '14/05/2026',
                endDate: '20/05/2026',
                options: ['NestJs', 'Fastify', 'ExpressJs'],
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchObject({
            message: 'Request validation failed.',
            issues: [
                {
                    path: 'body.startDate',
                    message: 'must match format "date-time"',
                },
            ],
        });
    });
});
