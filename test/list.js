"use strict";

require('redis-mock');
require.cache[require.resolve('redis')] = require.cache[require.resolve('redis-mock')];

const P = require('bluebird');
const fetch = require('node-fetch');
const fs = require('fs-extra-promise');
const path = require('path');
const pool = require('@npmcorp/redis-pool');
const restify = require('restify');
const restifyFixture = require('restify-test-fixture');
const tap = require('tap');
const list = require('../list')
const withFixtures = require('with-fixtures');
const { tempdirFixture } = require('mixed-fixtures');

P.promisifyAll(restify.JsonClient.prototype);

tap.test('list handler works', async t => {

  const rootFixture = tempdirFixture();
  const root = (await rootFixture).dir;

  const handler = list({
    root
  })

  await fs.mkdirsAsync(path.resolve(root, 'TTEST', 'UTEST'));

  await fs.writeJsonAsync(path.resolve(root, 'TTEST', 'UTEST', 'F123.json'), {
    name: 'somefile.jpg',
    title: 'test',
    user: 'UTEST',
    id: 'F123'
  });

  const s = restifyFixture(server => {
    server.get('/', handler);
  });

  await withFixtures([
    s,
    rootFixture
  ], async () => {
    const url = (await s).url

    await pool.withConnection(c => c.setAsync('deadbeef', JSON.stringify({
      team_id: 'TTEST',
      user_id: 'UTEST'
    })));

    const list = await (await fetch(url + '?user=UTEST', {
      headers: {
	'Authorization': 'Bearer deadbeef'
      }
    })).json();

    t.ok(Array.isArray(list.files), 'list is an array');
    t.equal(list.files.length, 1, 'list has one entry');
  });
})

tap.test('list handler rejects requests without a matching user', async t => {

  const rootFixture = tempdirFixture();
  const root = (await rootFixture).dir;

  const handler = list({
    root
  })

  const s = restifyFixture(server => {
    server.get('/', handler);
  });

  await withFixtures([
    s,
    rootFixture
  ], async () => {
    const url = (await s).url

    await pool.withConnection(c => c.setAsync('deadbeef', JSON.stringify({
      team_id: 'TTEST',
      user_id: 'UTEST'
    })));

    const result = await fetch(url, {
      headers: {
	'Authorization': 'Bearer deadbeef'
      }
    });

    const err = await result.json();

    t.equal(result.status, 403, 'got an error');
    t.equal(err.message, 'Access denied');
  });
})

tap.test('teardown', async () => {
  await pool.drain()
  pool.clear();
});
