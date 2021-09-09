import { Response } from 'express';
import { Error } from '../utils';

export const bad_request = (res: Response) => {
    return new Error(400, 'Bad Request').send(res);
}

export const unauthorized = (res: Response) => {
    return new Error(401, 'Unauthorized').send(res);
}

export const not_found = (res: Response) => {
    return new Error(404, 'Not Found').send(res);
}

export const too_many_requests = (res: Response) => {
    return new Error(429, 'Too Many Requests').send(res);
}

export default {
    unauthorized,
    not_found,
    too_many_requests,
    bad_request
}