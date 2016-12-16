const store = {};
const crypto = require('crypto');

module.exports = {
    async new(data) {
        const id = crypto.randomBytes(16).toString('hex');;
        store[id] = data;
        return id;
    },

    async get(id) {
        return store[id];
    },

    async destroy(id) {
        delete store[id];
    }
}
