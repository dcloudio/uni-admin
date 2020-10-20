<template>
    <view class="login-box">
        <view class="uni-header">
            <view class="uni-button-group">
                <view class="uni-title">创建超级管理员</view>
            </view>
        </view>
        <uni-forms ref="form" :form-rules="rules" @submit="submit">
            <uni-forms-item left-icon="person" name="username" labelWidth="35">
                <input class="uni-input-border" type="text" placeholder="账户" @blur="uniFormsValidate('username',$event.detail.value)"/>
            </uni-forms-item>

            <uni-forms-item left-icon="locked" name="password" labelWidth="35">
                <input class="uni-input-border" type="password" placeholder="密码" @blur="uniFormsValidate('password',$event.detail.value)"/>
            </uni-forms-item>

            <uni-forms-item left-icon="locked" name="passwordConfirmation" labelWidth="35" :errorMessage="errorMessage">
                <input class="uni-input-border" type="password" placeholder="确认密码" @blur="uniFormsValidate('passwordConfirmation',$event.detail.value)"/>
            </uni-forms-item>
            <button class="login-button" type="primary" :loading="loading" :disabled="loading" @click="submitForm('form')">创建</button>
            <button class="login-button login-button-margin" type="default" @click="back">返回</button>
        </uni-forms>
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
                loading: false,
                errorMessage:'',
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
                                errorMessage: '请输入姓名',
                                trigger: 'blur'
                            },
                            {
                                minLength: 3,
                                maxLength: 30,
                                errorMessage: '姓名长度在{minLength}到{maxLength}个字符',
                                trigger: 'blur'
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
            submit(event){
                const {errors,value} = event.detail
                if(errors) return
                if (value.password === value.passwordConfirmation) {
                    this.register(value)
                } else {
                    this.errorMessage = '两次输入密码不相同'
                }

            },
            submitForm() {
                this.errorMessage = ''
                this.$refs.form.submit()
            },
            back() {
                uni.redirectTo({
                    url: config.login.url
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
