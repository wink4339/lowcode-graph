
import { event } from '@alilc/lowcode-engine';
import { IRequest } from './types';
import { requestHandlers } from './decorators';
import "./decorators"
import "./handlers"

event.on(`common:request`, (options: IRequest) => {
    const handler = requestHandlers[options.type];
    if (handler) {
        handler(options);
    } else {
        console.error(`Unknown request type (${options.type})`);
    }
})