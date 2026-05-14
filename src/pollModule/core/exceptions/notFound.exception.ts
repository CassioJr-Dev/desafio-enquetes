import { PollModuleException } from './pollModule.exception.js';

export class NotFoundException extends PollModuleException {
    constructor(message: string) {
        super(message, 404);
    }
}
