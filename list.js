const P = require('bluebird');
const auth = require('./lib/auth');
const path = require('path');
const restify = require('restify');
const errors = require('restify-errors');
const util = require('util');

const readdir = util.promisify(require('fs').readdir);
const readFile = util.promisify(require('fs').readFile);

module.exports = function config(opts) {
  opts = opts || {};

  const root = opts.root || __dirname;

  return [
    restify.plugins.queryParser(),
    list
  ];

  async function list(req, res, next) {
    try {
      const tok = await auth(req);
      if (!tok) return next(new Error("no token"));

      if (tok.user_id != req.query.user || !req.query.user) return res.send(new errors.ForbiddenError("Access denied"));

      const absdir = path.resolve(root, tok.team_id, req.query.user);

      const files = await P.all((await readdir(absdir))
        .filter(e => /[.]json$/.test(e))
        .map(e => readFile(path.resolve(absdir, e)).then(JSON.parse)));

      res.send({
        files
      });

      next();
    } catch(e) {
      next(e);
    }
  }
}
