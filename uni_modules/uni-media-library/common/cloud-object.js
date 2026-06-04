let cachedInstance = null

export function getMediaLibraryCo(options = {}) {
	if (!cachedInstance) {
		cachedInstance = uniCloud.importObject('uni-media-library-co', {
			customUI: true,
			...options
		})
	}
	return cachedInstance
}
