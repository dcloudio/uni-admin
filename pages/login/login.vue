<template>
    <view class="login-box">
        <view class="uni-header">
            <view class="uni-button-group">
                <view class="uni-title">系统登录</view>
            </view>
        </view>
        <uni-forms ref="form" :form-rules="rules" @submit="submit">
            <uni-forms-item left-icon="person" name="username" labelWidth="35">
                <input class="uni-input-border" type="text" placeholder="账户" @blur="uniFormsValidate('username',$event.detail.value)"/>
            </uni-forms-item>
            <uni-forms-item left-icon="locked" name="password" labelWidth="35">
                <input class="uni-input-border" type="password" placeholder="密码" @blur="uniFormsValidate('password',$event.detail.value)"/>
            </uni-forms-item>
            <button class="uni-button-full" type="primary" :loading="loading" :disabled="loading" @click="submitForm('form')">登录</button>
        </uni-forms>
        <view class="uni-tips">
            <text class="uni-tips-text" @click="initAdmin">如无管理员账号，请先创建管理员...</text>
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
                },
                setNavMenu(commit, navMenu) {
                    commit('app/SET_NAV_MENU', navMenu)
                },
                setUserInfo(commit, userInfo) {
                    commit('user/SET_USER_INFO', userInfo, {
                        root: true
                    })
                }
            }),
            submit(event) {
                const {
                    errors,
                    value
                } = event.detail
                if (errors) {
                    // uni.showModal({
                    //     content: '请填写正确的账户密码',
                    //     showCancel: false
                    // })
                    return
                }

                this.loading = true
                this.$request('user/login', value)
                    .then(res => {
                        this.setToken({
                            token: res.token,
                            tokenExpired: res.tokenExpired
                        })
                        this.init()
                    }).catch(err => {

                    }).finally(err => {
                        this.loading = false
                    })

            },
            init() {
                this.$request('app/init')
                    .then(res => {
                        const {
                            navMenu,
                            userInfo
                        } = res
                        uni.showToast({
                            title: '登录成功',
                            icon: 'none'
                        })
                        uni.redirectTo({
                            url: '/pages/index/index'
                        })
                        this.setNavMenu(navMenu)
                        this.setUserInfo(userInfo)
                    })
            },
            submitForm(form) {
                this.$refs[form].submit()
            },
            initAdmin() {
                uni.redirectTo({
                    url: '/pages/demo/init/init'
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

    .uni-button-full {
        margin-top: 30px;
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
        font-size: 14px;
        color: #007AFF;
        opacity: 0.8;
    }
</style>
