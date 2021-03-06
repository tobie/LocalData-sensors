'use strict';

var http = require('http');

var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var logfmt = require('logfmt');
var Promise = require('bluebird');

var config = require('./config');
var routes = require('./routes');


var app = express();

app.set('port', config.port);

app.use(compression());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(routes);

var server = http.createServer(app);

Promise.promisifyAll(server);

exports.start = function start(done) {
  return server.listenAsync(app.get('port')).nodeify(done);
};

exports.stop = function stop() {
  server.close();
};

if (require.main === module) {
  exports.start()
  .then(function () {
    logfmt.log({
      info: true,
      listening: true,
      port: app.get('port')
    });
  }).catch(function (error) {
    logfmt.error(error);
    process.exit(1);
  });
}
