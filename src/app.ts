import Fastify, { type FastifyInstance } from 'fastify';
import { registerApiDocs } from './http/docs/apiDocs.js';

import {
    registerPollModule,
    type RegisterPollModuleOptions,
} from './pollModule/http/poll.module.js';

export interface BuildAppOptions {
    pollModule?: RegisterPollModuleOptions;
}

export const buildApp = (options: BuildAppOptions = {}): FastifyInstance => {
    const app = Fastify({
        logger: false,
    });

    registerApiDocs(app);

    app.get(
        '/',
        {
            schema: {
                hide: true,
            },
        },
        async () => 'hello word',
    );

    registerPollModule(app, options.pollModule);

    return app;
};
