import { type FastifyReply, type FastifyRequest } from 'fastify';
import { type WebSocket } from 'ws';

import { type CreatePollUseCaseInput } from '../../core/application/useCases/createPoll.useCase.js';
import { type DeletePollUseCaseInput } from '../../core/application/useCases/deletePoll.useCase.js';
import { type EditPollUseCaseInput } from '../../core/application/useCases/editPoll.useCase.js';
import { type GetPollByIdUseCaseInput } from '../../core/application/useCases/getPollById.useCase.js';
import { ListAllPollsUseCase } from '../../core/application/useCases/listAllPolls.useCase.js';
import { type ListByStatusUseCaseInput } from '../../core/application/useCases/listByStatus.useCase.js';
import { type RegisterVoteUseCaseInput } from '../../core/application/useCases/registerVote.useCase.js';
import { PollEntity } from '../../core/entities/poll.entity.js';
import { PollModuleException } from '../../core/exceptions/pollModule.exception.js';
import {
    createPollRequestSchema,
    deletePollRequestSchema,
    listPollsByStatusRequestSchema,
    registerVoteRequestSchema,
    subscribePollVoteUpdatesSchema,
    updatePollRequestSchema,
} from '../schemas/poll.schema.js';
import {
    toPollHttpResponse,
    toPollHttpResponseList,
} from '../presenters/poll.presenter.js';
import { PollRealtimeGateway } from '../realtime/pollRealtime.gateway.js';
import { ZodError } from 'zod';
import { type IUseCase } from '../../core/useCase/default.useCase.js';

interface PollControllerDependencies {
    createPollUseCase: IUseCase<CreatePollUseCaseInput, PollEntity>;
    editPollUseCase: IUseCase<EditPollUseCaseInput, PollEntity>;
    deletePollUseCase: IUseCase<DeletePollUseCaseInput, void>;
    getPollByIdUseCase: IUseCase<GetPollByIdUseCaseInput, PollEntity>;
    listAllPollsUseCase: IUseCase<Record<string, never>, PollEntity[]>;
    listByStatusUseCase: IUseCase<ListByStatusUseCaseInput, PollEntity[]>;
    registerVoteUseCase: IUseCase<RegisterVoteUseCaseInput, PollEntity>;
    pollRealtimeGateway: PollRealtimeGateway;
}

export class PollController {
    constructor(private readonly dependencies: PollControllerDependencies) {}

    readonly create = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<FastifyReply> => {
        const { body } = createPollRequestSchema.parse({
            body: request.body,
        });

        const poll = await this.dependencies.createPollUseCase.execute(body);

        return reply.status(201).send(toPollHttpResponse(poll));
    };

    readonly update = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<FastifyReply> => {
        const { params, body } = updatePollRequestSchema.parse({
            params: request.params,
            body: request.body,
        });

        const poll = await this.dependencies.editPollUseCase.execute({
            pollId: params.pollId,
            ...body,
        });

        return reply.status(200).send(toPollHttpResponse(poll));
    };

    readonly delete = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<FastifyReply> => {
        const { params } = deletePollRequestSchema.parse({
            params: request.params,
        });

        await this.dependencies.deletePollUseCase.execute({
            pollId: params.pollId,
        });

        return reply.status(204).send();
    };

    readonly listAll = async (
        _request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<FastifyReply> => {
        const polls = await this.dependencies.listAllPollsUseCase.execute({});

        return reply.status(200).send(toPollHttpResponseList(polls));
    };

    readonly listByStatus = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<FastifyReply> => {
        const { params } = listPollsByStatusRequestSchema.parse({
            params: request.params,
        });

        const polls = await this.dependencies.listByStatusUseCase.execute({
            status: params.status,
        });

        return reply.status(200).send(toPollHttpResponseList(polls));
    };

    readonly registerVote = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<FastifyReply> => {
        const { params, body } = registerVoteRequestSchema.parse({
            params: request.params,
            body: request.body,
        });

        const poll = await this.dependencies.registerVoteUseCase.execute({
            pollId: params.pollId,
            optionId: body.optionId,
        });

        this.dependencies.pollRealtimeGateway.broadcastVoteUpdated(poll);

        return reply.status(201).send(toPollHttpResponse(poll));
    };

    readonly subscribeToVoteUpdates = async (
        socket: WebSocket,
        request: FastifyRequest,
    ): Promise<void> => {
        try {
            const { params } = subscribePollVoteUpdatesSchema.parse({
                params: request.params,
            });

            const poll = await this.dependencies.getPollByIdUseCase.execute({
                pollId: params.pollId,
            });

            this.dependencies.pollRealtimeGateway.subscribe(
                params.pollId,
                socket,
                poll,
            );
        } catch (error) {
            socket.send(JSON.stringify(this.mapWebSocketError(error as Error)));
            socket.close(1008);
        }
    };

    private mapWebSocketError(error: Error): {
        type: 'error';
        message: string;
        error: string;
        issues?: { path: string; message: string }[];
    } {
        if (error instanceof ZodError) {
            return {
                type: 'error',
                message: 'Request validation failed.',
                error: 'ZodError',
                issues: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            };
        }

        if (error instanceof PollModuleException) {
            return {
                type: 'error',
                message: error.message,
                error: error.name,
            };
        }

        return {
            type: 'error',
            message: 'Internal server error.',
            error: 'InternalServerError',
        };
    }
}
