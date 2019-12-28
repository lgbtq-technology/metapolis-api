"use strict";

require('redis-mock');
require.cache[require.resolve('redis')] = require.cache[require.resolve('redis-mock')];

const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const pool = require('@npmcorp/redis-pool');
const restifyFixture = require('restify-test-fixture');
const tap = require('tap');
const upload = require('../upload')
const withFixtures = require('with-fixtures');
const { tempdirFixture } = require('mixed-fixtures');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);

tap.test('upload handler', async t => {

  const rootFixture = tempdirFixture();
  const root = (await rootFixture).dir;

  const handler = upload({
    root
  })

  const s = restifyFixture(server => {
    server.post('/', handler);
  });

  await withFixtures([
    s,
    rootFixture
  ], async () => {
    const url = (await s).url
    const form = new FormData();

    await pool.withConnection(c => c.setAsync('deadbeef', JSON.stringify({
      team_id: 'TTEST',
      user_id: 'UTEST'
    })));

    form.append('file-1', fs.createReadStream(path.resolve(__dirname, 'test.png')));
    form.append('unfurl', 'false');
    form.append('title', 'Test 123');

    const metadata = await (await fetch(url, {
      method: 'POST',
      body: form,
      headers: Object.assign({
	'Authorization': 'Token: deadbeef'
      }, form.getHeaders())
    })).json();

    t.ok(Array.isArray(metadata), 'metadata is an array');
    t.equal(metadata.length, 1, 'metadata has one entry');

    const copied = readFile(path.resolve(root, 'TTEST', 'UTEST', metadata[0].file + '.png'))
    const original = readFile(path.resolve(__dirname, 'test.png'))
    const filemetadata = readFile(path.resolve(root, 'TTEST', 'UTEST', metadata[0].file + '.json')).then(JSON.parse)

    t.ok((await copied).equals(await original), 'file data is the same');
    t.ok(await filemetadata, 'metadata file is JSON');

    t.ok(await exists(u2p(metadata[0].sizes['256x256'])), '256x256 thumbnail exists');
    t.ok(await exists(u2p(metadata[0].sizes['1000x1000'])), '1000x1000 image exists');

    function u2p(url) {
      return url.replace('/-/files', root);
    }
  });
})


tap.test('teardown', async () => {
  await pool.drain()
  pool.clear();
});
