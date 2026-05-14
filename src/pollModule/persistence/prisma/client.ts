import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { ValidationException } from '../../core/exceptions/validation.exception.js';

export { PrismaClient };

export type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];
export type PrismaClientInstance = InstanceType<typeof PrismaClient>;

export const createPrismaClient = (
    options: PrismaClientOptions,
): PrismaClientInstance => new PrismaClient(options);

export const createPrismaClientFromDatabaseUrl = (
    databaseUrl = process.env.DATABASE_URL,
): PrismaClientInstance => {
    if (!databaseUrl) {
        throw new ValidationException('DATABASE_URL is required.');
    }

    return createPrismaClient({
        adapter: new PrismaPg(databaseUrl),
    });
};
