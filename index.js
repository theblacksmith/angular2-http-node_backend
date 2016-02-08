var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var http_1 = require('angular2/http');
var utils = require('angular2/src/http/http_utils');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/operator/map');
var http = require('http');
var url = require('url');
var NodeConnection = (function () {
    function NodeConnection(req, baseResponseOptions) {
        this.request = req;
        var reqInfo = url.parse(req.url);
        reqInfo.method = http_1.RequestMethod[req.method].toUpperCase();
        if (lang_1.isPresent(req.headers)) {
            reqInfo.headers = {};
            req.headers.forEach(function (values, name) { return reqInfo.headers[name] = values.join(','); });
        }
        this.response = new Observable_1.Observable(function (responseObserver) {
            var nodeReq = http.request(reqInfo, function (res) {
                var body = '';
                res.on('data', function (chunk) { return body += chunk; });
                var status = res.statusCode;
                var headers = new http_1.Headers(res.headers);
                var url = res.url;
                res.on('end', function () {
                    var responseOptions = new http_1.ResponseOptions({ body: body, status: status, headers: headers, url: url });
                    var response = new http_1.Response(responseOptions);
                    if (utils.isSuccess(status)) {
                        responseObserver.next(response);
                        responseObserver.complete();
                        return;
                    }
                    responseObserver.error(response);
                });
            });
            var onError = function (err) {
                var responseOptions = new http_1.ResponseOptions({ body: err, type: http_1.ResponseType.Error });
                if (lang_1.isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                responseObserver.error(new http_1.Response(responseOptions));
            };
            nodeReq.on('error', onError);
            nodeReq.write(req.text());
            nodeReq.end();
            return function () {
                nodeReq.removeListener('error', onError);
                nodeReq.abort();
            };
        });
    }
    return NodeConnection;
})();
exports.NodeConnection = NodeConnection;
var NodeBackend = (function () {
    function NodeBackend(_baseResponseOptions) {
        this._baseResponseOptions = _baseResponseOptions;
    }
    NodeBackend.prototype.createConnection = function (request) {
        return new NodeConnection(request, this._baseResponseOptions);
    };
    NodeBackend = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.ResponseOptions])
    ], NodeBackend);
    return NodeBackend;
})();
exports.NodeBackend = NodeBackend;
