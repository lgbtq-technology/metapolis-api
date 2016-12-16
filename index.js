"use strict";

require('async-to-gen/register')
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

server.use(restify.CORS());

server.post('/-/login', restify.bodyParser(), require('./login'));
server.get('/-/session/:session', require('./session'));
server.opts('/-/upload', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization');
res.setHeader('Access-Control-Allow-Methods', '*');
  res.send(200)
  next()
})

server.listen(process.env.PORT || 3001, function() {
  console.log('%s listening at %s', server.name, server.url);
});

function upload(req, res, next) {
  console.warn(req.files);
  res.send('ok');
  next();
}
