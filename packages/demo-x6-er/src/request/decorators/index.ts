import { IRequest } from "../types";

export const requestHandlers: Record<string, (options: IRequest) => void> = {};

export function RequestHandler() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const symbol = target.constructor.symbol
        if (!symbol) {
            console.error(`Class instance not setting static symbol property`)
            return
        }
        const type = `${symbol}.${propertyKey}`
        requestHandlers[type] = descriptor.value
    }
}