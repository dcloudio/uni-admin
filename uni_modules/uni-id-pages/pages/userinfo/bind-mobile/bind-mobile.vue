<!-- 绑定手机号码页 -->
<template>
	<view class="uni-content">
		<!-- 登录框 (选择手机号所属国家和地区需要另行实现) -->
		<uni-easyinput clearable :focus="focusMobile" @blur="focusMobile = false" type="number" class="input-box" :inputBorder="false" v-model="formData.mobile"
			maxlength="11" placeholder="请输入手机号"></uni-easyinput>
		<uni-id-pages-sms-form ref="smsForm" type="bind-mobile-by-sms" v-model="formData.code" :phone="formData.mobile">
		</uni-id-pages-sms-form>
		<button class="uni-btn send-btn-box" type="primary" @click="submit">提交</button>
		<uni-popup-captcha @confirm="submit" v-model="formData.captcha" scene="bind-mobile-by-sms" ref="popup">
		</uni-popup-captcha>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				formData: {
					mobile: "",
					code: "",
					captcha: ""
				},
				focusMobile:true
			}
		},
		computed: {
			tipText() {
				return `验证码已通过短信发送至 ${this.formData.mobile}。密码为6 - 20位`
			}
		},
		onLoad(event) {},
		onReady() {},

		methods: {
			/**
			 * 完成并提交
			 */
			submit() {
				if(! /^1\d{10}$/.test(this.formData.mobile)){
					this.focusMobile = true 
					return uni.showToast({
						title: '手机号码格式不正确',
						icon: 'none'
					});
				}
				if(! /^\d{6}$/.test(this.formData.code)){
					this.$refs.smsForm.focusSmsCodeInput = true 
					return uni.showToast({
						title: '验证码格式不正确',
						icon: 'none'
					});
				}
				
				console.log(this.formData);
				const uniIdCo = uniCloud.importObject("uni-id-co")
				uniIdCo.bindMobileBySms(this.formData).then(e => {
					console.log(e);
					uni.showToast({
						title: e.errMsg,
						icon: 'none'
					});
					// #ifdef APP-NVUE
					const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE
					// #endif
					// #ifndef APP-NVUE
					const eventChannel = this.getOpenerEventChannel();
					// #endif
					eventChannel.emit('getUserInfo')
					uni.navigateBack()
				}).catch(e => {
					console.log(e);
					if (e.errCode == 'uni-id-captcha-required') {
						this.$refs.popup.open()
					}
				}).finally(e => {
					this.formData.captcha = ""
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content {
		padding: 0;
		align-items: center;
		justify-content: center;
		padding: 50rpx;
		padding-top: 10px;
	}

	/* #ifndef APP-NVUE  || VUE3 */
	.uni-content ::v-deep .uni-easyinput__content {}

	/* #endif */
	.input-box {
		width: 100%;
		margin-top: 16px;
		background-color: #f9f9f9;
		border-radius: 6rpx;
		flex-direction: row;
		flex-wrap: nowrap;
		margin-bottom: 10px;
	}

	.send-btn-box {
		margin-top: 15px;
	}
</style>
