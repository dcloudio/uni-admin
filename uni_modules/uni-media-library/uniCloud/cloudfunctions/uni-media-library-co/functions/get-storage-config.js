const config = require('../common/config')

module.exports = async function () {
  const storageOptions = [
    {provider: 'internal', name: '内置存储'}
  ]

  const {exists, message} = config.hasExtStorage()

  storageOptions.push({provider: 'ext-qiniu', name: '扩展存储', isOpen: exists, message})

  return {
    errCode: 0,
    data: storageOptions
  }
}
