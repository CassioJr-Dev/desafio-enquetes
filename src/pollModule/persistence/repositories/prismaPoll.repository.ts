import { randomUUID } from 'node:crypto';

import { PollEntity } from '../../core/entities/poll.entity.js';
import { OptionEntity } from '../../core/entities/option.entity.js';
import { VoteEntity } from '../../core/entities/vote.entity.js';
import { PollStatus } from '../../core/enum/pollStatus.enum.js';
import {
    type CreatePollRepositoryInput,
    type PollRepository,
    type RegisterVoteRepositoryInput,
    type UpdatePollRepositoryInput,
} from '../../core/repositories/poll.repository.js';
import { type PrismaClientInstance } from '../prisma/client.js';
import { PollStatus as PrismaPollStatus } from '../../../../generated/prisma/enums.js';
import type { PollGetPayload } from '../../../../generated/prisma/models/Poll.js';

type PrismaPollWithRelations = PollGetPayload<{
    include: {
        options: true;
        votes: true;
    };
}>;

export class PrismaPollRepository implements PollRepository {
    constructor(private readonly prisma: PrismaClientInstance) {}

    private readonly pollInclude = {
        options: {
            orderBy: {
                createdAt: 'asc',
            },
        },
        votes: {
            orderBy: {
                createdAt: 'asc',
            },
        },
    } as const;

    async create(data: CreatePollRepositoryInput): Promise<PollEntity> {
        const now = new Date();

        const poll = await this.prisma.poll.create({
            data: {
                pollId: randomUUID(),
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status as unknown as PrismaPollStatus,
                createdAt: now,
                updatedAt: now,
                options: {
                    create: data.options.map((optionTitle) => ({
                        optionId: randomUUID(),
                        title: optionTitle,
                        votesCount: 0,
                        createdAt: now,
                        updatedAt: now,
                    })),
                },
            },
            include: this.pollInclude,
        });

        return this.toEntity(poll);
    }

    async findById(pollId: string): Promise<PollEntity | null> {
        const poll = await this.prisma.poll.findUnique({
            where: {
                pollId,
            },
            include: this.pollInclude,
        });

        return poll ? this.toEntity(poll) : null;
    }

    async update(data: UpdatePollRepositoryInput): Promise<PollEntity> {
        const now = new Date();

        const poll = await this.prisma.poll.update({
            where: {
                pollId: data.pollId,
            },
            data: {
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status as unknown as PrismaPollStatus,
                updatedAt: now,
                ...(data.options !== undefined
                    ? {
                          options: {
                              deleteMany: {},
                              create: data.options.map((optionTitle) => ({
                                  optionId: randomUUID(),
                                  title: optionTitle,
                                  votesCount: 0,
                                  createdAt: now,
                                  updatedAt: now,
                              })),
                          },
                      }
                    : {}),
            },
            include: this.pollInclude,
        });

        return this.toEntity(poll);
    }

    async registerVote(data: RegisterVoteRepositoryInput): Promise<PollEntity> {
        await this.prisma.$transaction([
            this.prisma.vote.create({
                data: {
                    voteId: randomUUID(),
                    pollId: data.pollId,
                    optionId: data.optionId,
                    createdAt: new Date(),
                },
            }),
            this.prisma.option.update({
                where: {
                    optionId: data.optionId,
                },
                data: {
                    votesCount: {
                        increment: 1,
                    },
                },
            }),
        ]);

        const updatedPoll = await this.prisma.poll.findUniqueOrThrow({
            where: {
                pollId: data.pollId,
            },
            include: this.pollInclude,
        });

        return this.toEntity(updatedPoll);
    }

    async delete(pollId: string): Promise<void> {
        await this.prisma.poll.delete({
            where: {
                pollId,
            },
        });
    }

    async findAll(): Promise<PollEntity[]> {
        const polls = await this.prisma.poll.findMany({
            include: this.pollInclude,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return polls.map((poll) => this.toEntity(poll));
    }

    async findByStatus(status: PollStatus): Promise<PollEntity[]> {
        const polls = await this.prisma.poll.findMany({
            where: {
                status: status as unknown as PrismaPollStatus,
            },
            include: this.pollInclude,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return polls.map((poll) => this.toEntity(poll));
    }

    private toEntity(poll: PrismaPollWithRelations): PollEntity {
        return new PollEntity({
            pollId: poll.pollId,
            title: poll.title,
            startDate: poll.startDate,
            endDate: poll.endDate,
            status: poll.status as unknown as PollStatus,
            options: poll.options.map(
                (option) =>
                    new OptionEntity({
                        optionId: option.optionId,
                        title: option.title,
                        votesCount: option.votesCount,
                        pollId: option.pollId,
                        createdAt: option.createdAt,
                        updatedAt: option.updatedAt,
                    }),
            ),
            votes: poll.votes.map(
                (vote) =>
                    new VoteEntity({
                        voteId: vote.voteId,
                        pollId: vote.pollId,
                        optionId: vote.optionId,
                        createdAt: vote.createdAt,
                    }),
            ),
            createdAt: poll.createdAt,
            updatedAt: poll.updatedAt,
        });
    }
}
