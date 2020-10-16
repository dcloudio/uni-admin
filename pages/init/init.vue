<template>
    <view class="login-box">
        <view class="flex-cc m-b-30 login-title">
            创建超级管理员
        </view>
        <uni-forms ref="form" :form-rules="rules">
            <uni-field left-icon="person" name="username" v-model="formData.username" labelWidth="35" placeholder="账户"
                :clearable="false" />
            <uni-field left-icon="locked" v-model="formData.password" name="password" type="password" labelWidth="35"
                placeholder="密码" :clearable="false" />
            <uni-field left-icon="locked" class="m-b-30" type="password" name="passwordConfirmation" labelWidth="35"
                v-model="passwordConfirmation" placeholder="确认密码" />
            <button class="login-button flex-cc m-b-30" type="primary" :loading="loading" :disabled="loading" @click="submitForm('form')">创建</button>
            <button class="login-button flex-cc m-b-30" type="default" @click="back">返回</button>
        </uni-forms>
        <view>
            <!-- 账号：admin &nbsp;&nbsp; 密码：123456 -->
        </view>
    </view>

</template>
<script>
    import {
        mapMutations,
        mapActions
    } from 'vuex'
    export default {
        data() {
            return {
                loading: false,
                formData: {
                    username: 'admin',
                    password: '',
                },
                passwordConfirmation: '',
                rules: {
                    // 对name字段进行必填验证
                    username: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入姓名',
                                trigger: 'blur'
                            },
                            {
                                minLength: 3,
                                maxLength: 30,
                                errorMessage: '姓名长度在{minLength}到{maxLength}个字符',
                                trigger: 'change'
                            }
                        ]
                    },
                    // 对email字段进行必填验证
                    password: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入正确的密码',
                                trigger: 'blur'
                            },
                            {
                                minLength: 6,
                                errorMessage: '密码长度大于{minLength}个字符',
                                trigger: 'change'
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
                                trigger: 'change'
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
            async hasAdmin() {
                this.loading = true
                await this.$request('user/hasAdmin')
                .then(res => {
                    if (res[0].role.indexOf("admin") === -1) {
                        this.register()
                    } else {
                        uni.showModal({
                            title: '提示',
                            content: '超级管理员已存在，请登录...',
                            success: (res) => {
                                if (res.confirm) {
                                    uni.navigateTo({
                                        url: '/pages/login/login'
                                    })
                                }
                            }
                        })
                    }
                }).catch(err => {

                }).finally(err => {
                    this.loading = false
                })
            },
            register(e) {
                this.loading = true
                this.$request('user/register', this.formData)
                    .then(res => {
                        if (res.code === 0) {
                            this.setToken({
                                token: res.token,
                                tokenExpired: res.tokenExpired
                            })
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
                        } else {
                            uni.showToast({
                                title: res.msg,
                                icon: 'none',
                            })
                        }
                    }).catch(err => {

                    }).finally(err => {
                        this.loading = false
                    })
            },
            submitForm(form) {
                const password = this.formData.password,
                    passwordConfirmation = this.passwordConfirmation
                this.$refs[form].submit((valid, values) => {
                    if (!valid) {
                        if (password === passwordConfirmation) {
                            this.hasAdmin()
                        } else {
                            uni.showModal({
                                content: '两次输入密码不相同',
                                showCancel: false
                            })
                        }
                    } else {
                        uni.showModal({
                            content: '请填写正确的账户密码',
                            showCancel: false
                        })
                    }
                })
            },
            back(){
                uni.navigateBack()
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
        /* background-color: #F5F5F5; */
    }

    .login-button {
        height: 39px;
        width: 100%;
    }

    .m-b-30 {
        margin-bottom: 30px;
    }
</style>
