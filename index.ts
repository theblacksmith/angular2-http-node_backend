import {
  Connection,
  ConnectionBackend,
  Headers,
  ReadyState,
  Request,
  RequestMethod,
  Response,
  ResponseOptions,
  ResponseType
} from 'angular2/http';
import * as utils from 'angular2/src/http/http_utils';
import {isPresent} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as http from 'http';
import * as url from 'url';

export class NodeConnection implements Connection {
  public readyState: ReadyState;
  public request: Request;
  public response: Observable<Response>;

  constructor(req: Request, baseResponseOptions?: ResponseOptions) {
    this.request = req;

    let reqInfo: any = url.parse(req.url);
    reqInfo.method = RequestMethod[req.method].toUpperCase();

    if (isPresent(req.headers)) {
      reqInfo.headers = {};
      req.headers.forEach((values, name) => reqInfo.headers[name] = values.join(','));
    }

    this.response = new Observable(responseObserver => {
      let nodeReq = http.request(reqInfo, (res: http.IncomingMessage) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);

        let status = res.statusCode;
        let headers = new Headers(res.headers);
        let url = res.url;

        res.on('end', () => {
          let responseOptions = new ResponseOptions({body, status, headers, url});
          let response = new Response(responseOptions);

          if (utils.isSuccess(status)) {
            responseObserver.next(response);
            responseObserver.complete();
            return;
          }
          responseObserver.error(response);
        });
      });

      let onError = (err) => {
        let responseOptions = new ResponseOptions({body: err, type: ResponseType.Error});
        if (isPresent(baseResponseOptions)) {
          responseOptions = baseResponseOptions.merge(responseOptions);
        }
        responseObserver.error(new Response(responseOptions));
      };

      nodeReq.on('error', onError);

      nodeReq.write(req.text());
      nodeReq.end();

      return () => {
        nodeReq.removeListener('error', onError);
        nodeReq.abort();
      };
    });
  }
}

/**
 * Creates {@link NodeConnection} instances.
 *
 * This class provides a custom backend implementation you can pass to
 * {@link Http} to use when running angular on the server.
 *
 * ### Example
 *
 * ```
 * import {Http, HTTP_PROVIDERS, BaseRequestOptions} from 'angular2/http';
 * import {NodeBackend} from 'angular2-http-node_backend';
 * @Component({
 *   viewProviders: [
 *     HTTP_PROVIDERS,
 *     provide(Http, {useFactory: (backend, options) => {
 *       return new Http(backend, options);
 *     }, deps: [NodeBackend, BaseRequestOptions]})]
 * })
 * class MyComponent {
 *   constructor(http:Http) {
 *     http.request('people.json').subscribe(res => this.people = res.json());
 *   }
 * }
 * ```
 *
 **/
@Injectable()
export class NodeBackend implements ConnectionBackend {
  constructor(private _baseResponseOptions: ResponseOptions) {}
  public createConnection(request: Request): NodeConnection {
    return new NodeConnection(request, this._baseResponseOptions);
  }
}
