import {
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from 'fastify';
import { ZodError } from 'zod';

import { PollModuleException } from '../../core/exceptions/pollModule.exception.js';

export const registerExceptionInterceptor = (
    app: FastifyInstance,
): void => {
    app.setErrorHandler(
        (
            error: Error,
            _request: FastifyRequest,
            reply: FastifyReply,
        ): FastifyReply => {
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    message: 'Request validation failed.',
                    issues: error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
            }

            if (error instanceof PollModuleException) {
                return reply.status(error.statusCode).send({
                    message: error.message,
                    error: error.name,
                });
            }

            app.log.error(error);

            return reply.status(500).send({
                message: 'Internal server error.',
            });
        },
    );
};
