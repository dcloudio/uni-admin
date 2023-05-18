import './unlock-content.css'
export default function UnlockContent () {
	const BlockEmbed = Quill.import('blots/block/embed')

	class UnlockContent extends BlockEmbed {
		static blotName = 'unlockContent'
		static tagName = 'div'
		static className = 'ql-unlock-content'

		static create (value) {
			const node = super.create(value);
			const span = document.createElement('span')

			node.setAttribute('contenteditable', 'false')

			span.innerHTML = `<span>以下内容需解锁后查看，广告解锁功能详见</span><a href="https://uniapp.dcloud.net.cn/uniCloud/uni-cms.html#watch-ad-unlock-content" target="_blank">文档</a>`

			node.appendChild(span)

			return node;
		}
	}

	return {
		'formats/unlockContent': UnlockContent
	}
}
