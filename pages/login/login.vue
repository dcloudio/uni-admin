<template>
    <view class="login-box">
		<view class="flex-cc m-b-30 login-title">
			系统登录
		</view>
		<uni-forms ref="form" :form-rules="rules">
			<uni-field 
				left-icon="person"
				label="账号"
				name="account"
				v-model="formData.account"
				placeholder="账户" />
			<uni-field class="m-b-30"
				left-icon="locked"
				label="密码" 
				v-model="formData.password" 
				name="password" 
				type="password" 
				placeholder="密码" />
			<button type="primary" form-type="submit">登录</button>
		</uni-forms>
    </view>
</template>

<script>
    export default {
        data() {
            return {
				formData: {
					account: '',
					password: ''					
				},
				rules: {
					// 对name字段进行必填验证
					account: {
						rules:[
							{
								required: true,
								message: '请输入姓名',
								trigger: 'blur'
							},
							{
								minLength: 3,
								maxLength: 5,
								message: '姓名长度在 {minLength} 到 {maxLength} 个字符',
								trigger: 'change'
							}
						]
					},
					// 对email字段进行必填验证
					password: {
						rules: [{
								required: true,
								message: '请输入正确的密码',
								trigger: 'blur'
							},
							{
								minLength: 6,
								message: '密码长度大于{minLength} 个字符',
								trigger: 'change'
							}
						]
					}
				}
            }
        },
        methods: {
			
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
        width: 520px;
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
		font-size: 28px;
		color: #333;
	}
</style>
