const errSubject = "uni-map-common";

class UniCloudError {
	constructor(options = {}) {
		this.errCode = options.errCode || options.code;
		this.errMsg = options.errMsg || options.msg || options.message || "";
		this.errSubject = options.subject || errSubject;
	}
}

module.exports = {
	UniCloudError
}