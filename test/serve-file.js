"use strict";

require('redis-mock');
require.cache[require.resolve('redis')] = require.cache[require.resolve('redis-mock')];

const fetch = require('node-fetch');
const fs = require('fs-extra-promise');
const path = require('path');
const pool = require('@npmcorp/redis-pool');
const restifyFixture = require('restify-test-fixture');
const tap = require('tap');
const serveFile = require('../serve-file')
const withFixtures = require('with-fixtures');
const { tempdirFixture } = require('mixed-fixtures');

tap.test('serve-file handler', async t => {

  const rootFixture = tempdirFixture();
  const filesFixture = testImageFixture(rootFixture);

  /*
  const handler = serveFile({
    root
  })
  */

  const handler = serveFile;

  const s = restifyFixture(server => {
    server.get('/-/files/:team/:user/:file', handler);
  });

  await withFixtures([
    s,
    filesFixture,
    rootFixture
  ], async () => {
    const url = (await s).url + '/-/files/TTEST/UTEST/test.png';

    await pool.withConnection(c => c.setAsync('deadbeef', JSON.stringify({
      team_id: 'TTEST',
      user_id: 'UTEST'
    })));

    const res = await fetch(url, {
      method: 'GET',
      headers: Object.assign({
	'Authorization': 'Token: deadbeef'
      })
    });

    t.equal(res.headers.get('content-type'), 'image/png');
    t.equal(res.status, 200);

    if (res.status != 200) {
      t.equal(await res.json(), null);
    }
  });
})

tap.test('teardown', async () => {
  await pool.drain()
  pool.clear();
});

async function testImageFixture(fixture) {
  const root = await (await fixture).dir;
  const dir = path.join(root, 'TTEST', 'UTEST');
  const src = path.join(__dirname, 'test.png');
  const dest = path.join(dir, 'test.png');
  const destjson = path.join(dir, 'test.json');

  await fs.mkdirpAsync(dir);

  await Promise.all([
    fs.writeFileAsync(dest, await fs.readFileAsync(src)),
    fs.writeJsonAsync(destjson, {
      user: "UTEST",
      team: "TTEST",
      file: "test",
      name: "test",
      type: "image/png",
      unfurl: true,
      path: "/-/files/TTEST/UTEST/test.png"
    }),
  ])

  return {
    async done() {
      return Promise.all([
	fs.unlinkAsync(dest),
	fs.unlinkAsync(destjson)
      ]);
    }
  };
}
