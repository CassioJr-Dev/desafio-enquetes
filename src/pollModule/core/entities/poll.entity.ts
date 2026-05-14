import { OptionEntity } from './option.entity.js';
import { VoteEntity } from './vote.entity.js';
import { PollStatus } from '../enum/pollStatus.enum.js';

export class PollEntity {
    pollId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    status: PollStatus;
    options: OptionEntity[];
    votes: VoteEntity[];
    createdAt: Date;
    updatedAt: Date;

    constructor(data: PollEntity) {
        Object.assign(this, data);
    }
}
