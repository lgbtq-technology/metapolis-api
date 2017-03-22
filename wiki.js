const P = require('bluebird');
const auth = require('./lib/auth');
const fse = require('fs-extra-promise');
const path = require('path');
const restify = require('restify');

module.exports = function config(opts) {
  opts = opts || {};

  const root = opts.root || __dirname;

  return [
    restify.queryParser(),
    list
  ];

  async function list(req, res, next) {
    try {
      const tok = await auth(req);
      if (!tok) return next(new Error("no token"));

      if (tok.user_id != req.query.user || !req.query.user) return res.send(new restify.ForbiddenError("Access denied"));

      const absdir = path.resolve(root, tok.team_id, req.query.user);

      const files = await P.all((await fse.readdirAsync(absdir))
        .filter(e => /[.]json$/.test(e))
        .map(e => fse.readJsonAsync(path.resolve(absdir, e))));

      res.send({
        files
      });

      next();
    } catch(e) {
      next(e);
    }
  }
}
