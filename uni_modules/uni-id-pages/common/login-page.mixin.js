import loginSuccess from './loginSuccess.js';
import config from '@/uni_modules/uni-id-pages/config.js'
let mixin = {
	data() {
		return {
			config,
			isMounted: false
		}
	},
	onUnload() {
		// #ifdef H5
		document.onkeydown = false
		// #endif
	},
	mounted() {
		this.isMounted = true;
	},
	onLoad(e) {
		if (e.is_weixin_redirect) {
			uni.showLoading({
				mask: true
			})
			
			if( window.location.href.includes('#') ){
				// 将url通过 ? 分割获取后面的参数字符串 再通过 & 将每一个参数单独分割出来
				let paramsArr = window.location.href.split('?')[1].split('&')
				paramsArr.forEach(item=>{
					let arr = item.split('=')
					if(arr[0] == 'code'){
						 e.code = arr[1]
					}
				})
			}
			this.$nextTick(n => {
				console.log(this.$refs.uniFabLogin);
				this.$refs.uniFabLogin.login({
					code:e.code
				}, 'weixin')
			})
		}
	},
	computed: {
		needAgreements() {
			if (this.isMounted) {
				if (this.$refs.agreements) {
					return this.$refs.agreements.needAgreements
				} else {
					return false
				}
			}
		},
		agree: {
			get() {
				if (this.isMounted) {
					if (this.$refs.agreements) {
						return this.$refs.agreements.isAgree
					} else {
						return true
					}
				}
			},
			set(agree) {
				if (this.$refs.agreements) {
					this.$refs.agreements.isAgree = agree
				} else {
					console.log('不存在 隐私政策协议组件');
				}
			}
		}
	},
	methods: {
		loginSuccess(e) {
			loginSuccess(e)
		}
	}
}
export default mixin
