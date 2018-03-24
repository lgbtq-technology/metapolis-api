const auth = require('./lib/auth');
import slackFetch from './lib/slack-fetch'

module.exports = function config(opts) {
    opts = opts || {};

    return [share]

    async function share(req, res, next) {
        try {
          const tok = await auth(req);
          if (!tok) return next(new Error("no token"));

          await slackFetch('https://slack.com/api/chat.postMessage', {
            token: tok,
            channel: res.params.channel,
            parse: true,
            as_user: true,
            text: res.params.image_url
          });

          res.send("yay")
        } catch(e) {
            next(e)
        }
    }
}