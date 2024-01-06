import divider from './divider'
import align from './align'
import list from './list'
import box from './box'
import font from './font'
import text from './text'
import image from './image'
import link from './link'
import unlockContent from "./unlock-content"
import mediaVideo from "./media-video"

export function register (Quill) {
	const formats = {
		divider,
		align,
		list,
		box,
		font,
		text,
		image,
		link,
		unlockContent,
		mediaVideo
	}
	const options = {}
	Object.values(formats).forEach(value => Object.assign(options, value(Quill)))
	Quill.register(options, true)
}
