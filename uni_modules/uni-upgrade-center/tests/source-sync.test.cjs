const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { pluginRoot } = require('./helpers/load-production.cjs');

test('three admin plugins share the same SHA256 sources and persistent tests', () => {
	const files = [
		'pages/use-version-form.js', 'pages/utils.js', 'pages/package-sha256.js',
		'pages/version/add.vue', 'pages/version/detail.vue', 'pages/version/list.vue',
		'readme.md', 'changelog.md', 'tests/helpers/load-production.cjs',
		'tests/package-sha256.test.cjs', 'tests/request-timeout.test.cjs', 'tests/source-sync.test.cjs'
	];
	const roots = ['uni-upgrade-center', 'uni-admin', 'uni-app-x-admin']
		.map(repo => path.resolve(pluginRoot, '../../..', repo, 'uni_modules/uni-upgrade-center'));
	for (const file of files) {
		const canonical = fs.readFileSync(path.join(roots[0], file), 'utf8');
		for (const root of roots.slice(1)) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), canonical, path.join(root, file));
	}
});

test('two admin cloud functions share the same SHA256 sources and persistent tests', () => {
	// 与 scripts/sync-upgrade-center.cjs 的 adminCloudFiles 保持一致；不含随项目版本变化的 package.json
	const files = [
		'cloudfunctions/uni-upgrade-center/checkVersion/index.js',
		'cloudfunctions/uni-upgrade-center/get-file-sha256.js',
		'cloudfunctions/uni-upgrade-center/index.js',
		'cloudfunctions/uni-upgrade-center/tests/check-version.test.js',
		'cloudfunctions/uni-upgrade-center/tests/get-file-sha256.test.js',
		'database/opendb-app-versions.schema.json'
	];
	const roots = ['uni-admin', 'uni-app-x-admin']
		.map(repo => path.resolve(pluginRoot, '../../..', repo, 'uniCloud-aliyun'));
	for (const file of files) {
		const canonical = fs.readFileSync(path.join(roots[0], file), 'utf8');
		assert.equal(fs.readFileSync(path.join(roots[1], file), 'utf8'), canonical, path.join(roots[1], file));
	}
});
