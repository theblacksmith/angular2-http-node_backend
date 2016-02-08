import { Connection, ConnectionBackend, ReadyState, Request, Response, ResponseOptions } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
export declare class NodeConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: Observable<Response>;
    constructor(req: Request, baseResponseOptions?: ResponseOptions);
}
export declare class NodeBackend implements ConnectionBackend {
    private _baseResponseOptions;
    constructor(_baseResponseOptions: ResponseOptions);
    createConnection(request: Request): NodeConnection;
}
