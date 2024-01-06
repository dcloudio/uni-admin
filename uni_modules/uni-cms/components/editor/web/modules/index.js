import ImageExtend from './image-extend'
import CustomClipboard from "./clipboard"
import MediaVideo from "./media-video"

export function register (Quill) {
	const modules = {
		ImageExtend,
		CustomClipboard,
		MediaVideo
	}
	const options = {}
	Object.values(modules).forEach(value => Object.assign(options, value(Quill)))
	Quill.register(options, true)
}
