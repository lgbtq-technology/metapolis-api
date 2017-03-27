const fse = require('fs-extra-promise');
const path = require('path');
const pump = require('pump');
const metadataForImage = require('./metadata').metadataForImage;

module.exports = function (opts) {
    opts = opts || {};

    const root = opts.root || __dirname;
    return async (req, res, next) => {
        try {
            const bad = /[^A-Z0-9.]/i;
            if (bad.test(req.params.team) || bad.test(req.params.user) || bad.test(req.params.file)) {
                throw new Error("Bad path");
            }
            const dir = path.resolve(root, req.params.team, req.params.user)
            const file = req.params.file;
            const metadata = await metadataForImage(dir, file);
            res.setHeader('Content-Type', metadata.type);
            pump(fse.createReadStream(path.resolve(dir, file)), res, next);
        } catch (e) {
            next(e);
        }
    };
};
