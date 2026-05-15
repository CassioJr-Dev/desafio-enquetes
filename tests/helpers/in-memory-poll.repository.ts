import { OptionEntity } from '../../src/pollModule/core/entities/option.entity.js';
import { PollEntity } from '../../src/pollModule/core/entities/poll.entity.js';
import { VoteEntity } from '../../src/pollModule/core/entities/vote.entity.js';
import { PollStatus } from '../../src/pollModule/core/enum/pollStatus.enum.js';
import {
    type CreatePollRepositoryInput,
    type PollRepository,
    type RegisterVoteRepositoryInput,
    type UpdatePollRepositoryInput,
} from '../../src/pollModule/core/repositories/poll.repository.js';

export class InMemoryPollRepository implements PollRepository {
    private readonly polls = new Map<string, PollEntity>();
    private pollSequence = 1;
    private optionSequence = 1;
    private voteSequence = 1;

    async create(data: CreatePollRepositoryInput): Promise<PollEntity> {
        const now = new Date();
        const pollId = `poll-${this.pollSequence++}`;
        const options = data.options.map((optionTitle) =>
            new OptionEntity({
                optionId: `option-${this.optionSequence++}`,
                title: optionTitle,
                votesCount: 0,
                pollId,
                createdAt: now,
                updatedAt: now,
            }),
        );

        const poll = new PollEntity({
            pollId,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status,
            options,
            votes: [],
            createdAt: now,
            updatedAt: now,
        });

        this.polls.set(pollId, poll);

        return this.clonePoll(poll);
    }

    async findById(pollId: string): Promise<PollEntity | null> {
        const poll = this.polls.get(pollId);

        return poll ? this.clonePoll(poll) : null;
    }

    async update(data: UpdatePollRepositoryInput): Promise<PollEntity> {
        const currentPoll = this.polls.get(data.pollId);

        if (!currentPoll) {
            throw new Error('Poll not found.');
        }

        const now = new Date();
        const options =
            data.options !== undefined
                ? data.options.map((optionTitle) =>
                      new OptionEntity({
                          optionId: `option-${this.optionSequence++}`,
                          title: optionTitle,
                          votesCount: 0,
                          pollId: data.pollId,
                          createdAt: now,
                          updatedAt: now,
                      }),
                  )
                : currentPoll.options;

        const updatedPoll = new PollEntity({
            ...currentPoll,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status,
            options,
            updatedAt: now,
        });

        this.polls.set(data.pollId, updatedPoll);

        return this.clonePoll(updatedPoll);
    }

    async registerVote(data: RegisterVoteRepositoryInput): Promise<PollEntity> {
        const currentPoll = this.polls.get(data.pollId);

        if (!currentPoll) {
            throw new Error('Poll not found.');
        }

        const now = new Date();
        const updatedOptions = currentPoll.options.map((option) =>
            option.optionId === data.optionId
                ? new OptionEntity({
                      ...option,
                      votesCount: option.votesCount + 1,
                      updatedAt: now,
                  })
                : option,
        );

        const updatedVotes = [
            ...currentPoll.votes,
            new VoteEntity({
                voteId: `vote-${this.voteSequence++}`,
                pollId: data.pollId,
                optionId: data.optionId,
                createdAt: now,
            }),
        ];

        const updatedPoll = new PollEntity({
            ...currentPoll,
            options: updatedOptions,
            votes: updatedVotes,
            updatedAt: now,
        });

        this.polls.set(data.pollId, updatedPoll);

        return this.clonePoll(updatedPoll);
    }

    async delete(pollId: string): Promise<void> {
        this.polls.delete(pollId);
    }

    async findAll(): Promise<PollEntity[]> {
        return Array.from(this.polls.values()).map((poll) =>
            this.clonePoll(poll),
        );
    }

    async findByStatus(status: PollStatus): Promise<PollEntity[]> {
        return Array.from(this.polls.values())
            .filter((poll) => poll.status === status)
            .map((poll) => this.clonePoll(poll));
    }

    private clonePoll(poll: PollEntity): PollEntity {
        return new PollEntity({
            pollId: poll.pollId,
            title: poll.title,
            startDate: new Date(poll.startDate),
            endDate: new Date(poll.endDate),
            status: poll.status,
            options: poll.options.map(
                (option) =>
                    new OptionEntity({
                        optionId: option.optionId,
                        title: option.title,
                        votesCount: option.votesCount,
                        pollId: option.pollId,
                        createdAt: new Date(option.createdAt),
                        updatedAt: new Date(option.updatedAt),
                    }),
            ),
            votes: poll.votes.map(
                (vote) =>
                    new VoteEntity({
                        voteId: vote.voteId,
                        pollId: vote.pollId,
                        optionId: vote.optionId,
                        createdAt: new Date(vote.createdAt),
                    }),
            ),
            createdAt: new Date(poll.createdAt),
            updatedAt: new Date(poll.updatedAt),
        });
    }
}
