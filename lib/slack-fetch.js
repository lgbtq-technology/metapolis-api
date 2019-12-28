const qs = require('qs');
const fetch = require('node-fetch');

module.exports = function slackFetch(url, args) {
    console.warn('fetching', url, args);
    return fetch(url + "?" + qs.stringify(args)).then(function (res) {
        return res.json()
    }).then(function (body) {
        if (body.ok) return body;
        throw new Error(body.error);
    });
}
