<template>
    <view class="login-box">
        <view class="uni-header">
            <view class="uni-group">
                <view class="uni-title">系统登录</view>
            </view>
        </view>
        <uni-forms ref="form" :form-rules="rules" @submit="submit">
            <uni-forms-item left-icon="person" name="username" labelWidth="35">
                <input class="uni-input-border" type="text" placeholder="账户" @blur="uniFormsValidate('username',$event.detail.value)" />
            </uni-forms-item>
            <uni-forms-item left-icon="locked" name="password" labelWidth="35">
                <input @confirm="confirmForm('password',$event.detail.value)" class="uni-input-border" type="password"
                    placeholder="密码" @blur="uniFormsValidate('password',$event.detail.value)" />
            </uni-forms-item>
            <view class="uni-button-group">
                <button class="uni-button uni-button-full" type="primary" :loading="loading" :disabled="loading" @click="submitForm">登录</button>
            </view>
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
                                errorMessage: '请输入账户',
                                trigger: 'blur'
                            },
                            {
                                minLength: 3,
                                maxLength: 30,
                                errorMessage: '账户长度在{minLength}到{maxLength}个字符',
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
            ...mapActions({
                init: 'app/init'
            }),
            ...mapMutations({
                setToken(commit, tokenInfo) {
                    commit('user/SET_TOKEN', tokenInfo)
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
                        uni.showToast({
                            title: '登录成功',
                            icon: 'none'
                        })
                        uni.redirectTo({
                            url: '/pages/index/index',
                        })
                    }).catch(err => {

                    }).finally(err => {
                        this.loading = false
                    })

            },
            confirmForm(name, value) {
                this.uniFormsValidate(name, value)
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
            enter(e) {
                if (e.keyCode == 13) {
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
