const fs = require('fs');
const path = require('path');
const pump = require('pump');
const metadataForImage = require('./metadata').metadataForImage;
const extFor = require('./lib/ext-for-type');

const bad = /[^A-Z0-9.]/i;
const filename = /^([A-Z0-9]+)(-(\d+x\d+))?(\.[a-z]+)?$/i;

module.exports = function (opts) {
    opts = opts || {};

    const root = opts.root || __dirname;
    return async (req, res, next) => {
        try {
            const m = filename.exec(req.params.file);
            if (bad.test(req.params.team) || bad.test(req.params.user) || !m) {
                throw new Error("Bad path");
            }
            const file = m[1];
            const size = m[3];
            const dir = path.resolve(root, req.params.team, req.params.user)
            const metadata = await metadataForImage(file, root, req.params.team, req.params.user);
            if (size) {
                res.setHeader('Content-Type', 'image/jpeg');
                pump(fs.createReadStream(path.resolve(dir, `${file}-${size}.jpeg`)), res, next);
            } else {
                res.setHeader('Content-Type', metadata.type);
                const ext = extFor(metadata.type);
                pump(fs.createReadStream(path.resolve(dir, `${file}.${ext}`)), res, next);
            }
        } catch (e) {
            next(e);
        }
    };
};
