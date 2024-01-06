import './image.css'

const ATTRIBUTES = [
	'alt',
	'height',
	'width',
	'data-custom',
	'class',
	'data-local'
]

export default function (Quill) {
  const Image = Quill.import('formats/image')
	const BlockEmbed = Quill.import('blots/block/embed')
	class ExtendImageFormat extends Image {
		static create (value) {
			if (typeof value === 'string') {
				value = {
					src: value,
					uploaded: false
				}
			}

			const {src, uploaded} = value
			const node = super.create(src)

			if (uploaded) {
				node.classList.add('uploaded')
			}

			return node
		}
		static formats (domNode) {
			return ATTRIBUTES.reduce(function (formats, attribute) {
				if (domNode.hasAttribute(attribute)) {
					formats[attribute] = domNode.getAttribute(attribute)
				}
				return formats
			}, {})
		}

		static sanitize (url) {
			return url
		}

		format (name, value) {
			if (ATTRIBUTES.indexOf(name) > -1) {
				if (value) {
					this.domNode.setAttribute(name, value)
				} else {
					this.domNode.removeAttribute(name)
				}
			} else {
				super.format(name, value)
			}
		}
	}
	class ImageLoadingFormat extends BlockEmbed {
		static create (value) {
			const node = super.create(value)
			node.setAttribute('contenteditable', false)
			node.setAttribute('upload-id', value)

			const loading = document.createElement('div')
			loading.classList.add('image-loading-inner')
			loading.innerText = '正在上传'

			node.appendChild(loading)

			return node
		}
	}
	ImageLoadingFormat.blotName = 'image-loading'
	ImageLoadingFormat.tagName = 'div'
	ImageLoadingFormat.className = 'image-loading'

	return {
		'formats/image': ExtendImageFormat,
		'formats/image-loading': ImageLoadingFormat,
	}
}
