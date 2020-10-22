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
                    <input class="uni-input-border" type="text" placeholder="账户" @blur="binddata('username',$event.detail.value)" />
                </uni-forms-item>

                <uni-forms-item left-icon="locked" name="password" labelWidth="35">
                    <input class="uni-input-border" :password="showPassword" placeholder="密码" @blur="binddata('password',$event.detail.value)" />
					<text class="uni-icon-password-eye pointer" :class="[!showPassword ? 'uni-eye-active' : '']" @click="changePassword">&#xe568;</text>
				</uni-forms-item>

                <uni-forms-item left-icon="locked" name="passwordConfirmation" labelWidth="35" :errorMessage="errorMessage">
                    <input @confirm="confirmForm('passwordConfirmation',$event.detail.value)" @blur="binddata('passwordConfirmation',$event.detail.value)"
                        class="uni-input-border" :password="showPasswordAgain" placeholder="确认密码" />
					<text class="uni-icon-password-eye pointer" :class="[!showPasswordAgain ? 'uni-eye-active' : '']" @click="changePasswordAgain">&#xe568;</text>
				</uni-forms-item>
                <view class="uni-button-group">
                    <button class="uni-button" type="primary" :loading="loading" :disabled="loading" @click="submitForm">创建</button>
                    <button class="uni-button" type="default" @click="back">返回</button>
                </view>

            </uni-forms>
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
                                trigger: 'blur'
                            },
                            {
                                minLength: 3,
                                maxLength: 30,
                                errorMessage: '账户长度在{minLength}到{maxLength}个字符',
                                trigger: 'blur'
                            }
                        ]
                    },
                    // 对email字段进行必填验证
                    password: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入密码',
                                trigger: 'blur'
                            },
                            {
                                minLength: 6,
                                errorMessage: '密码长度大于{minLength}个字符',
                                trigger: 'blur'
                            }
                        ]
                    },
                    passwordConfirmation: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入确认密码',
                                trigger: 'blur'
                            },
                            {
                                minLength: 6,
                                errorMessage: '密码长度最小{minLength}个字符',
                                trigger: 'blur'
                            }
                        ]
                    }
                }
            }
        },
        methods: {
            ...mapMutations({
                setToken(commit, tokenInfo) {
                    commit('user/SET_TOKEN', tokenInfo)
                }
            }),
            register(formData) {
                this.loading = true
                this.$request('user/register', formData)
                    .then(res => {
                        uni.showModal({
                            title: '提示',
                            content: res.msg,
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
			}
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
    }

    .login-box {
        position: relative;
        max-width: 420px;
        flex: 1;
        padding: 180px 35px 0;
        margin: 0 auto;
        overflow: hidden;
    }

    .uni-button {
        width: 184px;
    }
</style>
