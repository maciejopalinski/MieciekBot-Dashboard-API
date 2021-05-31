import { Response } from 'express';
import { Error } from '../utils';

export const unauthorized = (res: Response) => {
    return new Error(401, 'Unauthorized').send(res);
}

export const not_found = (res: Response) => {
    return new Error(404, 'Not found').send(res);
}

export const too_many_requests = (res: Response) => {
    return new Error(429, 'Too many requests').send(res);
}

export default {
    unauthorized,
    not_found,
    too_many_requests
}