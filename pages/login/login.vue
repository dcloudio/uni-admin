<template>
    <view class="login-box">
        <view class="uni-header">
            <view class="uni-button-group">
                <view class="uni-title">系统登录</view>
            </view>
        </view>
        <uni-forms ref="form" :form-rules="rules" @submit="submit">
            <uni-field class="p-lr-0" left-icon="person" name="username" v-model="formData.username" labelWidth="35"
                placeholder="账户" :clearable="false" />
            <uni-field class="m-b-30 p-lr-0" left-icon="locked" v-model="formData.password" name="password" type="password"
                labelWidth="35" placeholder="密码" :clearable="false" />
            <button class="login-button flex-cc m-b-30" type="primary" :loading="loading" :disabled="loading" v-on:click="submitForm('form')">登录</button>
        </uni-forms>
        <view>
            <text class="uni-tips pointer underline" @click="initAdmin">如无管理员账号，请先创建管理员...</text>
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
        mounted() {
            document.addEventListener('keydown', this.enter)
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
                    uni.showModal({
                        content: '请填写正确的账户密码',
                        showCancel: false
                    })
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
                const that = this
                this.$request('system/init')
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
                            url: '/pages/index/index',
                        })
                        this.setNavMenu(navMenu)
                        this.setUserInfo(userInfo)
                        document.removeEventListener('keydown', that.enter)
                    })
            },
            submitForm(form) {
                this.$refs[form].submit()
            },
            initAdmin() {
                uni.redirectTo({
                    url: '/pages/demo/init/init'
                })
            },
            enter(e){
                if(e.keyCode == 13){
                    this.submitForm('form')
                }
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

    .underline:hover {
        text-decoration: underline;
    }

    .uni-tips {
        font-size: 14px;
        color: #666;
    }
</style>
