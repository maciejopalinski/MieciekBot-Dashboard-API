import { Response } from 'express'

export class Error {
    private _status: number = 200;
    private _ok: boolean = true;
    private _message: object;

    constructor(status: number = 200, message: string | object = { message: '' }) {
        if(typeof message == 'string') message = { message };

        this.status = status;
        this.message = message;
    }

    set status(status: number) {
        this._status = status;
        this._ok = status == 200;
    }
    
    set message(message: object) {
        this._message = message;
    }
    
    get status() {
        return this._status;
    }

    get ok() {
        return this._ok;
    }

    get message() {
        return this._message;
    }

    valueOf() {
        return { code: this.status, ...this.message };
    }

    send(res: Response) {
        return res.status(this.status).send(this.valueOf());
    }
}