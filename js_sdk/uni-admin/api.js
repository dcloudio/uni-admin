export function initApi() {
    // 先简单处理一下 setClipboardData
    // #ifdef H5
    uni.setClipboardData = function setClipboardData({
        data,
        success,
        fail,
        complete
    } = {}) {
        try {
            const x = window.scrollX
            const y = window.scrollY
            const input = document.createElement('input')
            input.setAttribute('readonly', 'readonly')
            input.setAttribute('value', data)
            input.style.position = 'absolute'
            input.style.width = '100px'
            input.style.left = '-10000px'
            document.body.appendChild(input)
            input.focus()
            window.scrollTo(x, y)
            input.setSelectionRange(0, input.value.length)
            document.execCommand('copy')
            document.body.removeChild(input)
            setTimeout(() => {
                const res = {
                    errMsg: 'setClipboardData:ok',
                    data
                }
                success && success(res)
                complete && complete(res)
            })
        } catch (e) {
            setTimeout(() => {
                const res = {
                    errMsg: 'setClipboardData:fail'
                }
                fail && fail(res)
                complete && complete(res)
            })
        }
    }
    // #endif
}
