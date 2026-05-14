import { PollEntity } from '../entities/poll.entity.js';
import { PollStatus } from '../enum/pollStatus.enum.js';

export interface CreatePollRepositoryInput {
    title: string;
    startDate: Date;
    endDate: Date;
    status: PollStatus;
    options: string[];
}

export interface UpdatePollRepositoryInput {
    pollId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    status: PollStatus;
    options?: string[];
}

export interface RegisterVoteRepositoryInput {
    pollId: string;
    optionId: string;
}

export interface PollRepository {
    create(data: CreatePollRepositoryInput): Promise<PollEntity>;
    findById(pollId: string): Promise<PollEntity | null>;
    update(data: UpdatePollRepositoryInput): Promise<PollEntity>;
    registerVote(data: RegisterVoteRepositoryInput): Promise<PollEntity>;
    delete(pollId: string): Promise<void>;
    findAll(): Promise<PollEntity[]>;
    findByStatus(status: PollStatus): Promise<PollEntity[]>;
}
