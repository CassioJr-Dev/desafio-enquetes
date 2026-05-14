import { type FastifyInstance } from 'fastify';

import { PollController } from '../controllers/poll.controller.js';
import {
    createPollRouteSchema,
    deletePollRouteSchema,
    listAllPollsRouteSchema,
    listPollsByStatusRouteSchema,
    registerVoteRouteSchema,
    subscribePollVoteUpdatesRouteSchema,
    updatePollRouteSchema,
} from '../docs/poll.route-schemas.js';

export const registerPollRoutes = (
    app: FastifyInstance,
    controller: PollController,
): void => {
    app.post('/polls', { schema: createPollRouteSchema }, controller.create);
    app.get('/polls', { schema: listAllPollsRouteSchema }, controller.listAll);
    app.get(
        '/polls/status/:status',
        { schema: listPollsByStatusRouteSchema },
        controller.listByStatus,
    );
    app.post(
        '/polls/:pollId/votes',
        { schema: registerVoteRouteSchema },
        controller.registerVote,
    );
    app.get(
        '/polls/:pollId/votes/ws',
        {
            websocket: true,
            schema: subscribePollVoteUpdatesRouteSchema,
        },
        controller.subscribeToVoteUpdates,
    );
    app.put('/polls/:pollId', { schema: updatePollRouteSchema }, controller.update);
    app.delete(
        '/polls/:pollId',
        { schema: deletePollRouteSchema },
        controller.delete,
    );
};
