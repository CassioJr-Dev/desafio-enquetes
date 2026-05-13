export class VoteEntity {
    voteId: string;
    pollId: string;
    optionId: string;
    updatedAt: Date;

    constructor(data: VoteEntity) {
        Object.assign(this, data);
    }
}
