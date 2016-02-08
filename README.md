# NodeBackend for Angular2

Now you can make ajax requests on node.

## Setup

1. Install the package

        $ npm install --save angular2-http-node_backend


2. Provide a custom `Http` instance which uses `NodeBackend`

        import { NodeBackend } from 'angular2-http-node_backend';
        
        bootstrap(App, [
          HTTP_PROVIDERS,
          provide(NodeBackend, { useFactory: (respOpt) => new NodeBackend(respOpt), deps: [ResponseOptions]}),
          provide(Http, {useFactory: (backend, options) => {
            return new Http(backend, options);
          }, deps: [NodeBackend, RequestOptions]})
        ])
            
3. Profit