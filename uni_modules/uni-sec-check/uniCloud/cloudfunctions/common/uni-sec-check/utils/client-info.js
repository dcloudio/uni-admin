function getClientInfo (requestId) {
    if (!requestId) return undefined

    const clientInfos = uniCloud.getClientInfos()

    for (const clientInfo of clientInfos) {
        if (clientInfo.requestId === requestId) {
            return clientInfo
        }
    }
}

module.exports = {
    getClientInfo
}
