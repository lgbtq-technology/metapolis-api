const fse = require('fs-extra-promise');
const path = require('path');
const addResizedImages = require('./lib/add-resized-images');

module.exports = function (opts) {
    opts = opts || {};

    const root = opts.root || __dirname;
    return async (req, res, next) => {
        try {
            const bad = /[^A-Z0-9.]/i;
            if (bad.test(req.params.team) || bad.test(req.params.user) || bad.test(req.params.file)) {
                throw new Error("Bad path");
            }
            const dir = path.resolve(__dirname, req.params.team, req.params.user)
            const file = req.params.file;
            const metadata = await addResizedImages(fse.readJsonAsync(path.resolve(dir, file + '.json')), root);
            res.json(metadata);
        } catch (e) {
            next(e);
        }
    };
};

module.exports.metadataForImage = async function metadataForImage(dir, file) {
    dir = path.normalize(dir);
    file = path.normalize(path.resolve(dir, file));
    if (file.indexOf(dir) != 0) throw new Error(`${file} not within ${dir}`);
    const metadata = await fse.readJsonAsync(path.resolve(dir, path.basename(file, path.extname(file))) + '.json');
    return metadata;
}
