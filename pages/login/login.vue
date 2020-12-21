<template>
	<view class="login-box">
		<view class="admin-logo">
			<image :src="logo" mode="heightFix"></image>
		</view>
		<view class="uni-header no-padding">
			<view class="uni-title">系统登录</view>
		</view>
		<view class="uni-container">
			<uni-forms ref="form" validateTrigger="bind" :rules="rules" @submit="submit">
				<uni-forms-item left-icon="person" name="username" labelWidth="35">
					<input ref="usernameInput" @confirm="confirmForm('username',$event.detail.value)" class="uni-input-border" type="text" placeholder="账户"
					 @blur="binddata('username',$event.detail.value)" />
				</uni-forms-item>
				<uni-forms-item left-icon="locked" class="icon-container" name="password" labelWidth="35">
					<input ref="passwordInput" @confirm="confirmForm('password',$event.detail.value)" class="uni-input-border" :password="showPassword"
					 placeholder="密码" @blur="binddata('password',$event.detail.value)" />
					<text class="uni-icon-password-eye pointer" :class="[!showPassword ? 'uni-eye-active' : '']" @click="changePassword">&#xe568;</text>
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
	export default {
		data() {
			return {
				...config.navBar,
				showPassword: true,
				loading: false,
				formData: {
					username: '',
					password: '',
				},
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
					}
				}
			}
		},
		mounted(){
			// #ifdef H5
			this.focus()
			// #endif
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
				this.$request('user/login', value)
					.then(res => {
						this.setToken({
							token: res.token,
							tokenExpired: res.tokenExpired
						})
						return this.init().then(() => {
							uni.showToast({
								title: '登录成功',
								icon: 'none'
							})
							uni.redirectTo({
								url: '/pages/index/index'
							})
							// #ifdef H5
							window.location.reload();
							// #endif
						})
					}).catch(err => {

					}).finally(err => {
						this.loading = false
					})

			},
			confirmForm(name, value) {
				this.binddata(name, value)
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
</style>
