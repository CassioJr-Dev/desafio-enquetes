import { PollModuleException } from './pollModule.exception.js';

export class BusinessRuleViolationException extends PollModuleException {
    constructor(message: string) {
        super(message, 422);
    }
}
