import loginSuccess from './loginSuccess.js';
import config from '@/uni_modules/uni-id-pages/config.js'
let mixin = {
	data() {
		return {
			config,
			isMounted:false
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
	computed: {
		needAgreements(){
			if(this.isMounted){
				if (this.$refs.agreements) {
					return this.$refs.agreements.needAgreements
				} else {
					return false
				}
			}
		},
		agree: {
			get() {
				if(this.isMounted){
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
				}else{
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
