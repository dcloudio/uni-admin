export default function(e = {}) {
	const {
		showToast = true, toastText = '登录成功', autoBack = true
	} = e
	console.log({
		toastText,
		autoBack
	});
	if (showToast) {
		uni.showToast({
			title: toastText,
			icon: 'none'
		});
	}
	if (autoBack) {
		let delta = 0; //判断需要返回几层
		let pages = getCurrentPages();
		uni.$emit('uni-id-pages-login-success',pages)
		console.log(pages);
		pages.forEach((page, index) => {
			if (pages[pages.length - index - 1].route.split('/')[3] == 'login') {
				delta++
			}
		})
		console.log('判断需要返回几层:',pages, delta);
		// #ifdef H5
		if(e.loginType == 'weixin'){
			console.log('window.history',window.history);
			return window.history.go(-3)
		}
		// #endif
		
		uni.navigateBack({
			delta
		})
	}
}
