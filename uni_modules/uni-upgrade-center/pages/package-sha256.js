export function isValidPackageSha256(value) {
	return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value)
}

// HTTP 下载链接就是客户端实际下载的对象；file_id 仅保留清理归属，不能覆盖手填链接。
export function getPackageSha256Source(data) {
	const downloadUrl = data.url || ''
	const referenceFileID = data.file_id || ''
	const referenceDomain = data.file_domain || ''
	if (/^https?:\/\//i.test(downloadUrl)) {
		return { type: 'url', fileID: downloadUrl, domain: '', downloadUrl, referenceFileID, referenceDomain }
	}
	if (referenceFileID && (!downloadUrl || downloadUrl === referenceFileID)) {
		return { type: 'file', fileID: referenceFileID, domain: referenceDomain, downloadUrl, referenceFileID, referenceDomain }
	}
	return null
}

export function isSamePackageSha256Source(left, right) {
	return !!left && !!right && ['type', 'fileID', 'domain', 'downloadUrl', 'referenceFileID', 'referenceDomain']
		.every(key => left[key] === right[key])
}
