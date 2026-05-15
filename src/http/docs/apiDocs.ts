import swagger from '@fastify/swagger';
import ScalarApiReference from '@scalar/fastify-api-reference';
import { type FastifyInstance } from 'fastify';
import { subscribePollVoteUpdatesRouteSchema } from '../../pollModule/http/docs/poll.route-schemas.js';

const websocketVoteUpdatesPath = '/polls/{pollId}/votes/ws';

const websocketVoteUpdatesOperation = {
    tags: subscribePollVoteUpdatesRouteSchema.tags,
    summary: subscribePollVoteUpdatesRouteSchema.summary,
    description: subscribePollVoteUpdatesRouteSchema.description,
    parameters: [
        {
            name: 'pollId',
            in: 'path',
            required: true,
            schema: {
                type: 'string',
            },
        },
    ],
    responses: subscribePollVoteUpdatesRouteSchema.response,
} as const;

export const registerApiDocs = (app: FastifyInstance): void => {
    app.register(swagger, {
        openapi: {
            openapi: '3.0.3',
            info: {
                title: 'Desafio Enquetes API',
                description:
                    'API for managing polls, voting, and consuming realtime vote updates.',
                version: '1.0.0',
            },
            tags: [
                {
                    name: 'Polls',
                    description: 'Poll management endpoints',
                },
                {
                    name: 'Votes',
                    description: 'Vote registration endpoints',
                },
            ],
        },
    });

    app.get(
        '/openapi.json',
        {
            schema: {
                hide: true,
            },
        },
        async () => {
            const document = app.swagger();

            return {
                ...document,
                paths: {
                    ...document.paths,
                    [websocketVoteUpdatesPath]: {
                        ...(document.paths?.[websocketVoteUpdatesPath] ?? {}),
                        get: websocketVoteUpdatesOperation,
                    },
                },
            };
        },
    );

    app.register(ScalarApiReference, {
        routePrefix: '/docs',
        configuration: {
            title: 'Desafio Enquetes API',
            url: '/openapi.json',
        },
    });
};
