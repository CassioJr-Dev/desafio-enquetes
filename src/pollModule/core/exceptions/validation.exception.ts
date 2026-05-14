import { PollModuleException } from './pollModule.exception.js';

export class ValidationException extends PollModuleException {
    constructor(message: string) {
        super(message, 400);
    }
}
