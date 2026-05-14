import { type FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';

import { CreatePollUseCase } from '../core/application/useCases/createPoll.useCase.js';
import { DeletePollUseCase } from '../core/application/useCases/deletePoll.useCase.js';
import { EditPollUseCase } from '../core/application/useCases/editPoll.useCase.js';
import { GetPollByIdUseCase } from '../core/application/useCases/getPollById.useCase.js';
import { ListAllPollsUseCase } from '../core/application/useCases/listAllPolls.useCase.js';
import { ListByStatusUseCase } from '../core/application/useCases/listByStatus.useCase.js';
import { RegisterVoteUseCase } from '../core/application/useCases/registerVote.useCase.js';
import { type PollRepository } from '../core/repositories/poll.repository.js';
import {
    createPrismaClientFromDatabaseUrl,
    type PrismaClientInstance,
} from '../persistence/prisma/client.js';
import { PrismaPollRepository } from '../persistence/repositories/prismaPoll.repository.js';
import { PollController } from './controllers/poll.controller.js';
import { registerExceptionInterceptor } from './interceptors/exception.interceptor.js';
import { PollRealtimeGateway } from './realtime/pollRealtime.gateway.js';
import { registerPollRoutes } from './routes/poll.routes.js';

export interface RegisterPollModuleOptions {
    pollRepository?: PollRepository;
}

export const registerPollModule = (
    app: FastifyInstance,
    options: RegisterPollModuleOptions = {},
): void => {
    registerExceptionInterceptor(app);
    app.register(websocket);

    let prisma: PrismaClientInstance | null = null;
    let pollRepository = options.pollRepository;

    if (!pollRepository) {
        prisma = createPrismaClientFromDatabaseUrl();
        pollRepository = new PrismaPollRepository(prisma);
    }

    const pollRealtimeGateway = new PollRealtimeGateway();

    const pollController = new PollController({
        createPollUseCase: new CreatePollUseCase(pollRepository),
        editPollUseCase: new EditPollUseCase(pollRepository),
        deletePollUseCase: new DeletePollUseCase(pollRepository),
        getPollByIdUseCase: new GetPollByIdUseCase(pollRepository),
        listAllPollsUseCase: new ListAllPollsUseCase(pollRepository),
        listByStatusUseCase: new ListByStatusUseCase(pollRepository),
        registerVoteUseCase: new RegisterVoteUseCase(pollRepository),
        pollRealtimeGateway,
    });

    app.addHook('onClose', async () => {
        if (prisma) {
            await prisma.$disconnect();
        }
    });

    app.register(async (pollHttpApp) => {
        registerPollRoutes(pollHttpApp, pollController);
    });
};
