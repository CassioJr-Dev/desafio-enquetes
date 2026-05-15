const dateTimeSchema = {
    type: 'string',
    format: 'date-time',
} as const;

const pollStatusSchema = {
    type: 'string',
    enum: ['NOT_STARTED', 'STARTED', 'IN_PROGRESS', 'FINISHED'],
} as const;

const optionResponseSchema = {
    type: 'object',
    properties: {
        optionId: { type: 'string' },
        title: { type: 'string' },
        votesCount: { type: 'integer' },
        pollId: { type: 'string' },
        createdAt: dateTimeSchema,
        updatedAt: dateTimeSchema,
    },
    required: [
        'optionId',
        'title',
        'votesCount',
        'pollId',
        'createdAt',
        'updatedAt',
    ],
} as const;

const voteResponseSchema = {
    type: 'object',
    properties: {
        voteId: { type: 'string' },
        pollId: { type: 'string' },
        optionId: { type: 'string' },
        createdAt: dateTimeSchema,
    },
    required: ['voteId', 'pollId', 'optionId', 'createdAt'],
} as const;

const pollResponseSchema = {
    type: 'object',
    properties: {
        pollId: { type: 'string' },
        title: { type: 'string' },
        startDate: dateTimeSchema,
        endDate: dateTimeSchema,
        status: pollStatusSchema,
        totalVotes: { type: 'integer' },
        options: {
            type: 'array',
            items: optionResponseSchema,
        },
        votes: {
            type: 'array',
            items: voteResponseSchema,
        },
        createdAt: dateTimeSchema,
        updatedAt: dateTimeSchema,
    },
    required: [
        'pollId',
        'title',
        'startDate',
        'endDate',
        'status',
        'totalVotes',
        'options',
        'votes',
        'createdAt',
        'updatedAt',
    ],
} as const;

const pollListResponseSchema = {
    type: 'array',
    items: pollResponseSchema,
} as const;

const validationErrorResponseSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' },
        issues: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    path: { type: 'string' },
                    message: { type: 'string' },
                },
                required: ['path', 'message'],
            },
        },
    },
    required: ['message', 'issues'],
} as const;

const domainErrorResponseSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' },
        error: { type: 'string' },
    },
    required: ['message', 'error'],
} as const;

const internalErrorResponseSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' },
    },
    required: ['message'],
} as const;

const pollVoteOptionSchema = {
    type: 'object',
    properties: {
        optionId: { type: 'string' },
        title: { type: 'string' },
        votesCount: { type: 'integer' },
    },
    required: ['optionId', 'title', 'votesCount'],
} as const;

const pollVoteUpdateSchema = {
    type: 'object',
    properties: {
        type: {
            type: 'string',
            enum: ['poll.vote.snapshot', 'poll.vote.updated'],
        },
        pollId: { type: 'string' },
        totalVotes: { type: 'integer' },
        options: {
            type: 'array',
            items: pollVoteOptionSchema,
        },
        updatedAt: dateTimeSchema,
    },
    required: ['type', 'pollId', 'totalVotes', 'options', 'updatedAt'],
} as const;

const commonErrorResponses = {
    400: {
        description: 'Request validation failed',
        ...validationErrorResponseSchema,
    },
    404: {
        description: 'Resource not found',
        ...domainErrorResponseSchema,
    },
    422: {
        description: 'Business rule violation',
        ...domainErrorResponseSchema,
    },
    500: {
        description: 'Internal server error',
        ...internalErrorResponseSchema,
    },
} as const;

export const createPollRouteSchema = {
    tags: ['Polls'],
    summary: 'Create a poll',
    description: 'Creates a new poll with at least three options.',
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            title: { type: 'string' },
            startDate: dateTimeSchema,
            endDate: dateTimeSchema,
            options: {
                type: 'array',
                minItems: 3,
                items: { type: 'string' },
            },
        },
        required: ['title', 'startDate', 'endDate', 'options'],
    },
    response: {
        201: {
            description: 'Poll created successfully',
            ...pollResponseSchema,
        },
        ...commonErrorResponses,
    },
} as const;

export const listAllPollsRouteSchema = {
    tags: ['Polls'],
    summary: 'List all polls',
    description: 'Returns all registered polls.',
    response: {
        200: {
            description: 'Poll list returned successfully',
            ...pollListResponseSchema,
        },
        500: commonErrorResponses[500],
    },
} as const;

export const listPollsByStatusRouteSchema = {
    tags: ['Polls'],
    summary: 'List polls by status',
    description: 'Returns all polls filtered by status.',
    params: {
        type: 'object',
        additionalProperties: false,
        properties: {
            status: pollStatusSchema,
        },
        required: ['status'],
    },
    response: {
        200: {
            description: 'Filtered poll list returned successfully',
            ...pollListResponseSchema,
        },
        ...commonErrorResponses,
    },
} as const;

export const updatePollRouteSchema = {
    tags: ['Polls'],
    summary: 'Update a poll',
    description:
        'Updates title, dates, status or options of an existing poll.',
    params: {
        type: 'object',
        additionalProperties: false,
        properties: {
            pollId: { type: 'string' },
        },
        required: ['pollId'],
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            title: { type: 'string' },
            startDate: dateTimeSchema,
            endDate: dateTimeSchema,
            status: pollStatusSchema,
            options: {
                type: 'array',
                minItems: 3,
                items: { type: 'string' },
            },
        },
        anyOf: [
            { required: ['title'] },
            { required: ['startDate'] },
            { required: ['endDate'] },
            { required: ['status'] },
            { required: ['options'] },
        ],
    },
    response: {
        200: {
            description: 'Poll updated successfully',
            ...pollResponseSchema,
        },
        ...commonErrorResponses,
    },
} as const;

export const deletePollRouteSchema = {
    tags: ['Polls'],
    summary: 'Delete a poll',
    description: 'Deletes a poll by identifier.',
    params: {
        type: 'object',
        additionalProperties: false,
        properties: {
            pollId: { type: 'string' },
        },
        required: ['pollId'],
    },
    response: {
        204: {
            type: 'null',
            description: 'Poll deleted successfully',
        },
        ...commonErrorResponses,
    },
} as const;

export const registerVoteRouteSchema = {
    tags: ['Votes'],
    summary: 'Register a vote',
    description: 'Registers a vote for a specific poll option.',
    params: {
        type: 'object',
        additionalProperties: false,
        properties: {
            pollId: { type: 'string' },
        },
        required: ['pollId'],
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            optionId: { type: 'string' },
        },
        required: ['optionId'],
    },
    response: {
        201: {
            description: 'Vote registered successfully',
            ...pollResponseSchema,
        },
        ...commonErrorResponses,
    },
} as const;

export const subscribePollVoteUpdatesRouteSchema = {
    tags: ['Votes'],
    summary: 'Subscribe to realtime vote updates',
    description:
        'Upgrades the connection to a WebSocket, sends an initial poll snapshot, and then pushes vote count updates whenever new votes are registered.',
    params: {
        type: 'object',
        additionalProperties: false,
        properties: {
            pollId: { type: 'string' },
        },
        required: ['pollId'],
    },
    response: {
        101: {
            description:
                'WebSocket connection established. The server emits messages shaped like the example schema.',
            ...pollVoteUpdateSchema,
        },
        ...commonErrorResponses,
    },
} as const;
