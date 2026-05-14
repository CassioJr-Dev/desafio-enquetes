import type { WebSocket } from 'ws';

import { PollEntity } from '../../core/entities/poll.entity.js';
import {
    toPollVoteSnapshotResponse,
    toPollVoteUpdatedResponse,
} from '../presenters/poll.presenter.js';

export class PollRealtimeGateway {
    private readonly pollSubscribers = new Map<string, Set<WebSocket>>();

    subscribe(pollId: string, socket: WebSocket, currentPoll: PollEntity): void {
        const subscribers = this.pollSubscribers.get(pollId) ?? new Set<WebSocket>();

        subscribers.add(socket);
        this.pollSubscribers.set(pollId, subscribers);

        setTimeout(() => {
            if (socket.readyState === socket.OPEN) {
                socket.send(
                    JSON.stringify(toPollVoteSnapshotResponse(currentPoll)),
                );
            }
        }, 0);

        socket.on('close', () => {
            this.unsubscribe(pollId, socket);
        });
    }

    broadcastVoteUpdated(poll: PollEntity): void {
        const subscribers = this.pollSubscribers.get(poll.pollId);

        if (!subscribers || subscribers.size === 0) {
            return;
        }

        const payload = JSON.stringify(toPollVoteUpdatedResponse(poll));

        for (const subscriber of subscribers) {
            if (subscriber.readyState !== subscriber.OPEN) {
                this.unsubscribe(poll.pollId, subscriber);
                continue;
            }

            subscriber.send(payload);
        }
    }

    private unsubscribe(pollId: string, socket: WebSocket): void {
        const subscribers = this.pollSubscribers.get(pollId);

        if (!subscribers) {
            return;
        }

        subscribers.delete(socket);

        if (subscribers.size === 0) {
            this.pollSubscribers.delete(pollId);
        }
    }
}
