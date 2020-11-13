const path = require('path')
module.exports = {
    parser: 'postcss-comment',
    plugins: {
        'postcss-import': {
            resolve(id, basedir, importOptions) {
                if (id.startsWith('~@/')) {
                    return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3))
                } else if (id.startsWith('@/')) {
                    return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2))
                } else if (id.startsWith('/') && !id.startsWith('//')) {
                    return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1))
                }
                return id
            }
        },
        'autoprefixer': {
            overrideBrowserslist: ["> 1%", "last 2 versions", "not dead"],
            remove: process.env.UNI_PLATFORM !== 'h5',
			ignoreUnknownVersions: true
        },
        '@dcloudio/vue-cli-plugin-uni/packages/postcss': {}
    }
}
