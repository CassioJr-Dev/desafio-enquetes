import { PollStatus } from '../enum/pollStatus.enum.js';

export class PollEntity {
    pollId: string;
    title: Date;
    endDate: Date;
    status: PollStatus;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: PollEntity) {
        Object.assign(this, data);
    }
}
