const scripts = {}

// 定义一个函数，用于加载脚本
export default function loadScript (globalName, src, callback) {
	// 如果全局对象已经存在，直接执行回调函数
	const globalObject = typeof globalName === 'string' ? window[globalName] : globalName
	if (globalObject) {
		callback() // 如果全局对象已经存在，直接执行回调函数
		return
	}
	// 如果脚本还未加载，则将回调函数存储起来，等待脚本加载完成后执行
	let callbacks = scripts[src]
	if (!callbacks) {
		// 如果脚本还未加载，则将回调函数存储起来
		callbacks = scripts[src] = []
		// 创建一个 script 标签
		const script = document.createElement('script')
		// 设置 script 标签的 src 属性
		script.src = src
		// 将 script 标签添加到 body 中
		document.body.appendChild(script)
		// 当脚本加载完成后执行回调函数
		script.onload = function () {
			callbacks.forEach(callback => callback()) // 当脚本加载完成后执行回调函数
			delete scripts[src] // 删除已经执行的回调函数
		}
	}
	// 将回调函数存储起来
	callbacks.push(callback)
}
