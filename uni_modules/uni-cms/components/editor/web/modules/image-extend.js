import './image-uploading.css'

export default function (Quill) {
	// const Delta = Quill.import('delta')

	class ImageExtend {
		constructor(quill, config) {
			this.quill = quill
			this.config = config

			// 通过监听内容变化判断是否上传图片
			quill.on(Quill.events.TEXT_CHANGE, (delta) => {
				const imageElements = quill.container.querySelectorAll('img[data-local]:not(.uploading)')

				imageElements.forEach(element => {
					if (element.classList.contains('uploaded')) {
						element.removeAttribute('data-local')
						element.classList.remove('uploaded')
						if(element.classList.length <= 0) {
							element.removeAttribute('class')
						}
 					} else {
						this.uploader(element)
					}
				})
			})

			// 插入粘贴的文件图片
			quill.root.addEventListener('paste', (e) => {

				const files = Array.from(e.clipboardData.files || []);

				if (files.length > 0) {
					e.preventDefault();
					setTimeout(() => {
						this.insertFileImage(files[0])
					}, 0)
				}
			}, false)

			// 插入粘贴的网络图片
			quill.clipboard.addMatcher('IMG', function (node, delta) {
				if (!delta.ops[0].attributes) {
					delta.ops[0].attributes = {}
				}

				delta.ops[0].attributes['data-local'] = node.src

				delta.ops[0].attributes = Object.keys(delta.ops[0].attributes).reduce((attributes, key) => {
					if (['data-local', 'alt'].includes(key)) {
						attributes[key] = delta.ops[0].attributes[key]
					}

					return attributes
				}, {})
				return delta
			});
		}

		async uploader(element) {
			// 标记元素正在上传
			element.classList.add('uploading')

			// 检查是否配置了上传方法
			if (typeof this.config.uploadHandler !== 'function') {
				console.warn('没有配置图片上传方法，移除图片：' + element.src)
				Quill.find(element).deleteAt(0)
				return
			}

			const imageFile = await this.convertImageFile(element.src)

			// 构建上传元素
			const uploadNode = this.getUploadNode(element.src)
			// 获取位置
			const parent = this.quill.root.parentNode

			setTimeout(() => {

				const elementRect = element.getBoundingClientRect()
				const containerRect = parent.getBoundingClientRect()

				uploadNode.style.left = `${elementRect.left - containerRect.left - 1 + parent.scrollLeft}px`
				uploadNode.style.top = `${elementRect.top - containerRect.top + parent.scrollTop}px`
				uploadNode.style.width = `${elementRect.width}px`
				uploadNode.style.height = `${elementRect.height}px`

				// 渲染到element上
				parent.appendChild(uploadNode)
			}, 100)

			// 上传图片 展示进度
			Promise.resolve({
				then: (resolve, reject) => {
					try {
						const handler = this.config.uploadHandler(imageFile, element)
						resolve(handler)
					} catch (e) {
						reject(e)
					}
				}
			}).then((url) => {
				const customData = (element.getAttribute('data-custom') || '').split('&').filter(item => item).reduce((res, item) => {
					const [key, value] = item.split('=')
					res[key] = value
					return res
				}, {})

				customData.source = url

				element.src = url
				element.removeAttribute('data-local')
				element.classList.remove('uploading')
				element.setAttribute('data-custom', Object.keys(customData).map(key => `${key}=${customData[key]}`).join('&'))

				parent.removeChild(uploadNode)
			}).catch((e) => {
				parent.removeChild(uploadNode)
				console.error(e)
			})
		}

		async convertImageFile(imageUrl) {
			const result = {
				blob: imageUrl,
				ext: 'jpg',
				size: 0,
			}

			// if (!/^blob:/.test(imageUrl)) {
				const image = await fetch(imageUrl)
				const blob = await image.blob()
				const mimeType = this.getBlobImageMimeType(blob, imageUrl)
				const ext = mimeType.replace('image/', '')
				const filename = `image.${ext}`
				const file = new File([blob], filename, {type: mimeType})

				result.blob = this.file2blob(file)
				result.ext = ext
				result.size = file.size
			// }

			return result
		}

		getBlobImageMimeType(blob, imageUrl) {
			if (blob.type) {
				return blob.type
			}
			if (imageUrl.match(/data:(image\/\w+);base64/)) {
				return imageUrl.match(/data:(image\/\w+);base64/)[1].toLowerCase()
			}
			return 'image/jpeg'
		}

		getUploadNode(imageUrl) {
			const div = document.createElement('div')
			const img = document.createElement('img')

			img.src = imageUrl
			img.setAttribute('οndragstart', 'return false')
			div.appendChild(img)

			div.classList.add('image-uploading')

			return div
		}

		file2blob(file) {
			let url
			if (window.createObjectURL !== undefined) {
				url = window.createObjectURL(file);
			} else if (window.URL !== undefined) {
				url = window.URL.createObjectURL(file);
			} else if (window.webkitURL !== undefined) {
				url = window.webkitURL.createObjectURL(file);
			}
			return url
		}

		insertFileImage(file) {
			const range = this.quill.getSelection(true)
			const url = this.file2blob(file)
			if (range.index > 0 && this.quill.getText(range.index - 1, 1) !== '\n') {
				this.quill.insertText(range.index, '\n', Quill.sources.SILENT)
				range.index += 1
			}
			this.quill.insertEmbed(range.index, 'image', url, Quill.sources.SILENT)
			this.quill.formatText(range.index, 1, 'data-local', url, Quill.sources.SILENT)
			this.quill.insertText(range.index + 1, '\n', Quill.sources.SILENT)
			this.quill.setSelection(range.index + 2, Quill.sources.SILENT)
			this.quill.scrollIntoView()
		}
	}

	return {
		'modules/ImageExtend': ImageExtend
	}
}
