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
		// console.log(pages);
		pages.forEach((page, index) => {
			if (pages[pages.length - index - 1].route.split('/')[3] == 'login') {
				delta++
			}
		})
		console.log('判断需要返回几层:', delta);
		uni.navigateBack({
			delta
		})
	}
}
