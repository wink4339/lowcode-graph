export interface IRequest {
    type: string,
    params: any,
    success: Function
    fail: Function
} 