"use strict";

const slackFetch = require('./lib/slack-fetch');
const store = require('./lib/store');

const client_id = process.env.SLACK_APP_CLIENT_ID;
const client_secret = process.env.SLACK_APP_CLIENT_SECRET;

if (!client_id || !client_secret) {
  throw "SLACK_APP_CLIENT_ID and SLACK_APP_CLIENT_SECRET must be set to operate";
}

module.exports = async function (req, res, next) {
  try {
    if (req.params.code) {
      const body = await slackFetch('https://slack.com/api/oauth.access', Object.assign({
        client_id,
        client_secret,
        code: req.params.code
      }, req.params.redirect_uri ? { redirect_uri: req.params.redirect_uri } : {}));

      if (!body.access_token) {
        throw new Error("No access token granted");
      }
       
      const sid = await store.new(body);

      res.send({ token: body, sid });
      next();
    } else {
      throw new Error("No code supplied");
    }
  } catch(e) {
    next(e);
  }
};
