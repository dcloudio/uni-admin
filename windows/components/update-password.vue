<template>
    <view>
        <view class="uni-header">
            <view class="uni-button-group">
                <view class="uni-title">修改密码</view>
            </view>
        </view>
        <uni-forms ref="form" :form-rules="rules" @submit="submit">
            <uni-forms-item label="旧密码" name="oldPassword" labelWidth="85">
                <input class="uni-input-border" type="password" placeholder="旧密码" @blur="uniFormsValidate('oldPassword',$event.detail.value)" />
            </uni-forms-item>

            <uni-forms-item label="新密码" name="newPassword" labelWidth="85">
                <input class="uni-input-border" type="password" placeholder="新密码" @blur="uniFormsValidate('newPassword',$event.detail.value)" />
            </uni-forms-item>

            <uni-forms-item label="确认新密码" name="passwordConfirmation" labelWidth="85" :errorMessage="errorMessage">
                <input @confirm="confirmForm('passwordConfirmation',$event.detail.value)" class="uni-input-border" type="password" placeholder="确认新密码" @blur="uniFormsValidate('passwordConfirmation',$event.detail.value)" />
            </uni-forms-item>
            <button class="login-button" type="primary" size="mini" :disabled="isLoading" @click="submitForm">保存</button>
            <button v-if="hasBackButton" class="login-button login-button-margin" type="default" size="mini" :disabled="isLoading"
                @click="back">返回</button>
        </uni-forms>
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
                            errorMessage: '请输入旧密码',
                            trigger: 'blur'
                        }]
                    },
                    newPassword: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入新密码',
                                trigger: 'blur'
                            },
                            {
                                minLength: 6,
                                errorMessage: '密码长度最小{minLength}个字符',
                                trigger: 'blur'
                            }
                        ]
                    },
                    passwordConfirmation: {
                        rules: [{
                                required: true,
                                errorMessage: '请确认新密码',
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
                this.uniFormsValidate(name, value)
                this.submitForm()
            },
            submitForm() {
                this.errorMessage = ''
                this.$refs.form.submit()
            },
            save(formData) {
                let that = this
                this.isLoading = true
                this.$request('self/changePwd', formData).then(res => {
                    this.isLoading = false
                    if (res.code === 0) {
                        uni.showModal({
                            title: '提示',
                            content: res.msg,
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
                            title: res.msg,
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
            }

        }
    }
</script>


<style>
    page {
        background-color: #fff;
        padding: 20px;
    }

    .uni-forms {
        width: 100%;
    }

    .uni-header {
        margin-bottom: 15px;
    }

    .uni-input-border {
        padding: 0 10px;
        width: 100%;
        height: 35px;
        font-size: 14px;
        color: #666;
        border: 1px #e5e5e5 solid;
        border-radius: 5px;
    }

    .login-button {
        margin-top: 30px;
        height: 40px;
        width: 100%;
        font-size: 16px;
    }

    .login-button-margin {
        margin-top: 15px;
    }
</style>
