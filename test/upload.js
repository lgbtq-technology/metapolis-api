"use strict";

require('redis-mock');
require.cache[require.resolve('redis')] = require.cache[require.resolve('redis-mock')];

const FormData = require('form-data');
const P = require('bluebird');
const fetch = require('node-fetch');
const fs = require('fs-extra-promise');
const os = require('os');
const path = require('path');
const pool = require('@npmcorp/redis-pool');
const restify = require('restify');
const restifyFixture = require('restify-test-fixture');
const tap = require('tap');
const upload = require('../upload')
const withFixtures = require('with-fixtures');

P.promisifyAll(restify.JsonClient.prototype);

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

    form.append('file-1', fs.createReadStream(path.resolve(__dirname, 'test.jpg')));
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

    const copied = await fs.readFileAsync(path.resolve(root, 'TTEST', 'UTEST', metadata[0].file + '.jpeg'))

    t.ok(copied.equals(await fs.readFileAsync(path.resolve(__dirname, 'test.jpg'))), 'file data is the same');
    t.ok(fs.readJsonAsync(path.resolve(root, 'TTEST', 'UTEST', metadata[0].file + '.json')), 'metadata file is JSON');
  });
})

tap.test('teardown', async () => {
  await pool.drain()
  pool.clear();
});

async function tempdirFixture() {
  const dir = await fs.mkdtempAsync(os.tmpdir());
  return {
    done: () => fs.remove(dir),
    dir
  };
}
