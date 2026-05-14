export class VoteEntity {
    voteId: string;
    pollId: string;
    optionId: string;
    createdAt: Date;

    constructor(data: VoteEntity) {
        Object.assign(this, data);
    }
}
