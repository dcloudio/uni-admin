<template>
	<view :id="id"></view>
</template>

<script>
// 扩展 Quill.js 编辑器
// #ifdef VUE3
import '@/uni_modules/uni-cms/common/quill.min.js'
import '@/uni_modules/uni-cms/common/quill-image-resize.js'
// #endif
// #ifndef VUE3
import Quill from '@/uni_modules/uni-cms/common/quill.min.js'
import QuillImageResize from '@/uni_modules/uni-cms/common/quill-image-resize.js'

window.Quill = Quill
window.ImageResize = QuillImageResize
// #endif
import { register as formatRegister } from './formats'
import { register as moduleRegister } from './modules'
import link from '../web/formats/link'

export default {
	name: "editor", // 组件名
	props: {
		id: { // 编辑器的 id
			type: String,
			default: 'editor'
		},
		uploadHandler: { // 上传处理函数
			type: Function,
			default: null
		}
	},
	mounted() {
		// 初始化编辑器
		this.initEditor()
	},
	methods: {
		initEditor() {
      // 注册自定义格式
			formatRegister(Quill)
			// 注册自定义模块
			moduleRegister(Quill)

			// 注册图片缩放模块
			// #ifdef VUE3
			Quill.register('modules/ImageResize', window.ImageResize.default)
			// #endif
			// #ifndef VUE3
			Quill.register('modules/ImageResize', window.ImageResize)
			// #endif

			// 配置编辑器选项
			const options = {
				toolbar: false, // 隐藏工具栏
				readOnly: false, // 可编辑
				debug: false, // 关闭调试模式
				placeholder: '输入内容', // 占位符
				scrollingContainer: 'html,body', // 滚动容器
        scrollingConfig: {
          boundHeight: window.innerHeight - 100
        },
				modules: {
          MediaVideo: true,
          // 图片扩展模块
					ImageExtend: {
						uploadHandler: async (e, el) => {
							if (typeof this.uploadHandler !== 'function') {
								return uni.showModal({
									title: "请先配置上传方法",
									showCancel: false
								})
							}

							return this.uploadHandler(e, el)
						}
					},
					// 图片缩放模块
					ImageResize: {
						modules: ['DisplaySize', 'Toolbar', 'Resize']
					}
				}
			}

			// 创建编辑器实例
			this.quill = new Quill('#' + this.id, options)

			// 添加 Quill 事件监听器
			this.addQuillListeners()

			// 获取编辑器上下文
			const context = this.getEditorContext()

			// 触发 ready 事件并传递编辑器上下文
			this.$emit('ready', context)
		},

		getEditorContext() {
			// 返回一个对象，包含了编辑器的各种方法
			return {
				 // 绑定 this，返回 format 方法
				format: this.format.bind(this),
				 // 绑定 this，返回 insertDivider 方法
				insertDivider: this.insertDivider.bind(this),
				 // 绑定 this，返回 insertImage 方法
				insertImage: this.insertImage.bind(this),
				 // 绑定 this，返回 insertText 方法
				insertText: this.insertText.bind(this),
				 // 绑定 this，返回 setContents 方法
				setContents: this.setContents.bind(this),
				 // 绑定 this，返回 getContents 方法
				getContents: this.getContents.bind(this),
				 // 绑定 this，返回 clear 方法
				clear: this.clear.bind(this),
				 // 绑定 this，返回 removeFormat 方法
				removeFormat: this.removeFormat.bind(this),
				 // 绑定 this，返回 undo 方法
				undo: this.undo.bind(this),
				 // 绑定 this，返回 redo 方法
				redo: this.redo.bind(this),
				 // 绑定 this，返回 blur 方法
				blur: this.blur.bind(this),
				 // 绑定 this，返回 scrollIntoView 方法
				scrollIntoView: this.scrollIntoView.bind(this),
				 // 绑定 this，返回 getSelectionText 方法
				getSelectionText: this.getSelectionText.bind(this),
				 // 绑定 this，返回 insertUnlockContent 方法
				insertUnlockContent: this.insertUnlockContent.bind(this),
        // 绑定 this，返回 insertMediaVideo 方法
        insertMediaVideo: this.insertMediaVideo.bind(this),
			}
		},

		// 格式化文本
		format(name, _value = false) {
			// 获取当前光标所在位置
			const range = this.quill.getSelection(true)
			// 获取选中文本的值
			let value = _value
			// 获取选中文本的格式
			let format = this.quill.getFormat(range)[name] || false
      let isFormat = false
			// 如果是加粗、斜体、下划线、删除线、插入线
			if (['bold', 'italic', 'underline', 'strike', 'ins'].includes(name)) {
				// 取反
				value = !format
			} else if (name === 'direction') { // 如果是文本方向
				// 如果 value 是 rtl 且 format 存在，则 value 为 false，否则为 value
				value = value === 'rtl' && format ? false : value
				// 获取对齐方式
				const align = this.quill.getFormat(range).align
				// 如果 value 是 rtl 且 align 不存在
				if (value === 'rtl' && !align) {
					// 设置对齐方式为右对齐
					this.quill.format('align', 'right', Quill.sources.USER)
          isFormat = true
				} else if (!value && align === 'right') { // 如果 value 不存在且 align 是右对齐
					// 取消右对齐
					this.quill.format('align', false, Quill.sources.USER)
          isFormat = true
				}
			} else if (name === 'indent') { // 如果是缩进
				// 获取文本方向是否为 rtl
				const rtl = this.quill.getFormat(range).direction === 'rtl'
				// 如果 value 是 +1
				value = value === '+1'
				// 如果文本方向是 rtl
				if (rtl) {
					// 取反
					value = !value
				}
				// 如果 value 为 true，value 为 +1，否则为 -1
				value = value ? '+1' : '-1'
			} else if (name === 'link') {
        const [blot, offset] = this.quill.scroll.descendant(link(Quill)['formats/link'], range.index);

        if (blot) {
          this.quill.formatText({
            index: range.index - offset,
            length: blot.length()
          }, name, value, Quill.sources.USER)
        } else {
          this.quill.format(name, value, Quill.sources.USER)
        }
        isFormat = true
        //
        // if (range.length > 0) {
        //   this.quill.format(name, value, Quill.sources.USER)
        // } else {
        //
        //
        //   const [blot] = this.quill.getLeaf(range.index);
        //   if (blot && blot.domNode && blot.domNode.tagName === "A") {
        //     blot.parent.format(name, value)
        //     isFormat = true
        //   }
        // }
      } else { // 其他情况
        // 如果是列表
        if (name === 'list') {
          // 如果 value 是 check，value 为 unchecked，否则为 value
          value = value === 'check' ? 'unchecked' : value
          // 如果 format 是 checked，format 为 unchecked，否则为 format
          format = format === 'checked' ? 'unchecked' : format
        }
        // 如果 format 存在且不等于 value 或者 format 不存在且 value 存在，则 value 为 value，否则为 format 的取反
        value = ((format && format !== (value || false)) || (!format && value)) ? value : !format
      }
      // 设置格式
			!isFormat && this.quill.format(name, value, Quill.sources.USER)

			// 触发状态改变事件
			this.emitStatusChange(range)
		},

		insertDivider() {
			// 获取当前光标所在位置
			const range = this.quill.getSelection(true)
			// 在当前光标位置插入一个换行符
			this.quill.insertText(range.index, '\n', Quill.sources.USER)
			// 在当前光标位置插入一个分割线
			this.quill.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER)
			// 将光标移动到分割线下一行
			this.quill.setSelection(range.index + 2, Quill.sources.SILENT)
		},

		insertImage({ src, alt, width, height, extClass, data = {} } = {}) {
			// 获取当前光标所在位置
			const range = this.quill.getSelection(true)

			// 如果当前光标前面不是换行符，则在当前光标位置插入一个换行符
			if (range.index > 0 && this.quill.getText(range.index - 1, 1) !== '\n') {
				this.quill.insertText(range.index, '\n', Quill.sources.SILENT)
				range.index += 1;
			}

			// 在当前光标位置插入一个图片
			this.quill.insertEmbed(range.index, 'image', {src, uploaded: true}, Quill.sources.SILENT)
			// 设置图片的本地路径
			this.quill.formatText(range.index, 1, 'data-local', src, Quill.sources.SILENT)
			// 设置图片的 alt 属性
			this.quill.formatText(range.index, 1, 'alt', alt, Quill.sources.SILENT)
			// 设置图片的宽度
			this.quill.formatText(range.index, 1, 'width', width, Quill.sources.SILENT)
			// 设置图片的高度
			this.quill.formatText(range.index, 1, 'height', height, Quill.sources.SILENT)
			// 设置图片的 class 属性
			this.quill.formatText(range.index, 1, 'class', extClass, Quill.sources.SILENT)
			// 设置图片的自定义属性
			this.quill.formatText(range.index, 1, 'data-custom', Object.keys(data).map(key => `${key}=${data[key]}`).join('&'), Quill.sources.SILENT)
			// 在图片下面插入一个换行符
			this.quill.insertText(range.index + 1, '\n', Quill.sources.SILENT)
			// 将光标移动到图片下一行
			this.quill.setSelection(range.index + 2, Quill.sources.SILENT)

			// 滚动到可视区域
			this.quill.scrollIntoView()
		},

		insertText({ text }) {
			// 获取当前光标所在位置
			const range = this.quill.getSelection(true)
			// 在当前光标位置插入文本
			this.quill.insertText(range.index, text, Quill.sources.USER)
			// 将光标移动到文本末尾
			this.quill.setSelection(range.index + text.length, 0, Quill.sources.SILENT)
		},

		setContents({ delta }) {
			// 设置编辑器内容
			this.quill.setContents(delta, Quill.sources.SILENT)
		},
		// 获取编辑器内容
		getContents({ success, fail, complete } = {}) {
			let contents
			try {
				// 获取编辑器内容的 HTML
				const html = this.quill.root.innerHTML
				// 获取编辑器内容的纯文本
				const text = this.quill.getText()
				// 获取编辑器内容的 Delta 对象
				const delta = this.quill.getContents()

				contents = {
					html,
					text,
					delta
				}

				// 如果传入了 success 回调函数，则执行该函数并传入编辑器内容
				if (typeof success === "function") {
					success(contents)
				}
			} catch (e) {
				// 如果传入了 fail 回调函数，则执行该函数并传入错误信息
				if (typeof fail === 'function') {
					fail(e)
				}
			}

			// 如果传入了 complete 回调函数，则执行该函数
			if (typeof complete === 'function') complete()

			// 返回一个 Promise 对象，其状态为已解决，并传入编辑器内容
			return Promise.resolve(contents)
		},

		// 清空编辑器内容
		clear() {
			// 将编辑器内容设置为空数组
			this.quill.setContents([])
		},

		// 移除选中文本的格式
		removeFormat() {
			// 获取当前选中文本的范围
			const range = this.quill.getSelection(true)
			// 获取 Parchment 对象
			const parchment = Quill.import('parchment')
			// 如果选中了文本，则移除选中文本的格式
			if (range.length) {
				this.quill.removeFormat(range, Quill.sources.USER)
			} else {
				// 否则，移除当前光标所在位置的格式
				Object.keys(this.quill.getFormat(range)).forEach(key => {
					if (parchment.query(key, parchment.Scope.INLINE)) {
						this.quill.format(key, false)
					}
				})
			}
		},

		// 撤销
		undo() {
			this.quill.history.undo()
		},

		// 重做
		redo() {
			this.quill.history.redo()
		},

		// 失去焦点
		blur() {
			this.quill.blur()
		},

		// 滚动到可视区域
		scrollIntoView() {
			this.quill.scrollIntoView()
		},

		// 在当前光标位置插入一个解锁内容的占位符
		insertUnlockContent() {
			const range = this.quill.getSelection(true)
			this.quill.insertEmbed(range.index, 'unlockContent', Quill.sources.SILENT)
			this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
		},

    insertMediaVideo ({poster, src, duration}) {
      const range = this.quill.getSelection(true)
      this.quill.insertEmbed(range.index, 'mediaVideo', {poster, src, duration}, Quill.sources.SILENT)
      this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
    },

		// 获取选中文本的纯文本
		getSelectionText() {
			const range = this.quill.selection.savedRange
			const res = { text: '' }
			if (range && range.length !== 0) {
				res.text = this.quill.getText(range.index, range.length)
			}
			return res
		},

		// 加载 Quill 和 Quill-image-resize-mp 库
		// _loadQuill(callback) {
    //   // 加载本地 quill.js
		// 	// const quillSrc = 'https://unpkg.com/quill@1.3.7/dist/quill.min.js'
		// 	const imageResizeSrc = 'https://unpkg.com/quill-image-resize-mp@3.0.1/image-resize.min.js'
		//
		// 	// loadScript(window.Quill, quillSrc, () => {
    //     loadScript(window.ImageResize, imageResizeSrc, () => {
    //       callback()
    //     })
		// 	// })
		// },

		// 添加 Quill 事件监听器
		addQuillListeners() {
			// 监听光标位置变化事件
			this.quill.on(Quill.events.SELECTION_CHANGE, (range) => {
				this.emitStatusChange(range)

				if (range) {
					this.$emit('focus')
				} else {
					this.$emit('blur')
				}
			})
			// 监听滚动事件
			this.quill.on(Quill.events.SCROLL_OPTIMIZE, () => {
				const range = this.quill.selection.getRange()[0]
				this.emitStatusChange(range)
			})
			// 监听文本变化事件
			this.quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
				const text = this.quill.getText().replace(/\n/g, '')
				this.$emit('textchange', {
					detail: text.length
				})
			})
		},

		// 触发状态变化事件
		emitStatusChange(range) {
			this.$emit('statuschange', {
				detail: range ? this.quill.getFormat(range) : {}
			})
		}
	}
}
</script>

<style scoped>

</style>


