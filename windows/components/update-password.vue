<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">修改密码</view>
			</view>
		</view>
		<view class="uni-container">
			<uni-forms ref="resetPwdForm" v-model="password" :rules="rules" @submit="submit">
				<uni-forms-item label="旧密码" name="oldPassword" labelWidth="85">
					<input class="uni-input-border" type="password" placeholder="旧密码" v-model="password.oldPassword" />
				</uni-forms-item>

				<uni-forms-item label="新密码" name="newPassword" labelWidth="85">
					<input class="uni-input-border" :password="showPassword" placeholder="新密码" v-model="password.newPassword" />
					<text class="uni-icon-password-eye pointer" :class="[!showPassword ? 'uni-eye-active' : '']" @click="changePassword">&#xe568;</text>
				</uni-forms-item>

				<uni-forms-item label="确认新密码" name="passwordConfirmation" labelWidth="85" :errorMessage="errorMessage">
					<input @confirm="submitForm" class="uni-input-border" :password="showPasswordAgain"
					 placeholder="确认新密码" v-model="password.passwordConfirmation" />
					<text class="uni-icon-password-eye pointer" :class="[!showPasswordAgain ? 'uni-eye-active' : '']" @click="changePasswordAgain">&#xe568;</text>
				</uni-forms-item>
				<view class="uni-button-group pointer">
					<button class="uni-button uni-button-full" type="primary" :disabled="isLoading" @click="submitForm">保存</button>
					<button v-if="hasBackButton" class="uni-button login-button-width" type="default" :disabled="isLoading" @click="back">返回</button>
				</view>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import config from '@/admin.config.js'
	export default {
		data() {
			return {
				isLoading: false,
				showPassword: true,
				showPasswordAgain: true,
				errorMessage: '',
				password: {
					oldPassword: '',
					newPassword: '',
					passwordConfirmation: ''
				},
				rules: {
					oldPassword: {
						rules: [{
							required: true,
							errorMessage: '请输入旧密码'
						}]
					},
					newPassword: {
						rules: [{
								required: true,
								errorMessage: '请输入新密码'
							},
							{
								minLength: 6,
								errorMessage: '密码长度最小{minLength}个字符'
							}
						]
					},
					passwordConfirmation: {
						rules: [{
								required: true,
								errorMessage: '请确认新密码'
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
		props: {
			hasBackButton: {
				type: Boolean,
				default: false
			},
			isPhone: {
				type: Boolean,
				default: true
			}
		},
		computed: {
			...mapState('user', ['userInfo'])
		},
		methods: {
			...mapMutations({
				removeToken(commit) {
					commit('user/REMOVE_TOKEN')
				}
			}),
			submit(event) {
				const {
					errors,
					value
				} = event.detail
				if (errors) return
				if (value.newPassword === value.passwordConfirmation) {
					this.save(value)
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
				this.$refs.resetPwdForm.submit()
			},
			save(formData) {
				this.isLoading = true
				this.$request('updatePwd', formData, {
					functionName: 'uni-id-cf'
				}).then(res => {
					this.isLoading = false
					if (res.code === 0) {
						uni.showModal({
							title: '提示',
							content: res.message,
							showCancel: false,
							success: (res) => {
								if (res.confirm) {
									this.$emit('closePasswordPopup')
									this.removeToken()
									uni.reLaunch({
										url: config.login.url
									})
								}
							}
						});
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration: 2000
						})
					}
				}).catch(res => {

				}).finally(err => {
					this.isLoading = false
				})
			},
			back() {
				uni.navigateBack()
			},
			changePassword: function() {
				this.showPassword = !this.showPassword;
			},
			changePasswordAgain: function() {
				this.showPasswordAgain = !this.showPasswordAgain;
			}
		}
	}
</script>


<style>
	.uni-forms {
		width: 100%;
	}

	.login-button-width {
		width: 184px;
	}
</style>
