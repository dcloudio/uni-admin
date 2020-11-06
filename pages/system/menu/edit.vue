<template>
	<view class="uni-container">
		<uni-forms labelWidth="80" ref="form" v-model="formData" :rules="rules" validateTrigger="bind" @submit="submit">
			<uni-forms-item name="menu_id" label="标识">
				<input disabled placeholder="菜单项的ID，不可重复" @input="binddata('menu_id', $event.detail.value)" class="uni-input-border uni-disabled"
				 :value="formData.menu_id" />
			</uni-forms-item>
			<uni-forms-item name="name" label="名称">
				<input placeholder="菜单名称" @input="binddata('name', $event.detail.value)" class="uni-input-border" :value="formData.name" />
			</uni-forms-item>
			<uni-forms-item name="icon" label="图标" style="margin-bottom: 40px;">
				<input placeholder="菜单图标" @input="binddata('icon', $event.detail.value)" class="uni-input-border" :value="formData.icon" />
				<uni-link font-size="12" href="https://uniapp.dcloud.net.cn/uniCloud/admin?id=icon-%e5%9b%be%e6%a0%87" text="如何获取内置图标或使用自定义图标？"
				 class="uni-form-item-tips"></uni-link>
			</uni-forms-item>
			<uni-forms-item name="url" label="URL">
				<input placeholder="菜单url" @input="binddata('url', $event.detail.value)" class="uni-input-border" :value="formData.url" />
			</uni-forms-item>
			<uni-forms-item name="sort" label="序号">
				<input placeholder="菜单序号（越大越靠后）" type="number" @input="binddata('sort', $event.detail.value)" class="uni-input-border"
				 :value="formData.sort" />
			</uni-forms-item>
			<uni-forms-item name="parent_id" label="父菜单标识">
				<input placeholder="父级菜单标识" @input="binddata('parent_id', $event.detail.value)" class="uni-input-border" :value="formData.parent_id" />
			</uni-forms-item>
			<uni-forms-item v-if="permissions.length" name="permission" label="权限列表" style="margin-bottom: 40px;">
				<uni-data-checklist multiple :value="formData.permission" :range="permissions" @change="binddata('permission', $event.detail.value)"></uni-data-checklist>
				<view class="uni-form-item-tips">
					当用户拥有以上被选中的权限时，可以访问此菜单，建议仅对子菜单配置权限，父菜单会自动包含。
				</view>
			</uni-forms-item>
			<uni-forms-item name="enable" label="是否启用">
				<switch @change="binddata('enable', $event.detail.value)" :checked="formData.enable" />
			</uni-forms-item>

			<view class="uni-button-group">
				<button style="width: 100px;" type="primary" class="uni-button" @click="submitForm">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button style="width: 100px;" class="uni-button">返回</button></navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import validator from '@/js_sdk/validator/opendb-admin-menus.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'opendb-admin-menus';

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
					"menu_id": "",
					"name": "",
					"icon": "",
					"url": "",
					"sort": '',
					"parent_id": "",
					"permission": [],
					"enable": null
				},
				rules: {
					...getValidator(["menu_id", "name", "icon", "url", "sort", "parent_id", "permission", "enable"])
				},
				permissions: []
			}
		},
		onLoad(e) {
			const id = e.id
			this.formDataId = id
			this.getDetail(id)
			this.loadPermissions()
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

				this.$request('system/menu/update', Object.assign({
					_id: this.formDataId
				}, value)).then((res) => {
					uni.showToast({
						title: '修改成功'
					})
					this.getOpenerEventChannel().emit('refreshData')
					setTimeout(() => uni.navigateBack(), 500)
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
