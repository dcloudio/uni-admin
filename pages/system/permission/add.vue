<template>
	<view class="uni-container">
		<uni-forms ref="form" validateTrigger="bind" :rules="rules" @submit="submit">
			<uni-forms-item name="permission_id" label="权限标识" required>
				<uni-easyinput v-model="formData.permission_id" :clearable="false" placeholder="请输入权限标识" />
			</uni-forms-item>
			<uni-forms-item name="permission_name" label="权限名称" required>
				<uni-easyinput v-model="formData.permission_name" :clearable="false" placeholder="请输入权限名称" />
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
	import validator from '@/js_sdk/validator/uni-id-permissions.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-id-permissions';

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
					"permission_id": "",
					"permission_name": "",
					"comment": ""
				},
				rules: {
					...getValidator(["permission_id", "permission_name", "comment"])
				}
			}
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
			}
		}
	}
</script>
