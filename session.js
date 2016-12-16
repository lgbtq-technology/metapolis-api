const store = require('./lib/store');
module.exports = async function (req, res, next) {
    try {
        if (req.params.session) {
            res.json(await store.get(req.params.session));
        }
        next();
    } catch (e) {
        next(e);
    }
};
