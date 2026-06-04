import InternalUploadProvider from './internal'
import QiniuUploadProvider from './qiniu'
function createUploaderProviderInstance (provider) {
  switch (provider) {
    case 'internal':
      return new InternalUploadProvider()
    case 'qiniu':
      return new QiniuUploadProvider()
    default:
      return new InternalUploadProvider()
  }
}

export default createUploaderProviderInstance
