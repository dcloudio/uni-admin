import ImageExtend from './image-extend'
import CustomClipboard from "./clipboard"

export function register (Quill) {
	const modules = {
		ImageExtend,
		CustomClipboard
	}
	const options = {}
	Object.values(modules).forEach(value => Object.assign(options, value(Quill)))
	Quill.register(options, true)
}
