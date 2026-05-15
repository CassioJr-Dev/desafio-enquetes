import {
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from 'fastify';
import { ZodError } from 'zod';

import { PollModuleException } from '../../core/exceptions/pollModule.exception.js';

interface FastifyValidationIssue {
    instancePath?: string;
    message?: string;
}

interface FastifyValidationError extends Error {
    statusCode: number;
    validation: FastifyValidationIssue[];
    validationContext?: string;
}

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

            if (isFastifyValidationError(error)) {
                return reply.status(400).send({
                    message: 'Request validation failed.',
                    issues: error.validation.map((issue) => ({
                        path: buildValidationPath(
                            error.validationContext,
                            issue.instancePath,
                        ),
                        message: issue.message ?? 'Invalid value.',
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

const isFastifyValidationError = (
    error: Error,
): error is FastifyValidationError => {
    const candidate = error as Partial<FastifyValidationError>;

    return candidate.statusCode === 400 && Array.isArray(candidate.validation);
};

const buildValidationPath = (
    context: string | undefined,
    instancePath: string | undefined,
): string => {
    const normalizedInstancePath =
        instancePath
            ?.split('/')
            .filter((segment) => segment.length > 0)
            .join('.') ?? '';

    if (!context) {
        return normalizedInstancePath || 'request';
    }

    return normalizedInstancePath
        ? `${context}.${normalizedInstancePath}`
        : context;
};
