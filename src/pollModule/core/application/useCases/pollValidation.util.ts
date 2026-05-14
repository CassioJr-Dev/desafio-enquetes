import { BusinessRuleViolationException } from '../../exceptions/businessRuleViolation.exception.js';
import { ValidationException } from '../../exceptions/validation.exception.js';
import { PollStatus } from '../../enum/pollStatus.enum.js';

export const normalizePollId = (pollId: string): string => {
    const normalizedPollId = pollId.trim();

    if (!normalizedPollId) {
        throw new ValidationException('Poll id is required.');
    }

    return normalizedPollId;
};

export const normalizePollTitle = (title: string): string => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
        throw new ValidationException('Poll title is required.');
    }

    return normalizedTitle;
};

export const normalizePollOptions = (options: string[]): string[] => {
    const normalizedOptions = options
        .map((option) => option.trim())
        .filter((option) => option.length > 0);

    if (normalizedOptions.length < 3) {
        throw new BusinessRuleViolationException(
            'A poll must have at least 3 options.',
        );
    }

    const duplicatedOptions = findDuplicatedOptions(normalizedOptions);

    if (duplicatedOptions.length > 0) {
        throw new BusinessRuleViolationException(
            'Poll options must be unique.',
        );
    }

    return normalizedOptions;
};

export const parsePollDate = (
    value: Date | string,
    fieldName: string,
): Date => {
    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new ValidationException(`Invalid ${fieldName}.`);
    }

    return parsedDate;
};

export const ensurePollScheduleIsValid = (
    startDate: Date,
    endDate: Date,
): void => {
    if (endDate <= startDate) {
        throw new BusinessRuleViolationException(
            'Poll end date must be later than the start date.',
        );
    }
};

export const ensureValidPollStatus = (status: PollStatus): void => {
    if (!Object.values(PollStatus).includes(status)) {
        throw new ValidationException('Invalid poll status.');
    }
};

const findDuplicatedOptions = (options: string[]): string[] => {
    const normalizedMap = new Map<string, string>();
    const duplicates = new Set<string>();

    for (const option of options) {
        const normalizedOption = option.toLocaleLowerCase();

        if (normalizedMap.has(normalizedOption)) {
            duplicates.add(option);
            continue;
        }

        normalizedMap.set(normalizedOption, option);
    }

    return Array.from(duplicates);
};
