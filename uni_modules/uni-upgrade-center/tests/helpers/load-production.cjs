const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const plugins = process.env.HBUILDERX_PLUGINS || '/Applications/HBuilderX-Dev.app/Contents/HBuilderX/plugins';
const ts = require(process.env.TYPESCRIPT_PATH || path.join(plugins, 'compile-typescript/node_modules/typescript'));
const vue = require(process.env.VUE_RUNTIME_PATH || path.join(plugins, 'uniapp-cli-vite/node_modules/@vue/runtime-core'));
const pluginRoot = path.resolve(__dirname, '../..');

function deferred() {
	let resolve, reject;
	const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
	return { promise, resolve, reject };
}

function setupNames(source) {
	const names = [];
	function collect(name) {
		if (ts.isIdentifier(name)) names.push(name.text);
		else name.elements.forEach(element => element.name && collect(element.name));
	}
	const ast = ts.createSourceFile('page.js', source, ts.ScriptTarget.Latest, true);
	ast.statements.forEach(statement => {
		if (ts.isVariableStatement(statement)) statement.declarationList.declarations.forEach(item => collect(item.name));
		if (ts.isFunctionDeclaration(statement) && statement.name) collect(statement.name);
	});
	return names;
}

function createHarness({ record = {}, latestRecords = [], watchOrder = 'normal' } = {}) {
	const scope = vue.effectScope();
	const requests = [], updates = [], modals = [], toasts = [], storageChanges = [];
	const hooks = { onLoad: [], onReady: [], onUnload: [] };
	const watches = [];
	let storedRecord = JSON.parse(JSON.stringify(record));
	const db = {
		collection() {
			let fields = '', query = false;
			const collection = {
				doc() { return collection; },
				where() { query = true; return collection; },
				field(value) { fields = value; return collection; },
				get() {
					const data = query ? latestRecords : [fields === 'obsolete_file_ids'
						? { obsolete_file_ids: storedRecord.obsolete_file_ids || [] } : storedRecord];
					return Promise.resolve({ result: { data: JSON.parse(JSON.stringify(data)) } });
				},
				update(value) {
					const copy = JSON.parse(JSON.stringify(value));
					updates.push(copy);
					Object.assign(storedRecord, copy);
					return Promise.resolve({ result: { updated: 1 } });
				}
			};
			return collection;
		}
	};
	const uni = {
		showModal(value) { modals.push(value); },
		showToast(value) { toasts.push(value); },
		showLoading() {}, hideLoading() {}, navigateBack() {}, setClipboardData() {},
		getStorageSync() { return {}; }, setStorageSync() {}
	};
	const uniCloud = { database: () => db, setCloudStorage: value => storageChanges.push(value) };
	const request = (action, params, options) => {
		const pending = deferred();
		requests.push({ action, params: { ...params }, options, ...pending });
		return pending.promise;
	};
	const cache = new Map();
	function load(filename) {
		filename = path.resolve(filename);
		if (cache.has(filename)) return cache.get(filename);
		let source = fs.readFileSync(filename, 'utf8');
		if (filename.endsWith('.vue')) {
			source = source.match(/<script setup>([\s\S]*?)<\/script>/)[1];
			source += '\nexport { ' + setupNames(source).join(', ') + ' };';
		}
		const output = ts.transpileModule(source, {
			compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
		}).outputText;
		const module = { exports: {} };
		const requireProduction = id => {
			if (id === 'vue') return {
				...vue,
				getCurrentInstance: () => ({ proxy: { getOpenerEventChannel: () => ({ emit() {} }) } }),
				watch(...args) { watches.push(args); }
			};
			if (id === '@dcloudio/uni-app') return Object.fromEntries(Object.keys(hooks).map(name => [name, fn => hooks[name].push(fn)]));
			if (id === '@/js_sdk/uni-admin/request.js') return { request };
			if (id === '@/js_sdk/validator/opendb-app-versions.js') return {
				validator: Object.fromEntries(['min_uni_version', 'url'].map(name => [name, { rules: [] }])),
				enumConverter: { type_valuetotext: {} }
			};
			if (id.endsWith('.vue')) return {};
			if (id.startsWith('.')) return load(path.resolve(path.dirname(filename), id));
			throw new Error('Unexpected production dependency: ' + id);
		};
		const context = { exports: module.exports, module, require: requireProduction, uni, uniCloud,
			console: { error() {} }, setTimeout() {} };
		vm.runInNewContext(output, context, { filename });
		cache.set(filename, module.exports);
		return module.exports;
	}
	function activateWatches() {
		const pending = watches.splice(0);
		if (watchOrder === 'reverse') pending.reverse();
		scope.run(() => pending.forEach(args => vue.watch(...args)));
	}
	function form(data = {}) {
		const api = scope.run(() => load(path.join(pluginRoot, 'pages/use-version-form.js')).useVersionForm(
			vue.ref({ setRules() {}, clearValidate() {} })
		));
		activateWatches();
		const loaded = { ...api.formData.value, type: 'wgt', is_vapor: true, platform: ['Android'], ...data };
		if (api.bindLoadedPackageSha256) api.bindLoadedPackageSha256(loaded);
		else api.formData.value = loaded;
		return api;
	}
	function page(name) {
		const api = scope.run(() => load(path.join(pluginRoot, 'pages/version', name + '.vue')));
		api.form.value = { setRules() {}, clearValidate() {}, validate: () => Promise.resolve({ ...api.formData.value }) };
		activateWatches();
		return api;
	}
	async function settle() {
		for (let i = 0; i < 8; i++) { await Promise.resolve(); await vue.nextTick(); }
	}
	return { form, page, requests, updates, modals, toasts, storageChanges, hooks, settle,
		load: name => scope.run(() => Promise.all(hooks.onLoad.map(fn => fn(name)))),
		setStoredRecord(value) { storedRecord = JSON.parse(JSON.stringify(value)); },
		dispose: () => scope.stop() };
}

module.exports = { createHarness, pluginRoot, ts, deferred };
