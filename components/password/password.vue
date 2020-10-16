<template>
    <view>
        <view class="m-b-30">
            {{title}}
        </view>
        <uni-forms ref="form" :form-rules="rules" class="uni-forms">
            <uni-field :required="true" label="旧密码" type="password" :label-width="100" name="oldPassword" v-model="password.oldPassword"
                placeholder="请填写旧密码" />
            <uni-field :required="true" label="新密码" type="password" :label-width="100" name="newPassword" v-model="password.newPassword"
                placeholder="请填写新密码" />
            <uni-field :required="true" label="确认新密码" :label-width="100" type="password" name="passwordConfirmation"
                v-model="password.passwordConfirmation" placeholder="请确认新密码" />
            <button class="button-save" type="primary" size="mini" :disabled="isLoading" @click="submitForm('form')">保存</button>
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
                title: '修改密码',
                isLoading: false,
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
        computed: {
            ...mapState('user', ['userInfo'])
        },
        methods: {
            ...mapMutations({
                removeToken(commit) {
                    commit('user/REMOVE_TOKEN')
                }
            }),
            submitForm(form) {
                const {
                    newPassword,
                    passwordConfirmation
                } = this.password
                this.$refs[form].submit((valid, values) => {
                    if (!valid) {
                        if (newPassword === passwordConfirmation) {
                            this.save()
                        } else {
                            uni.showToast({
                                title: '两次输入密码不相同',
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    } else {
                        uni.showToast({
                            title: '请正确的填写密码',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                })
            },
            save() {
                let that = this
                this.isLoading = true
                this.$request('self/changePwd', this.password).then(res => {
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
        width: 400px;
    }

    .uni-forms button {
        margin: 0;
        margin-right: 20px;
        margin-top: 40px;
    }
</style>
