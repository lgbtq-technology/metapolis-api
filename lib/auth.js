const store = require('./store');

module.exports = function (req) {
    const token = req.headers.authorization.split(' ')[1];
    return store.get(token);
}
