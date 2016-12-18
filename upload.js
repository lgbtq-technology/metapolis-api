const P = require('bluebird');
const auth = require('./lib/auth');
const crypto = require('crypto');
const fse = require('fs-extra-promise');
const os = require('os');
const path = require('path');
const restify = require('restify');

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

async function upload(req, res, next) {
  try {
    const tok = await auth(req);
    if (!tok) return next(new Error("no token"));
    const absdir = path.resolve(tok.team_id, tok.user_id);
    const dir = path.relative(__dirname, absdir);

    await fse.mkdirsAsync(dir)

    res.send(await P.map(Object.keys(req.files), key => {
      const file = req.files[key]
      const newname = `${crypto.randomBytes(4).toString('hex').toUpperCase()}.${extFor(file.type)}`;
      return fse.moveAsync(file.path, path.resolve(absdir, newname)).then(() => ({ path: `/-/files/${dir}/${newname}`, name: file.name }))
    }))

    next();
  } catch(e) {
    next(e);
  }
}

function extFor(type) {
  const m = /^image\/(.*)/.exec(type)
  if (m) {
    return m[1];
  } else {
    throw new Error(`${type} is not a recognized type`);
  }
}
