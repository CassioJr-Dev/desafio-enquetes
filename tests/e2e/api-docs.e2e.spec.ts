import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app.js';
import { InMemoryPollRepository } from '../helpers/in-memory-poll.repository.js';

describe('API docs e2e', () => {
    let cleanup: (() => Promise<void>) | undefined;

    afterEach(async () => {
        if (cleanup) {
            await cleanup();
            cleanup = undefined;
        }
    });

    it('serves the generated OpenAPI document and the Scalar reference UI', async () => {
        const app = buildApp({
            pollModule: {
                pollRepository: new InMemoryPollRepository(),
            },
        });

        cleanup = async () => {
            await app.close();
        };

        await app.ready();

        const openApiResponse = await app.inject({
            method: 'GET',
            url: '/openapi.json',
        });

        expect(openApiResponse.statusCode).toBe(200);

        const openApiDocument = openApiResponse.json();

        expect(openApiDocument.openapi).toBe('3.0.3');
        expect(openApiDocument.info).toMatchObject({
            title: 'Desafio Enquetes API',
            version: '1.0.0',
        });
        expect(openApiDocument.paths['/polls']).toBeDefined();
        expect(openApiDocument.paths['/polls/{pollId}/votes']).toBeDefined();
        expect(openApiDocument.paths['/polls/{pollId}/votes/ws']).toBeDefined();
        expect(
            openApiDocument.paths['/polls/{pollId}/votes/ws'].get,
        ).toMatchObject({
            summary: 'Subscribe to realtime vote updates',
        });

        const docsResponse = await app.inject({
            method: 'GET',
            url: '/docs',
        });

        expect(docsResponse.statusCode).toBe(301);
        expect(docsResponse.headers.location).toBe('/docs/');

        const docsIndexResponse = await app.inject({
            method: 'GET',
            url: '/docs/',
        });

        expect(docsIndexResponse.statusCode).toBe(200);
        expect(docsIndexResponse.headers['content-type']).toContain('text/html');
        expect(docsIndexResponse.body).toContain('Desafio Enquetes API');
    });
});
