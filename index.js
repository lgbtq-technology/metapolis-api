"use strict";

const restify = require('restify');
const os = require('os');

var server = restify.createServer();

server.use(restify.CORS({
    credentials: true
}));

server.post('/-/upload', restify.bodyParser({
  maxBodySize: 0,
  mapParams: true,
  mapFiles: true,
  keepExtensions: true,
  uploadDir: os.tmpdir(),
  multiples: true,
  hash: 'sha1'
}), upload);

server.listen(process.env.PORT || 3001, function() {
  console.log('%s listening at %s', server.name, server.url);
});

function upload(req, res, next) {
  console.warn(req);
  res.send('ok');
  next();
}
