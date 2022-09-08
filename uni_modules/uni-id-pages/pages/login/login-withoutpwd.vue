<!-- 免密登录页 -->
<template>
	<view class="uni-content">
		<!-- 顶部文字 -->
		<text class="title">请选择登录方式</text>
		<!-- 快捷登录框 当url带参数时有效 -->
		<template v-if="['apple','weixin'].includes(type)">
			<text class="tip">将根据第三方账号服务平台的授权范围获取你的信息</text>
			<view class="quickLogin">
				<image @click="quickLogin" :src="imgSrc" mode="widthFix" class="quickLoginBtn"></image>
				<uni-id-pages-agreements scope="register" ref="agreements"></uni-id-pages-agreements>
			</view>
		</template>
		<template v-else>
			<text class="tip">未注册的账号验证通过后将自动注册</text>
			<view class="phone-box">
				<view @click="chooseArea" class="area">+86</view>
				<uni-easyinput :focus="focusPhone" @blur="focusPhone = false" class="input-box" type="number" :inputBorder="false"
					v-model="phone" maxlength="11" placeholder="请输入手机号" />
			</view>
			<uni-id-pages-agreements scope="register" ref="agreements"></uni-id-pages-agreements>
			<button class="uni-btn" type="primary" @click="toSmsPage">获取验证码</button>
		</template>
		<!-- 固定定位的快捷登录按钮 -->
		<uni-id-pages-fab-login ref="uniFabLogin"></uni-id-pages-fab-login>
	</view>
</template>

<script>
	let currentWebview; //当前窗口对象
	import config from '@/uni_modules/uni-id-pages/config.js'
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	export default {
		mixins: [mixin],
		data() {
			return {
				type: "", //快捷登录方式
				phone: "", //手机号码
				focusPhone:false
			}
		},
		computed: {
			async loginTypes() { //读取配置的登录优先级
				return config.loginTypes
			},
			isPhone() { //手机号码校验正则
				return /^1\d{10}$/.test(this.phone);
			},
			imgSrc() { //大快捷登录按钮图
				return '/uni_modules/uni-id-pages/static/login/' + this.type + '.png'
			}
		},
		async onLoad(e) {
			console.log(e);
			let type = e.type
			// console.log({type});
			this.type = type
			
			if(type != 'univerify'){
				this.focusPhone = true
			}
			
			this.$nextTick(() => {
				//关闭重复显示的登录快捷方式
				if (['weixin', 'apple'].includes(type)) {
					this.$refs.uniFabLogin.servicesList = this.$refs.uniFabLogin.servicesList.filter(item =>
						item.id != type)
				}
			})

			uni.$on('uni-id-pages-set-login-type', type => {
				this.type = type
			})
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.toSmsPage()
				}
			};
			// #endif
		},
		onUnload() {
			uni.$off('uni-id-pages-set-login-type')
		},
		onReady() {
			//是否优先启动一键登录。即：页面一加载就启动一键登录
			//#ifdef APP-PLUS
			if (this.type == "univerify") {
				this.type == this.loginTypes[1]
				// console.log('开始一键登录');
				setTimeout(() => {
					this.$refs.uniFabLogin.login_before('univerify')
				}, 100)
			}
			//#endif
		},
		methods: {
			quickLogin() {
				this.$refs.uniFabLogin.login_before(this.type)
			},
			toSmsPage() {
				console.log('toSmsPage',this.agree);
				if (!this.isPhone) {
					this.focusPhone = true
					return uni.showToast({
						title: "手机号码格式不正确",
						icon: 'none'
					});
				}
				if (this.needAgreements && !this.agree) {
					return this.$refs.agreements.popup(this.toSmsPage)
				}
				// 发送验证吗
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-smscode?phoneNumber=' + this.phone
				});
			},
			//去密码登录页
			toPwdLogin() {
				uni.navigateTo({
					url: '../login/password'
				})
			},
			chooseArea() {
				uni.showToast({
					title: '暂不支持其他国家',
					icon: 'none'
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content,
	.quickLogin {
		/* #ifndef APP-NVUE */
		display: flex;
		flex-direction: column;
		/* #endif */
	}

	.phone-box {
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
	}

	.area {
		position: absolute;
		left: 10px;
		z-index: 9;
		top: 12px;
		font-size: 14px;
	}

	.area::after {
		content: "";
		border: 3px solid transparent;
		border-top-color: #000;
		top: 12px;
		left: 3px;
		position: relative;
	}

	.input-box {
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */
		flex: 1;
		padding-left: 45px;
		margin-bottom: 10px;
		border-radius: 0;
	}

	.quickLogin {
		width: 650rpx;
		height: 350px;
		align-items: center;
		justify-content: center;
	}

	.quickLoginBtn {
		margin: 20px 0;
		width: 450rpx;
		height: 82rpx;
	}

	.tip {
		margin-top: -15px;
		margin-bottom: 20px;
	}
</style>
