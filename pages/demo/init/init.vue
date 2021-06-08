<template>
	<view class="login-box">
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">创建超级管理员</view>
			</view>
		</view>
		<view class="uni-container">
			<uni-forms ref="form" validateTrigger="bind" :rules="rules" @submit="submit">
				<uni-forms-item left-icon="person" name="username" labelWidth="35">
					<input ref="usernameInput" class="uni-input-border" type="text" placeholder="账户" @blur="binddata('username',$event.detail.value)" />
				</uni-forms-item>

				<uni-forms-item left-icon="locked" name="password" labelWidth="35">
					<input class="uni-input-border" :password="showPassword" placeholder="密码" @blur="binddata('password',$event.detail.value)" />
					<text class="uni-icon-password-eye pointer" :class="[!showPassword ? 'uni-eye-active' : '']" @click="changePassword">&#xe568;</text>
				</uni-forms-item>

				<uni-forms-item left-icon="locked" name="passwordConfirmation" labelWidth="35" :errorMessage="errorMessage">
					<input ref="passwordInput" @confirm="confirmForm('passwordConfirmation',$event.detail.value)" @blur="binddata('passwordConfirmation',$event.detail.value)"
					 class="uni-input-border" :password="showPasswordAgain" placeholder="确认密码" />
					<text class="uni-icon-password-eye pointer" :class="[!showPasswordAgain ? 'uni-eye-active' : '']" @click="changePasswordAgain">&#xe568;</text>
				</uni-forms-item>
				<view class="uni-button-group">
					<button class="uni-button" type="primary" :loading="loading" :disabled="loading" @click="submitForm">创建</button>
					<button class="uni-button" type="default" @click="back">返回</button>
				</view>

			</uni-forms>
		</view>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
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
				showPassword: true,
				showPasswordAgain: true,
				loading: false,
				errorMessage: '',
				formData: {
					username: 'admin',
					password: ''
				},
				passwordConfirmation: '',
				rules: {
					// 对name字段进行必填验证
					username: {
						rules: [{
								required: true,
								errorMessage: '请输入账户',
							},
							{
								minLength: 3,
								maxLength: 30,
								errorMessage: '账户长度在{minLength}到{maxLength}个字符'
							}
						]
					},
					// 对email字段进行必填验证
					password: {
						rules: [{
								required: true,
								errorMessage: '请输入密码',
							},
							{
								minLength: 6,
								errorMessage: '密码长度大于{minLength}个字符'
							}
						]
					},
					passwordConfirmation: {
						rules: [{
								required: true,
								errorMessage: '请输入确认密码',
							},
							{
								minLength: 6,
								errorMessage: '密码长度最小{minLength}个字符'
							}
						]
					}
				}
			}
		},
		mounted() {
			// #ifdef H5
			this.focus()
			// #endif
		},
		methods: {
			...mapMutations({
				setToken(commit, tokenInfo) {
					commit('user/SET_TOKEN', tokenInfo)
				}
			}),
			register(formData) {
				// #ifdef H5
				this.$refs.passwordInput.$refs.input.blur()
				// #endif
				this.loading = true
				this.$request('registerAdmin', formData, {
					functionName: 'uni-id-cf'
				}).then(res => {
						uni.showModal({
							title: '提示',
							content: res.code ? res.message : '创建成功',
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									uni.navigateTo({
										url: '/pages/login/login'
									})
								}
							}
						})
					}).catch(err => {}).finally(err => {
						this.loading = false
					})
			},
			submit(event) {
				if (this.loading) {
					return
				}
				const {
					errors,
					value
				} = event.detail
				if (errors) return
				if (value.password === value.passwordConfirmation) {
					this.register(value)
				} else {
					this.errorMessage = '两次输入密码不相同'
				}

			},
			confirmForm(name, value) {
				this.binddata(name, value)
				this.submitForm()
			},
			submitForm() {
				this.errorMessage = ''
				this.$refs.form.submit()
			},
			back() {
				uni.redirectTo({
					url: config.login.url
				})
			},
			changePassword: function() {
				this.showPassword = !this.showPassword;
			},
			changePasswordAgain: function() {
				this.showPasswordAgain = !this.showPasswordAgain;
			},
			// #ifdef H5
			focus: function() {
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
		/* align-items: center; */
		justify-content: center;
		background-color: #fff;
		/* #ifndef H5 */
		padding-top: 85px;
		/* #endif */
	}

	.login-box {
		position: relative;
		max-width: 420px;
		flex: 1;
		padding: 140px 35px 0;
		margin: 0 auto;
		overflow: hidden;
	}

	.uni-button {
		width: 184px;
	}
</style>
