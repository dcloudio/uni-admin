const stat = require('./stat/index')
const {
	createApi
} = require('./shared/index')

module.exports = {
	init: (options = {}) => {
		options.clientType = options.clientType || __ctx__.PLATFORM
		return createApi(stat, options)
	}
}
