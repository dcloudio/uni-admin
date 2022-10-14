<script>
	import {
		mapGetters,
		mapActions,
		mapMutations
	} from 'vuex'
	import config from '@/admin.config.js'
	import {
		version
	} from './package.json'
	export default {
		created() {
			this.clear = undefined
		},
		methods: {
			...mapActions({
				init: 'app/init'
			}),
			clearPlatform() {
				const keysOfPlatform = uni.getStorageInfoSync().keys.filter(key => key.indexOf('platform') > -1)
				keysOfPlatform.length && keysOfPlatform.forEach(key => uni.removeStorageSync(key))
			}
		},
		onPageNotFound(msg) {
			uni.redirectTo({
				url: config.error.url
			})
		},
		onLaunch: function() {
			// #ifdef H5
			console.log(
				`%c uni-admin %c v${version} `,
				'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
				'background:#007aff ;padding: 1px; border-radius: 0 3px 3px 0;  color: #fff; font-weight: bold;'
			)
			// #endif
			// 线上示例使用
			// console.log('%c uni-app官方团队诚邀优秀前端工程师加盟，一起打造更卓越的uni-app & uniCloud，欢迎投递简历到 hr2013@dcloud.io', 'color: red');
			console.log('App Launch')
			if (this.$uniIdPagesStore.store.hasLogin) {
				this.init()
			}

			// 登录成功回调
			uni.$on('uni-id-pages-login-success', () => {
				this.init()
			})
		},
		onShow: function() {
			console.log('App Show')
			this.clear = setInterval(() => this.clearPlatform(), 15*60*1000)
		},
		onHide: function() {
			console.log('App Hide')
			this.clear && clearInterval(this.clear)
		}
	}
</script>

<style lang="scss">
	@import '@/common/uni.css';
	@import '@/common/uni-icons.css';
	@import '@/common/admin-icons.css';
	@import '@/common/theme.scss';
</style>
