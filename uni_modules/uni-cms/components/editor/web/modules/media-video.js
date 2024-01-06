export default function (Quill) {
	class MediaVideoModule {
		constructor(quill, config) {
			this.quill = quill
			this.config = config

			// 刪除视频
			this.quill.root.addEventListener('click', this.handleClick, false);
		}

		handleClick (e) {
			if (e.target && e.target.classList.contains('ql-media-video-remove')) {
				const node = e.target.parentNode
				const mediaVideo = Quill.find(node)

				if (mediaVideo) {
					mediaVideo.deleteAt(0)
				}
			}
		}
	}

	return {
		'modules/MediaVideo': MediaVideoModule
	}
}
