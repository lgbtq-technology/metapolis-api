const P = require('bluebird');
const auth = require('./lib/auth');
const crypto = require('crypto');
const fse = require('fs-extra-promise');
const os = require('os');
const path = require('path');
const restify = require('restify');
const addResizedImages = require('./lib/add-resized-images');

module.exports = function config(opts) {
  opts = opts || {};

  const root = opts.root || __dirname;

  return [
    restify.bodyParser({
      maxBodySize: 0,
      mapParams: true,
      mapFiles: true,
      keepExtensions: true,
      uploadDir: opts.tmpDir || os.tmpdir(),
      multiples: true,
      hash: 'sha1'
    }),
    upload
  ]

  async function upload(req, res, next) {
    try {
      const tok = await auth(req);
      if (!tok) return next(new Error("no token"));
      const absdir = path.resolve(root, tok.team_id, tok.user_id);
      const dir = path.relative(root, absdir);

      await fse.mkdirsAsync(absdir)

      const metas = await P.map(Object.keys(req.files), async key => {
        const file = req.files[key]
        const newname = crypto.randomBytes(4).toString('hex').toUpperCase();
        const ext = extFor(file.type);

        const baseurl = `/-/files/${dir}/${newname}`;

        await fse.moveAsync(file.path, path.resolve(absdir, `${newname}.${ext}`));

        const meta = await addResizedImages({
          user: tok.user_id,
          team: tok.team_id,
          file: newname,
          name: req.params.title || file.name,
          type: file.type,
          unfurl: req.params.unfurl == 'true',
          path: `${baseurl}.${ext}`
        }, root);

        await fse.writeJsonAsync(path.resolve(absdir,`${newname}.json`), meta);

        return meta;
      })

      res.send(metas)

      next();
    } catch(e) {
      next(e);
    }
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

