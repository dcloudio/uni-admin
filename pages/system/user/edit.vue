<template>
	<view class="uni-container">
		<uni-forms ref="form" v-model="formData" :rules="rules" validateTrigger="bind" @submit="submit">
			<uni-forms-item name="username" label="用户名">
				<input placeholder="请输入用户名" @input="binddata('username', $event.detail.value)" class="uni-input-border" :value="formData.username" />
			</uni-forms-item>
			<!-- <uni-forms-item name="password" label="初始密码">
				<input placeholder="请输入初始密码" @input="binddata('password', $event.detail.value)" class="uni-input-border" :value="formData.password" />
			</uni-forms-item> -->
			<uni-forms-item v-if="roles.length" name="role" label="角色列表" style="margin-bottom: 60px;">
				<uni-data-checklist multiple :value="formData.role" :range="roles" @change="binddata('role', $event.detail.value)"></uni-data-checklist>
				<view class="uni-form-item-tips">
					当用户拥有以上被选中的角色时
				</view>
			</uni-forms-item>
			<uni-forms-item name="mobile" label="手机号">
				<input placeholder="手机号" @input="binddata('mobile', $event.detail.value)" class="uni-input-border" :value="formData.mobile" />
			</uni-forms-item>
			<uni-forms-item name="email" label="邮箱">
				<input placeholder="邮箱" @input="binddata('email', $event.detail.value)" class="uni-input-border" :value="formData.email" />
			</uni-forms-item>
			<uni-forms-item name="status" label="是否启用">
				<switch @change="binddata('status', $event.detail.value)" :checked="!Boolean(formData.status)" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button style="width: 100px;" type="primary" class="uni-button" @click="submitForm">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button style="width: 100px;" class="uni-button">返回</button></navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import validator from '@/js_sdk/validator/uni-id-users.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-id-users';

	function getValidator(fields) {
		let reuslt = {}
		for (let key in validator) {
			if (fields.includes(key)) {
				reuslt[key] = validator[key]
			}
		}
		return reuslt
	}

	export default {
		data() {
			return {
				formData: {
					"username": "",
					"password": "",
					"role": [],
					"mobile": "",
					"email": "",
					"status": 1
				},
				rules: {
					...getValidator(["username", "password", "role", "mobile", "email", "status"])
				},
				roles: []
			}
		},
		onLoad(e) {
			const id = e.id
			this.formDataId = id
			this.getDetail(id)
			this.loadroles()

		},
		methods: {
			/**
			 * 触发表单提交
			 */
			submitForm(form) {
				this.$refs.form.submit();
			},

			/**
			 * 表单提交
			 * @param {Object} event 回调参数 Function(callback:{value,errors})
			 */
			submit(event) {
				const {
					value,
					errors
				} = event.detail

				// 表单校验失败页面会提示报错 ，要停止表单提交逻辑
				if (errors) {
					return
				}
				uni.showLoading({
					title: '修改中...',
					mask: true
				})

				// 是否启用功能的数据类型转换， 0 正常， 1 禁用
				// 编辑默认禁用，初始值不处理
				console.log('======this.formData.status=======', this.formData.status)
				console.log(11111111, value.status)
				if (typeof value.status === "boolean") {
					value.status = Number(!value.status)
				}
				console.log(2222222222, value.status)
				// 使用 uni-clientDB 提交数据
				db.collection(dbCollectionName).where({
					_id: this.formDataId
				}).update(value).then((res) => {
					uni.showToast({
						title: '修改成功'
					})
					this.getOpenerEventChannel().emit('refreshData')
					setTimeout(() => uni.navigateBack(), 500)
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},

			/**
			 * 获取表单数据
			 * @param {Object} id
			 */
			getDetail(id) {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).where({
					_id: id
				}).get().then((res) => {
					const data = res.result.data[0]
					if (data) {
						Object.keys(this.formData).forEach(name => {
							this.binddata(name, data[name])
						})
						this.formData = data
					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},
			loadroles() {
				db.collection('uni-id-roles').limit(500).get().then(res => {
					this.roles = res.result.data.map(item => {
						return {
							value: item.role_id,
							text: item.role_name
						}
					})
					this.roles.unshift({
						value: 'admin',
						text: 'admin'
					})
				}).catch(err => {
					uni.showModal({
						title: '提示',
						content: err.message,
						showCancel: false
					})
				})
			}

		}
	}
</script>
