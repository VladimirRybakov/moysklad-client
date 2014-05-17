/**
 * Default Http request provider factory
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , HttpClient = require('httpclient').HttpClient
  , callbackAdapter = require('./../../../tools/callbackAdapter');

var fetch = function () {

    return {

        fetch: function (options, callback) {

            var _options = {
                contentType: 'application/x-www-form-urlencoded',
                method: 'GET',
                async: false
            };
            _.extend(_options, options);

            var httpClient = new HttpClient({
                method: _options.method,
                url: _options.url
            });

            var response, err;

            httpClient.setHeader('Content-Type', _options.contentType);

            _.forOwn(_options.headers, function (value, key) {
                httpClient.setHeader(key, value);
            });

            try {
                if (_options.payload) httpClient.write(_options.payload);
                var httpResponse = httpClient.connect().read();
            }
            catch (e) {
                err = {
                    code: 'HttpClient Error',
                    message: e
                };
            }

            if (!err) {
                response = {
                    headers:        httpResponse.headers,
                    contentText:    httpResponse.body.read().decodeToString(),
                    responseCode:   httpResponse.status
                };
            }

            var result = {
                response: response,
                request: _options
            };

            return callbackAdapter(err, result, callback);
        }
    }
};

module.exports = fetch;