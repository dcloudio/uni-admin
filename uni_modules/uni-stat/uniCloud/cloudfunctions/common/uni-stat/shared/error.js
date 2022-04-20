module.exports = class UniCloudError extends Error {
  constructor (options) {
    super(options.message)
    this.errMsg = options.message || ''
    Object.defineProperties(this, {
      message: {
        get () {
          return `errCode: ${options.code || ''} | errMsg: ` + this.errMsg
        },
        set (msg) {
          this.errMsg = msg
        }
      }
    })
  }
}
