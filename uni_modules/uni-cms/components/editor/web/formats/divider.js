import './divider.css'
export default function (Quill) {
	const BlockEmbed = Quill.import('blots/block/embed')
  class Divider extends BlockEmbed {
		static blotName = 'divider'
		static tagName = 'hr'

		static create (value) {
			const node = super.create(value)
			const wrap = document.createElement('div')

			wrap.classList.add('divider')
			wrap.setAttribute('contenteditable', 'false')
			wrap.appendChild(node)

			return wrap
		}
	}

  return {
    'formats/divider': Divider
  }
}
