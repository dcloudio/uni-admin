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

	class ExtendImageFormat extends Image {
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

	return {
		'formats/image': ExtendImageFormat
	}
}
