<template>
	<view class="uni-container">
		<uni-forms ref="form" v-model="formData" :rules="rules" validateTrigger="bind" @submit="submit">
			<uni-forms-item name="role_id" label="角色Id" required>
				<uni-easyinput v-model="formData.role_id" :clearable="false" placeholder="请输入角色Id" />
			</uni-forms-item>
			<uni-forms-item name="role_name" label="角色名" required>
				<uni-easyinput v-model="formData.role_name" :clearable="false" placeholder="请输入角色名" />
			</uni-forms-item>
			<uni-forms-item name="permission" label="权限列表">
				<uni-data-checkbox :multiple="true" v-model="formData.permission" collection="uni-id-permissions" field="permission_name as text, permission_id as value" />
			</uni-forms-item>
			<uni-forms-item name="comment" label="备注">
				<uni-easyinput type="textarea" v-model="formData.comment" :clearable="false" placeholder="请输入备注" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button style="width: 100px;" type="primary" class="uni-button" @click="submitForm">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button style="width: 100px;" class="uni-button">返回</button></navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import validator from '@/js_sdk/validator/uni-id-roles.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-id-roles';

	function getValidator(fields) {
		let result = {}
		for (let key in validator) {
			if (fields.includes(key)) {
				result[key] = validator[key]
			}
		}
		return result
	}

	export default {
		data() {
			return {
				formData: {
					"role_id": "",
					"role_name": "",
					"permission": [],
					"comment": ""
				},
				rules: {
					...getValidator(["role_id", "role_name", "comment"])
				},
				permissions: []
			}
		},
		onLoad() {
			this.loadPermissions()
		},
		methods: {
			/**
			 * 触发表单提交
			 */
			submitForm() {
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
					title: '提交中...',
					mask: true
				})
				// 使用 uni-clientDB 提交数据
				db.collection(dbCollectionName).add(value).then((res) => {
					uni.showToast({
						title: '新增成功'
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
			loadPermissions() {
				db.collection('uni-id-permissions').limit(500).get().then(res => {
					this.permissions = res.result.data.map(item => {
						return {
							value: item.permission_id,
							text: item.permission_name
						}
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
