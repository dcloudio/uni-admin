const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { pluginRoot, ts } = require('./helpers/load-production.cjs');

for (const repo of ['uni-admin', 'uni-app-x-admin']) {
	test(repo + ' request forwards optional function timeout without changing defaults', async () => {
		const filename = path.resolve(pluginRoot, '../../..', repo, 'js_sdk/uni-admin/request.js');
		const source = fs.readFileSync(filename, 'utf8');
		const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
		const calls = [], objectCalls = [];
		const module = { exports: {} };
		vm.runInNewContext(output, {
			module, exports: module.exports,
			require: id => id.includes('admin.config') ? { navBar: { debug: {} } } : {},
			uniCloud: {
				database() { return {}; },
				callFunction(options) { calls.push(options); return Promise.resolve({ result: { success: true } }); },
				importObject(name, options) { objectCalls.push({ name, options }); return { action: () => Promise.resolve({ success: true }) }; }
			}
		}, { filename });
		const { request } = module.exports;
		await request('getFileSha256', { fileID: 'https://cdn.example.com/a.wgt' }, { functionName: 'uni-upgrade-center', timeout: 115000 });
		await request('other', {}, { functionName: 'uni-upgrade-center' });
		await request('action', {}, { objectName: 'test-object', timeout: 115000 });
		assert.equal(calls[0].timeout, 115000);
		assert.equal(calls[0].data.action, 'getFileSha256');
		assert.equal(Object.hasOwn(calls[1], 'timeout'), false);
		assert.equal(Object.hasOwn(objectCalls[0].options, 'timeout'), false);
		assert.equal(objectCalls[0].options.customUI, true);
	});
}
