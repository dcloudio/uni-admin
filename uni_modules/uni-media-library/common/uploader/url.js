import Uploader from './base';
import UploaderFile from "./struct/upload-file";

export class FromURLUploader extends Uploader {
  constructor(props) {
    super(props);
  }

  normalizeFiles(files) {
    return files.map(file => {
      return new UploaderFile({
        id: file.id,
        uploadId: file.uploadId,
        name: file.name,
        originUrl: file.url,
        thumbUrl: file.thumbUrl || file.url,
        mediaType: file.mediaType
      })
    })
  }
}
