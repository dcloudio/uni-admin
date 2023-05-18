<template>
	<view class="uni-container">
		<view class="header">
			<view class="back">
				<view @click="navigateBack" style="margin-left: 15px;display: flex;align-items: center">
					<uni-icons type="back" size="24"></uni-icons>
					<text>返回</text>
				</view>
			</view>
		</view>
		<uni-forms ref="form" :label-width="90" :model="formData" validateTrigger="bind" err-show-type="toast">
			<view class="edit-box">
				<view class="title">
					<textarea class="uni-input" v-model="formData.title" auto-height placeholder="文章标题" />
				</view>
				<editor-component @textchange="onTextChange" @ready="onEditorReady"
					:imageSecCheck="true"></editor-component>
				<view class="settings">
					<uni-forms-item name="excerpt" label="文章摘要">
						<textarea class="excerpt" placeholder="文章摘要" auto-height v-model="formData.excerpt"></textarea>
					</uni-forms-item>
					<uni-forms-item name="thumbnail" label="封面" required>
						<uni-file-picker v-model="thumbnailPreview" file-mediatype="image" mode="grid"
							file-extname="png,jpg" :limit="1" return-type="object"
							:image-styles="{ width: '150px', height: '150px' }" @success="uploadSuccess" />
						<view style="color: #999; font-size: 13px; margin-top: 10px;">
							<text>为了保证最佳效果展示；请上传16:9的封面图片</text>
						</view>
					</uni-forms-item>
					<uni-forms-item name="user_id" label="作者" required>
						<uni-data-picker v-model="formData.user_id" style="width: 200px;" collection="uni-id-users"
							where="role=='uni-cms-author'" field="nickname as text, _id as value"></uni-data-picker>
					</uni-forms-item>
					<uni-forms-item name="category_id" label="分类">
						<uni-data-picker v-model="formData.category_id" style="width: 200px;"
							collection="uni-cms-categories" field="name as text, _id as value"></uni-data-picker>
					</uni-forms-item>
					<!--					<uni-forms-item name="is_sticky" label="是否置顶">-->
					<!--						<switch @change="binddata('is_sticky', $event.detail.value)" style="transform:scale(0.75)" :checked="formData.is_sticky"></switch>-->
					<!--					</uni-forms-item>-->
					<!--					<uni-forms-item name="is_essence" label="阅读加精">-->
					<!--						<switch @change="binddata('is_essence', $event.detail.value)" style="transform:scale(0.75)" :checked="formData.is_essence"></switch>-->
					<!--					</uni-forms-item>-->
					<!--					<uni-forms-item name="comment_status" label="开放评论">-->
					<!--						<uni-data-checkbox v-model="formData.comment_status"-->
					<!--															 :localdata="formOptions.comment_status_localdata"></uni-data-checkbox>-->
					<!--					</uni-forms-item>-->
				</view>
				<view class="uni-button-group m" style="padding-bottom: 50px">
					<button class="uni-button" style="width: 100px;margin-right: 10px;" @click="submit(0)">存为草稿</button>
					<button type="primary" class="uni-button" style="width: 100px;" @click="submit(1)">发布</button>
				</view>
			</view>
		</uni-forms>
		<view class="footer">
			<view class="wrap">
				<view class="left">
					<text class="word-count" v-if="wordCount !== null">共 {{ wordCount }} 字</text>
				</view>
				<view class="right">
					<view class="uni-button-group">
						<button class="uni-button" style="width: 100px;margin-right: 10px;" @click="submit(0)">存为草稿</button>
						<button type="primary" class="uni-button" style="width: 100px;" @click="submit(1)">发布</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// 引入编辑器组件
import EditorComponent from "@/uni_modules/uni-cms/components/editor/editor.vue";
// 引入表单验证规则
import { validator } from '@/uni_modules/uni-cms/common/validator/uni-cms-articles.js';
// 引入数据库和相关命令
const db = uniCloud.database();
const dbCmd = db.command;
// 定义数据库集合名称
const dbCollectionName = 'uni-cms-articles'

// 获取表单验证规则
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
	components: {
		EditorComponent
	},
data() {
		// 初始化formData
		let formData = {
			"user_id": "",
			"category_id": "",
			"title": "",
			"content": {},
			"excerpt": "",
			"article_status": 0,
			"is_sticky": null,
			"is_essence": null,
			"comment_status": null,
			"thumbnail": ""
		}
		return {
			formData, // 表单数据
			formOptions: {
				"comment_status_localdata": [
					{
						"value": 0,
						"text": "关闭"
					},
					{
						"value": 1,
						"text": "开放"
					}
				]
			},
			rules: {
				...getValidator(Object.keys(formData)) // 表单验证规则
			},
			formats: {}, // 编辑器格式
			wordCount: null, // 字数统计
			thumbnailPreview: {} // 缩略图预览
		}
	},
	onReady() {
		this.$refs.form.setRules(this.rules) // 设置表单验证规则
	},

	methods: {
		// 上传成功后触发
		uploadSuccess(e) {
			// 更新formData中的缩略图
			this.formData.thumbnail = e.tempFilePaths[0]
			// 更新缩略图预览
			this.thumbnailPreview = {
				extname: 'jpg',
				url: e.tempFilePaths[0]
			}
		},
		// 监听富文本编辑器内容变化
		onTextChange(e) {
			// 更新字数统计
			this.wordCount = e.detail
		},
		// 富文本编辑器初始化完成后触发
		onEditorReady(editorCtx) {
			if (editorCtx) {
				// 保存editorCtx
				this.editorCtx = editorCtx
			}
		},
		/**
		 * 验证表单并提交
		 */
		submit(status) {
			if (!this.formData.title) {
				// 如果标题为空，提示用户
				uni.hideLoading()
				return uni.showToast({
					icon: 'none',
					title: '文章标题必填',
				})
			}

			this.$refs.form.validate().then((res) => {
				this.editorCtx.getContents({
					success: (e) => {
						// 提交表单
						this.submitForm({
							...res,
							article_status: status,
							title: this.formData.title.trim(),
							content: e.delta,
							publish_date: Date.now()
						})
					}
				})
			}).catch((e) => {
				console.error(e)
			})
		},

		/**
		 * 提交表单
		 */
		submitForm(value) {
			uni.showLoading({
				mask: true
			})
			// 使用 clientDB 提交数据
			return db.collection(dbCollectionName).add(value).then((res) => {
				uni.showToast({
					icon: 'none',
					title: value.article_status === 0 ? '保存成功' : '发布成功'
				})
				try {
					// 触发父页面事件，刷新数据
					this.getOpenerEventChannel().emit('refreshData')
				} catch (e) { }

				setTimeout(() => {
					if (value.article_status === 0) {
						// 跳转到编辑页面
						uni.redirectTo({
							url: '/uni_modules/uni-cms/pages/article/edit/edit?id=' + res.result.id
						})
					} else {
						// 返回上一页
						uni.navigateBack()
					}
				}, 500)
			}).catch((err) => {
				uni.showModal({
					content: err.message || '请求服务失败',
					showCancel: false
				})
			}).finally(() => {
				uni.hideLoading()
			})
		},

		// 返回上一页或跳转到文章列表页
		navigateBack() {
			const pages = getCurrentPages()

			if (pages.length > 1) {
				// 返回上一页
				uni.navigateBack(-1)
			} else {
				// 跳转到文章列表页
				uni.redirectTo({
					url: '/uni_modules/uni-cms/pages/article/list/list'
				})
			}
		}
	}


}
</script>

<style lang="scss">
@import '@/uni_modules/uni-cms/common/style/article-detail.scss';
</style>
