"use strict";

const restify = require('restify');

var server = restify.createServer();

server.post('/-/login', restify.plugins.jsonBodyParser(), require('./login'));

server.get('/-/files/:team/:user/:file', require('./serve-file')({ root: __dirname }));
server.get('/-/metadata/:team/:user/:file', require('./metadata')({ root: __dirname }));

server.get('/-/session/:session', require('./session'));

server.get('/-/files.list', require('./list')());
server.opts('/-/files.list', allowCORS)

server.post('/-/upload', require('./upload')())
server.opts('/-/upload', allowCORS)

function allowCORS(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization');
res.setHeader('Access-Control-Allow-Methods', '*');
  res.send(200)
  next()
}

server.on('after', function (req, res, route, err) {
  if (err) {
    console.warn('error', err);
  }
});

server.listen(process.env.PORT || 3001, function() {
  console.log('%s listening at %s', server.name, server.url);
});
