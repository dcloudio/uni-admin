<!-- 找回密码页 -->
<template>
	<view class="uni-content">
		<uni-forms ref="form" :value="formData" err-show-type="toast">
			<uni-forms-item name="phone">
				<uni-easyinput :focus="focusPhone" @blur="focusPhone = false" class="input-box" :disabled="lock" type="number" :inputBorder="false"
					v-model="formData.phone" maxlength="11" placeholder="请输入手机号">
				</uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="code">
				<uni-id-pages-sms-form ref="shortCode" :phone="formData.phone" type="reset-pwd-by-sms" v-model="formData.code">
				</uni-id-pages-sms-form>
			</uni-forms-item>
			<uni-forms-item name="password">
				<uni-easyinput :focus="focusPassword" @blur="focusPassword = false" class="input-box" type="password" :inputBorder="false" v-model="formData.password"
					placeholder="请输入新密码"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="password2">
				<uni-easyinput :focus="focusPassword2" @blur="focusPassword2 = false" class="input-box" type="password" :inputBorder="false" v-model="formData.password2"
					placeholder="请再次输入新密码"></uni-easyinput>
			</uni-forms-item>
			<button class="uni-btn send-btn-box" type="primary" @click="submit">提交</button>
		</uni-forms>
		<uni-popup-captcha @confirm="submit" v-model="formData.captcha" scene="reset-pwd-by-sms" ref="popup"></uni-popup-captcha>
	</view>
</template>

<script>
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	const uniIdCo = uniCloud.importObject("uni-id-co",{
		errorOptions:{
			type:'toast'
		}
	})
	export default {
		mixins: [mixin],
		data() {
			return {
				lock: false,
				focusPhone:true,
				focusPassword:false,
				focusPassword2:false,
				formData: {
					"phone": "",
					"code": "",
					'password': '',
					'password2': '',
					"captcha": ""
				},
				rules: {
					phone: {
						rules: [{
								required: true,
								errorMessage: '请输入手机号',
							},
							{
								pattern: /^1\d{10}$/,
								errorMessage: '手机号码格式不正确',
							}
						]
					},
					code: {
						rules: [{
								required: true,
								errorMessage: '请输入短信验证码',
							},
							{
								pattern: /^.{6}$/,
								errorMessage: '请输入6位验证码',
							}
						]
					},
					password: {
						rules: [{
								required: true,
								errorMessage: '请输入新密码',
							},
							{
								pattern: /^.{6,20}$/,
								errorMessage: '密码为6 - 20位',
							}
						]
					},
					password2: {
						rules: [{
								required: true,
								errorMessage: '请确认密码',
							},
							{
								pattern: /^.{6,20}$/,
								errorMessage: '密码为6 - 20位',
							},
							{
								validateFunction: function(rule, value, data, callback) {
									// console.log(value);
									if (value != data.password) {
										callback('两次输入密码不一致')
									};
									return true
								}
							}
						]
					}
				}
			}
		},
		computed: {
			isPhone() {
				let reg_phone = /^1\d{10}$/;
				let isPhone = reg_phone.test(this.formData.phone);
				return isPhone;
			},
			isPwd() {
				let reg_pwd = /^.{6,20}$/;
				let isPwd = reg_pwd.test(this.formData.password);
				return isPwd;
			},
			isCode() {
				let reg_code = /^\d{6}$/;
				let isCode = reg_code.test(this.formData.code);
				return isCode;
			}
		},
		onLoad(event) {
			if (event && event.phoneNumber) {
				this.formData.phone = event.phoneNumber;
				if(event.lock){
					this.lock = event.lock //如果是已经登录的账号，点击找回密码就锁定指定的账号绑定的手机号码
					this.focusPhone = true
				}
			}
		},
		onReady() {
			if (this.formData.phone) {
				this.$refs.shortCode.start();
			}
			this.$refs.form.setRules(this.rules)
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.submit()
				}
			};
			// #endif
		},
		methods: {
			/**
			 * 完成并提交
			 */
			submit() {
				console.log("formData", this.formData);
				console.log('rules', this.rules);
				this.$refs.form.validate()
					.then(res => {
						let {
							"phone": mobile,
							"password": password,
							captcha,
							code
						} = this.formData
						uniIdCo.resetPwdBySms({
								mobile,
								code,
								password,
								captcha
							}).then(e => {
								console.log(e);
								uni.navigateBack()
							})
							.catch(e => {
								if (e.errCode == 'uni-id-captcha-required') {
									this.$refs.popup.open()
								}
							}).finally(e => {
								this.formData.captcha = ""
							})
					}).catch(errors=>{
						let key = errors[0].key
						if(key == 'code'){
							console.log(this.$refs.shortCode);
							return this.$refs.shortCode.focusSmsCodeInput = true
						}
						key = key.replace(key[0], key[0].toUpperCase())
						console.log(key,'focus'+key);
						this['focus'+key] = true
					})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content {
		margin-top: 15px;
	}
</style>
