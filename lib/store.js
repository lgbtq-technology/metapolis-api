const crypto = require('crypto');
const redis = require('@npmcorp/redis-pool');

module.exports = {
    async new(data) {
        const id = crypto.randomBytes(16).toString('hex');;

        await redis.withConnection(conn => {
            return conn.setAsync(id, JSON.stringify(data))
        })

        return id;
    },

    async get(id) {
        return await redis.withConnection(async conn => {
            const data = await conn.getAsync(id);
            return JSON.parse(data)
        })
    },

    async destroy(id) {
        return await redis.withConnection(conn => {
            return conn.delAsync(id);
        });
    }
}
