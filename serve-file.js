const fse = require('fs-extra-promise');
const path = require('path');

module.exports = async (req, res, next) => {
    try {
        const bad = /[^A-Z0-9.]/i;
        if (bad.test(req.params.team) || bad.test(req.params.user) || bad.test(req.params.file)) {
            throw new Error("Bad path");
        }
        const dir = path.resolve(__dirname, req.params.team, req.params.user)
        const file = req.params.file;
        const metadata = await fse.readJsonAsync(path.resolve(dir, path.basename(file, path.extname(file))) + '.json');
        res.setHeader('Content-Type', metadata.type);
        fse.createReadStream(path.resolve(dir, file)).pipe(res).on('end', next).on('error', err => next(err));
    } catch (e) {
        next(e);
    }
};
