import { OptionEntity } from '../../core/entities/option.entity.js';
import { PollEntity } from '../../core/entities/poll.entity.js';
import { VoteEntity } from '../../core/entities/vote.entity.js';

export interface PollHttpResponse {
    pollId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    status: string;
    totalVotes: number;
    options: OptionHttpResponse[];
    votes: VoteHttpResponse[];
    createdAt: Date;
    updatedAt: Date;
}

interface OptionHttpResponse {
    optionId: string;
    title: string;
    votesCount: number;
    pollId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface VoteHttpResponse {
    voteId: string;
    pollId: string;
    optionId: string;
    createdAt: Date;
}

export interface PollVoteUpdateResponse {
    type: 'poll.vote.snapshot' | 'poll.vote.updated';
    pollId: string;
    totalVotes: number;
    options: PollVoteOptionResponse[];
    updatedAt: Date;
}

interface PollVoteOptionResponse {
    optionId: string;
    title: string;
    votesCount: number;
}

export const toPollHttpResponse = (poll: PollEntity): PollHttpResponse => ({
    pollId: poll.pollId,
    title: poll.title,
    startDate: poll.startDate,
    endDate: poll.endDate,
    status: poll.status,
    totalVotes: poll.votes.length,
    options: poll.options.map(toOptionHttpResponse),
    votes: poll.votes.map(toVoteHttpResponse),
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
});

export const toPollHttpResponseList = (
    polls: PollEntity[],
): PollHttpResponse[] => polls.map(toPollHttpResponse);

export const toPollVoteSnapshotResponse = (
    poll: PollEntity,
): PollVoteUpdateResponse => ({
    type: 'poll.vote.snapshot',
    pollId: poll.pollId,
    totalVotes: poll.votes.length,
    options: poll.options.map(toPollVoteOptionResponse),
    updatedAt: poll.updatedAt,
});

export const toPollVoteUpdatedResponse = (
    poll: PollEntity,
): PollVoteUpdateResponse => ({
    type: 'poll.vote.updated',
    pollId: poll.pollId,
    totalVotes: poll.votes.length,
    options: poll.options.map(toPollVoteOptionResponse),
    updatedAt: poll.updatedAt,
});

const toOptionHttpResponse = (option: OptionEntity): OptionHttpResponse => ({
    optionId: option.optionId,
    title: option.title,
    votesCount: option.votesCount,
    pollId: option.pollId,
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
});

const toVoteHttpResponse = (vote: VoteEntity): VoteHttpResponse => ({
    voteId: vote.voteId,
    pollId: vote.pollId,
    optionId: vote.optionId,
    createdAt: vote.createdAt,
});

const toPollVoteOptionResponse = (
    option: OptionEntity,
): PollVoteOptionResponse => ({
    optionId: option.optionId,
    title: option.title,
    votesCount: option.votesCount,
});
