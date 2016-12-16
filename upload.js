const restify = require('restify');
const os = require('os');

module.exports = [
  restify.bodyParser({
    maxBodySize: 0,
    mapParams: true,
    mapFiles: true,
    keepExtensions: true,
    uploadDir: os.tmpdir(),
    multiples: true,
    hash: 'sha1'
  }),
  upload
]

function upload(req, res, next) {
  console.warn(req.files);
  res.send('ok');
  next();
}
