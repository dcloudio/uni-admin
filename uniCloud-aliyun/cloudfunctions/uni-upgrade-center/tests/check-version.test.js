'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const checkVersion = require('../checkVersion');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function callCheckVersion(event, context, records) {
  const collection = {
    where() {
      return this;
    },
    orderBy() {
      return this;
    },
    get: async () => ({ data: clone(records) }),
  };
  global.uniCloud = {
    database() {
      return {
        collection() {
          return collection;
        },
      };
    },
  };

  try {
    return await checkVersion(event, context || {});
  } finally {
    delete global.uniCloud;
  }
}

function appPackage(extra) {
  return {
    type: 'native_app',
    version: '2.0.0',
    appid: 'demo-app',
    stable_publish: true,
    ...extra,
  };
}

function wgtPackage(extra) {
  return {
    type: 'wgt',
    version: '2.0.0',
    appid: 'demo-app',
    stable_publish: true,
    min_uni_version: '1.0.0',
    ...extra,
  };
}

test('uni-app x verify_sha256 为空或格式错误时拦截整包更新', async () => {
  for (const sha256 of ['', 'not-a-sha256']) {
    const result = await callCheckVersion({
      appid: 'demo-app',
      appVersion: '1.0.0',
      wgtVersion: '1.0.0',
      is_uniapp_x: true,
    }, {}, [appPackage({ verify_sha256: true, sha256 })]);

    assert.equal(result.code, -103);
  }
});

test('uni1 不启用运行时 sha256 校验，保留整包更新', async () => {
  const result = await callCheckVersion({
    appid: 'demo-app',
    appVersion: '1.0.0',
    wgtVersion: '1.0.0',
    is_uniapp_x: false,
  }, {}, [appPackage({ verify_sha256: true, sha256: '' })]);

  assert.equal(result.code, 102);
  assert.equal(result.type, 'native_app');
});

test('整包 mandatory 更新优先于更高版本 WGT', async () => {
  const result = await callCheckVersion({
    appid: 'demo-app',
    appVersion: '1.0.0',
    wgtVersion: '8.0.0',
    is_uniapp_x: false,
  }, {}, [
    appPackage({ is_mandatory: true }),
    wgtPackage({ version: '9.0.0' }),
  ]);

  assert.equal(result.code, 102);
  assert.equal(result.type, 'native_app');
  assert.equal(result.effective_is_mandatory, true);
});

test('HTTP GET 和 POST body 都按请求头平台解析', async () => {
  const getResult = await callCheckVersion({
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone)' },
    httpMethod: 'GET',
    queryStringParameters: {
      appid: 'demo-app',
      appVersion: '1.0.0',
      wgtVersion: '1.0.0',
      is_uniapp_x: false,
    },
  }, {}, [appPackage({ version: '2.0.0' })]);
  assert.equal(getResult.code, 102);

  const postResult = await callCheckVersion({
    headers: { 'user-agent': 'Android' },
    httpMethod: 'POST',
    body: JSON.stringify({
      appid: 'demo-app',
      appVersion: '1.0.0',
      wgtVersion: '1.0.0',
      is_uniapp_x: false,
    }),
  }, {}, [wgtPackage({ version: '2.0.0' })]);
  assert.equal(postResult.code, 101);
});

test('HTTP POST body 非法或为 null 时返回请求错误', async () => {
  for (const body of ['not-json', 'null']) {
    const result = await callCheckVersion({
      headers: {},
      httpMethod: 'POST',
      body,
    }, {}, []);

    assert.deepEqual(result, { code: -102, message: '请求错误' });
  }
});

test('URL 化请求经 index.js 转发仍按 user-agent 识别平台', async () => {
  // index.js 会在解析 action 时替换 event，必须保留原始 event（含 headers）再交给 checkVersion
  const Module = require('node:module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'uni-id-common') return { createInstance: () => ({}) };
    return originalRequire.apply(this, arguments);
  };

  const records = [
    { type: 'native_app', version: '2.0.0', appid: 'demo-app', stable_publish: true, platform: 'iOS' },
    { type: 'native_app', version: '3.0.0', appid: 'demo-app', stable_publish: true, platform: 'Android' },
  ];
  let capturedWhere;
  global.uniCloud = {
    database() {
      return {
        collection() {
          return {
            where(condition) { capturedWhere = condition; return this; },
            orderBy() { return this; },
            get: async () => ({ data: clone(records.filter(item => item.platform === capturedWhere.platform)) }),
          };
        },
      };
    },
  };

  try {
    const index = require('../index.js');
    const result = await index.main({
      action: 'checkVersion',
      headers: { 'user-agent': 'Mozilla/5.0 (iPhone)' },
      httpMethod: 'GET',
      queryStringParameters: {
        action: 'checkVersion',
        appid: 'demo-app',
        appVersion: '1.0.0',
        wgtVersion: '1.0.0',
      },
    }, {});

    assert.equal(capturedWhere.platform, 'iOS');
    assert.equal(result.platform, 'iOS');
    assert.equal(result.version, '2.0.0');
  } finally {
    Module.prototype.require = originalRequire;
    delete global.uniCloud;
    delete require.cache[require.resolve('../index.js')];
  }
});
