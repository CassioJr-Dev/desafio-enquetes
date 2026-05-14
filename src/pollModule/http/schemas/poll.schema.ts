import { z } from 'zod';

import { PollStatus } from '../../core/enum/pollStatus.enum.js';

const pollIdSchema = z.string().trim().min(1, 'Poll id is required.');
const pollTitleSchema = z.string().trim().min(1, 'Poll title is required.');
const pollDateSchema = z.coerce.date();
const pollOptionsSchema = z
    .array(z.string().trim().min(1, 'Poll option cannot be empty.'))
    .min(3, 'A poll must have at least 3 options.');

export const createPollRequestSchema = z.object({
    body: z
        .object({
            title: pollTitleSchema,
            startDate: pollDateSchema,
            endDate: pollDateSchema,
            options: pollOptionsSchema,
        })
        .strict(),
});

export const updatePollRequestSchema = z.object({
    params: z
        .object({
            pollId: pollIdSchema,
        })
        .strict(),
    body: z
        .object({
            title: pollTitleSchema.optional(),
            startDate: pollDateSchema.optional(),
            endDate: pollDateSchema.optional(),
            status: z.nativeEnum(PollStatus).optional(),
            options: pollOptionsSchema.optional(),
        })
        .strict()
        .refine(
            (body) =>
                body.title !== undefined ||
                body.startDate !== undefined ||
                body.endDate !== undefined ||
                body.status !== undefined ||
                body.options !== undefined,
            {
                message: 'At least one field must be provided to update a poll.',
            },
        ),
});

export const deletePollRequestSchema = z.object({
    params: z
        .object({
            pollId: pollIdSchema,
        })
        .strict(),
});

export const registerVoteRequestSchema = z.object({
    params: z
        .object({
            pollId: pollIdSchema,
        })
        .strict(),
    body: z
        .object({
            optionId: z.string().trim().min(1, 'Option id is required.'),
        })
        .strict(),
});

export const listPollsByStatusRequestSchema = z.object({
    params: z
        .object({
            status: z.nativeEnum(PollStatus),
        })
        .strict(),
});

export const subscribePollVoteUpdatesSchema = z.object({
    params: z
        .object({
            pollId: pollIdSchema,
        })
        .strict(),
});
