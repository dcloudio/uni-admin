<template>
    <view class="login-box">
        <view class="flex-cc m-b-30 login-title">
            系统登录
        </view>
        <uni-forms ref="form" :form-rules="rules" autocomplete="off">
            <uni-field left-icon="person" name="account" v-model="formData.account" labelWidth="35" placeholder="账户"
                :clearable="false" />
            <uni-field class="m-b-30" left-icon="locked" v-model="formData.password" name="password" type="password"
                labelWidth="35" placeholder="密码" :clearable="false" />
            <button type="primary" size="mini" style="width: 100%;" form-type="submit">登录</button>
        </uni-forms>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                formData: {
                    username: '',
                    password: ''
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
            submit(e) {
                uniCloud.callFunction({
                    name: 'uni-admin',
                    data: {
                        action: 'user/login',
                        data: this.formData,
                    }
                }).then(res => {
                    uni.setStorageSync('uni_id_token', res.result.token)
                    uni.setStorageSync('uni_id_token_expired', res.result.tokenExpired)
                    uni.showModal({
                        content: '登录成功',
                        showCancel: false,
                        success() {
                            uni.redirectTo({
                                url: '/pages/index/index'
                            })
                        }
                    })
                }).catch(err => {
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
        align-items: center;
        justify-content: center;
        /* background-color: #28273D; */
    }

    .login-box {
        position: relative;
        width: 420px;
        max-width: 100%;
        padding: 50px 35px;
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
</style>
