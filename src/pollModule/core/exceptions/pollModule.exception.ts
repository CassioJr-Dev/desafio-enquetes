export abstract class PollModuleException extends Error {
    readonly statusCode: number;

    protected constructor(message: string, statusCode: number) {
        super(message);

        this.name = new.target.name;
        this.statusCode = statusCode;
    }
}
