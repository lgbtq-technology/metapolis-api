const P = require('bluebird');
const path = require('path');
const sharp = require('sharp');
const extFor = require('./ext-for-type');
const util = require('util');
const readFile = util.promisify(require('fs').readFile);

const TARGETSIZES = [
  { w: 256, h: 256 },
  { w: 1000, h: 1000 }
];

async function addResizedImages(meta, root) {
  meta = await meta;
  root = await root;

  const absdir = path.resolve(root, meta.team, meta.user);
  const dir = path.relative(root, absdir);
  const ext = extFor(meta.type);
  const file = path.resolve(absdir, `${meta.file}.${ext}`);
  const image = readFile(file);
  const baseurl = `/-/files/${dir}/${meta.file}`;
  const basename = path.resolve(absdir, meta.file);
  const sizes = P.reduce(TARGETSIZES, async (out, {w, h}) => {
    if (!out[`${w}x${h}`]) {
      const filename = `${basename}-${w}x${h}.jpeg`;
      const fileurl = `${baseurl}-${w}x${h}.jpeg`;
      await sharp(await image)
              .resize(w, null)
              .toFormat('jpeg')
              .toFile(filename);
      out[`${w}x${h}`] = fileurl;
    }

    return out;
  }, {});

  meta.sizes = await sizes;
  return meta;
}

module.exports = addResizedImages;
