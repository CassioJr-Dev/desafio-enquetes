export class OptionEntity {
    optionId: string;
    title: string;
    votesCount: number;
    pollId: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: OptionEntity) {
        Object.assign(this, data);
    }
}
