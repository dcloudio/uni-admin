<template>
	<view class="login-box">
		<view class="admin-logo">
			<image :src="logo" mode="heightFix"></image>
		</view>
		<view class="uni-header no-padding">
			<view class="uni-title">系统登录</view>
		</view>
		<view class="uni-container">
			<uni-forms ref="form" v-model="formData" :rules="rules" @submit="submit">
				<uni-forms-item left-icon="uni-icons-person-filled" name="username" labelWidth="35">
					<input ref="usernameInput" @confirm="submitForm" class="uni-input-border" type="text" placeholder="账户"
					 v-model="formData.username" />
				</uni-forms-item>
				<uni-forms-item left-icon="uni-icons-locked-filled" class="icon-container" name="password" labelWidth="35">
					<input ref="passwordInput" @confirm="submitForm" class="uni-input-border" :password="showPassword"
					 placeholder="密码" v-model="formData.password" />
					<text class="uni-icon-password-eye pointer" :class="[!showPassword ? 'uni-eye-active' : '']" @click="changePassword">&#xe568;</text>
				</uni-forms-item>
				<uni-forms-item v-if="needCaptcha" left-icon="uni-icons-person-filled" class="icon-container" name="captchaText" labelWidth="35">
					<input ref="captchaInput" @confirm="submitForm" class="uni-input-border" type="text" placeholder="验证码"
					 v-model="formData.captchaText" />
					 <view class="admin-captcha-img pointer" @click="refreshCaptcha">
						<image  :src="captchaBase64" width="100%" height="100%"></image>
					 </view>
				</uni-forms-item>
				<view class="uni-button-group">
					<button class="uni-button uni-button-full" type="primary" :loading="loading" :disabled="loading" @click="submitForm">登录</button>
				</view>
			</uni-forms>
			<view class="uni-tips">
				<text class="uni-tips-text" @click="initAdmin">如无管理员账号，请先创建管理员...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapActions
	} from 'vuex'
	import config from '@/admin.config.js'
	import { getDeviceUUID } from '@/js_sdk/uni-admin/util.js'

	const captchaOptions = {
		deviceId: getDeviceUUID(),
		scene: 'login'
	}

	export default {
		data() {
			return {
				...config.navBar,
				indexPage: config.index.url,
				showPassword: true,
				loading: false,
				formData: {
					username: '',
					password: '',
					captchaText: '',
				},
				needCaptcha: false,
				captchaBase64: '',
				rules: {
					// 对name字段进行必填验证
					username: {
						rules: [{
								required: true,
								errorMessage: '请输入账户',
							},
							{
								minLength: 1,
								maxLength: 30,
								errorMessage: '账户长度在{minLength}到{maxLength}个字符',
							}
						]
					},
					// 对email字段进行必填验证
					password: {
						rules: [{
								required: true,
								errorMessage: '请输入正确的密码',
							},
							{
								minLength: 6,
								errorMessage: '密码长度大于{minLength}个字符',
							}
						]
					},
					// 对email字段进行必填验证
					captchaText: {
						rules: [{
								required: true,
								errorMessage: '请输入验证码',
							}]
					}
				}
			}
		},
		mounted(){
			// #ifdef H5
			this.focus()
			// #endif
			const self = this
			uni.getStorage({
				key: "lastUsername",
				success: function(res) {
					self.formData.username = res.data
				}
			})
		},
		methods: {
			...mapActions({
				init: 'app/init'
			}),
			...mapMutations({
				setToken(commit, tokenInfo) {
					commit('user/SET_TOKEN', tokenInfo)
				}
			}),
			submit(event) {
				if (this.loading) {
					return
				}
				const {
					errors,
					value
				} = event.detail
				if (errors) {
					return
				}
				// #ifdef H5
				this.$refs.usernameInput.$refs.input.blur()
				this.$refs.passwordInput.$refs.input.blur()
				// #endif
				this.loading = true
				this.$request('user/login', {
					...value,
					captchaOptions
				}).then(res => {
					console.log(6666, res);
						if (res.needCaptcha) {
							this.needCaptcha = true
							this.captchaBase64 = res.captchaBase64
						} else {
							this.setToken({
								token: res.token,
								tokenExpired: res.tokenExpired
							})
							return this.init().then(() => {
								uni.showToast({
									title: '登录成功',
									icon: 'none'
								})
								uni.setStorage({
								    key: 'lastUsername',
								    data: value.username
								});
								uni.redirectTo({
									url: this.indexPage,
								})
							})
						}
					}).catch(err => {
						if (err.code === 10002 || 10102) {
							this.refreshCaptcha()
							this.formData.captchaText = ''
							// this.$refs.captchaInput.$refs.input.focus()
						}
					}).finally(err => {
						this.loading = false
					})

			},

			refreshCaptcha(){
				this.$request('user/refreshCaptcha', captchaOptions).then(res => {
					console.log(777, res)
						if (res.code === 0) {
							this.captchaBase64 = res.captchaBase64
						}
					}).catch(err => {
					}).finally(err => {
					})
			},

			confirmForm(name, value) {
				// this.binddata(name, value)
				this.submitForm()
			},
			submitForm() {
				this.$refs.form.submit()
			},
			initAdmin() {
				uni.redirectTo({
					url: '/pages/demo/init/init'
				})
			},
			changePassword: function() {
				this.showPassword = !this.showPassword;
			},
			// #ifdef H5
			focus: function () {
				this.$refs.usernameInput.$refs.input.focus()
			}
			// #endif
		}
	}
</script>

<style>
	page {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		background-color: #fff;
	}

	.login-box {
		position: relative;
		max-width: 420px;
		flex: 1;
		padding: 140px 35px 0;
		margin: 0 auto;
		overflow: hidden;
		/* background-color: #F5F5F5; */
	}


	.underline:hover {
		text-decoration: underline;
	}

	.uni-tips {
		display: flex;
		justify-content: flex-end;
		margin-top: 15px;
	}

	.uni-tips-text {
		cursor: pointer;
		text-decoration: underline;
		font-size: 13px;
		color: #007AFF;
		opacity: 0.8;
	}

	.no-padding {
		padding: 0;
	}

	.admin-logo {
		display: flex;
		justify-content: center;
		margin-bottom: 30px;
	}

	.admin-logo image {
		height: 40px;
	}

	.admin-captcha-img {
		position: absolute;
		top: 0;
		right: 0;
		background-color: #fff;
		width: 80px;
		height: 33px;
		border: 1px #E5E5E5 solid;
		border-radius: 0 5px 5px 0;
	}
	.admin-captcha-img image {
		display: inline;
	}
</style>
