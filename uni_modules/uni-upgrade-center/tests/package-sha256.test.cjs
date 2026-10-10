const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const sourcePath = path.join(__dirname, '..', 'pages', 'package-sha256.js');
const source = fs.readFileSync(sourcePath, 'utf8')
  .replace(/export function /g, 'function ')
  + '\nmodule.exports = { isValidPackageSha256, getPackageSha256Source, isSamePackageSha256Source };';
const context = { module: { exports: {} }, exports: {}, console };
vm.runInNewContext(source, context, { filename: sourcePath });
const { isValidPackageSha256, getPackageSha256Source, isSamePackageSha256Source } = context.module.exports;

test('摘要格式只接受 64 位十六进制', () => {
  assert.equal(isValidPackageSha256('a'.repeat(64)), true);
  assert.equal(isValidPackageSha256('A'.repeat(64)), true);
  assert.equal(isValidPackageSha256('a'.repeat(63)), false);
  assert.equal(isValidPackageSha256('z'.repeat(64)), false);
  assert.equal(isValidPackageSha256(''), false);
});

test('HTTP URL 摘要来源绑定实际下载 URL，不继承旧 file_id', () => {
  const source = getPackageSha256Source({
    url: 'https://cdn.example.com/app.apk?token=1',
    file_id: 'cloud://old.apk',
    file_domain: 'cdn.example.com'
  });
  assert.deepEqual(JSON.parse(JSON.stringify(source)), {
    type: 'url',
    fileID: 'https://cdn.example.com/app.apk?token=1',
    domain: '',
    downloadUrl: 'https://cdn.example.com/app.apk?token=1',
    referenceFileID: 'cloud://old.apk',
    referenceDomain: 'cdn.example.com'
  });
});

test('存储 file_id 来源保留 domain；URL 优先作为下载对象', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(getPackageSha256Source({ url: '', file_id: 'cloud://app.apk', file_domain: '' }))), {
    type: 'file', fileID: 'cloud://app.apk', domain: '', downloadUrl: '',
    referenceFileID: 'cloud://app.apk', referenceDomain: ''
  });
  assert.deepEqual(JSON.parse(JSON.stringify(getPackageSha256Source({ url: 'https://other.example.com/app.apk', file_id: 'cloud://app.apk', file_domain: '' }))), {
    type: 'url', fileID: 'https://other.example.com/app.apk', domain: '',
    downloadUrl: 'https://other.example.com/app.apk',
    referenceFileID: 'cloud://app.apk', referenceDomain: ''
  });
});

test('来源快照要求 URL、来源和归属引用全部一致', () => {
  const left = getPackageSha256Source({ url: 'https://cdn.example.com/app.apk', file_id: 'old', file_domain: 'domain' });
  const same = { ...left };
  assert.equal(isSamePackageSha256Source(left, same), true);
  assert.equal(isSamePackageSha256Source(left, { ...same, downloadUrl: 'https://cdn.example.com/new.apk' }), false);
  assert.equal(isSamePackageSha256Source(left, { ...same, referenceFileID: 'new' }), false);
});
