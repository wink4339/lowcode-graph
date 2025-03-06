import { event } from '@alilc/lowcode-engine';

export const request = (type: string, params: any = undefined) => {
    return new Promise((resolve, reject) => {
        event.emit('request', {
            type: type,
            params,
            success: (res: any) => {
                resolve(res)
            },
            fail: (err: any) => {
                reject(err)
            },
          })
    })
}