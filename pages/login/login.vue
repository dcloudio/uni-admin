<template>
    <view class="login-box">
        <view class="flex-cc m-b-30 login-title">
            系统登录
        </view>
        <uni-forms ref="form" :form-rules="rules" @submit="submit">
            <uni-field left-icon="person" name="username" v-model="formData.username" labelWidth="35" placeholder="账户"
                :clearable="false" />
            <uni-field class="m-b-30" left-icon="locked" v-model="formData.password" name="password" type="password"
                labelWidth="35" placeholder="密码" :clearable="false" />
            <button class="login-button flex-cc m-b-30" type="primary" :loading="loading" @click="submitForm('form')">登录</button>
        </uni-forms>
        <view>
            账号：admin &nbsp;&nbsp; 密码：123456
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
                    username: '',
                    password: '',
                },
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
            ...mapActions({
                init: 'app/init'
            }),
            submit(e) {
                this.loading = true
                uniCloud.callFunction({
                    name: 'uni-admin',
                    data: {
                        action: 'user/login',
                        data: this.formData,
                    }
                }).then(res => {
                    this.loading = false
                    if (res.result.code) {
                        uni.showModal({
                            content: res.result.message || '登录失败',
                            showCancel: false
                        })
                        return
                    }
                    this.setToken({
                        token: res.result.token,
                        tokenExpired: res.result.tokenExpired
                    })
                    this.init()
                    uni.showToast({
                        title: '登录成功',
                        icon: 'none'
                    })
                    uni.redirectTo({
                        url: '/pages/index/index'
                    })
                }).catch(err => {
                    this.loading = false
                    uni.showModal({
                        content: '登录失败：' + err.message,
                        showCancel: false
                    })
                })
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
        /* background-color: #28273D; */
    }

    .login-box {
        position: relative;
        width: 420px;
        max-width: 100%;
        padding: 180px 35px 0;
        margin: 0 auto;
        overflow: hidden;
        /* background-color: #F5F5F5; */
    }

    .flex-cc {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .m-b-30 {
        margin-bottom: 30px;
    }

    .login-title {
        font-size: 24px;
        color: #333;
    }

    .p-lr-0 {
        padding-left: 0;
        padding-right: 0;
    }

    .login-button {
        height: 39px;
        width: 100%;
    }
</style>
