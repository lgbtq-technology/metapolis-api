const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(path.resolve(__dirname, req.params.team, req.params.user, req.params.file)).pipe(res);
    next();
};
