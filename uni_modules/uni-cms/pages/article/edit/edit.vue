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
		<uni-forms ref="form" :label-width="90" :model="formData" validateTrigger="submit" err-show-type="toast">
			<view class="edit-box">
				<view class="title">
					<textarea
              class="uni-input"
              v-model="formData.title"
              auto-height
              placeholder="文章标题"
              @input="() => autoSaveContent && autoSaveContent()"
          />
				</view>
				<editor-component @textchange="onTextChange" @ready="onEditorReady"></editor-component>
				<view class="settings">
					<uni-forms-item name="excerpt" label="文章摘要">
						<textarea
                class="excerpt"
                placeholder="文章摘要"
                auto-height
                v-model="formData.excerpt"
                @input="() => autoSaveContent && autoSaveContent()"
            ></textarea>
					</uni-forms-item>
					<uni-forms-item name="thumbnail" label="封面" required>
            <view class="thumb-mode">
              <radio-group @change="thumbModeChange">
                <radio value="1" class="mode" :checked="thumbMode === 1">单图</radio>
                <radio value="3" class="mode" :checked="thumbMode === 3">三图</radio>
                <radio value="0" class="mode" :checked="thumbMode === 0">无封面图</radio>
              </radio-group>
            </view>
            <view class="thumbnail-list" v-if="thumbMode > 0">
              <view class="thumbnail" v-for="(thumbnail, index) in formData.thumbnail" :key="thumbnail.source">
                <template v-if="thumbnail.source">
                  <view class="remove-thumbnail" @click="() => removeThumbnail(index)">
                    <uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
                  </view>
                  <image :src="thumbnail.src" mode="aspectFill" style="width: 150px; height: 150px;"></image>
                </template>
                <template v-else>
                  <uni-icons
                      @click="() => openInsertImageDrawer(index)"
                      class="placeholder"
                      type="plusempty"
                      size="60"
                      color="#e8e8e8"
                  ></uni-icons>
                </template>
              </view>
            </view>
            <view v-if="thumbMode > 0" style="color: #999; font-size: 13px; margin-top: 10px;">
              <text>为了保证最佳效果展示；请上传16:9的封面图片</text>
            </view>
					</uni-forms-item>
					<uni-forms-item name="user_id" label="作者" required>
						<uni-data-picker v-model="formData.user_id" style="width: 200px;" collection="uni-id-users"
							where="role=='uni-cms-author'||role=='admin'" field="nickname as text, _id as value"></uni-data-picker>
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
					<button v-if="formData.article_status === 0" class="uni-button" style="width: 100px;margin-right: 10px;"
						@click="submit(0)">保存</button>
					<button type="primary" class="uni-button" style="width: 100px;" @click="submit(1)">更新</button>
				</view>
			</view>
		</uni-forms>
		<view class="footer">
			<view class="wrap">
				<view class="left">
          <text class="auto-save" v-if="autoSave">
            {{ autoSave.status === 1 ? '自动保存中...' : '已自动保存' }}
          </text>
					<text class="word-count" v-if="wordCount !== null">共 {{ wordCount }} 字</text>
				</view>
				<view class="right">
					<view class="uni-button-group">
            <!-- #ifdef H5 -->
            <button v-if="formData.article_status === 0" class="uni-button"
                    style="width: 100px;margin-right: 10px;" @click="previewArticle">预览</button>
            <!-- #endif -->
            <button v-if="formData.article_status === 0" class="uni-button"
                    style="width: 100px;margin-right: 10px;" @click="submit(0)">保存</button>
						<button type="primary" class="uni-button" style="width: 100px;" @click="submit(1)">{{
							formData.article_status === 0 ? '发布' : '更新' }}</button>
					</view>
				</view>
			</view>
		</view>

    <uni-drawer
        class="insert-image-drawer"
        v-if="drawerWidth"
        ref="insertImageDrawer"
        mode="right"
        :width="drawerWidth"
    >
      <uni-media-library
          mode="picker"
          :selected-count="1"
          :media-tabs="['image']"
          @onInsert="onInsertCover"
      ></uni-media-library>
    </uni-drawer>

    <!-- #ifdef H5 -->
    <uni-popup ref="popup" type="dialog" v-if="formDataId">
      <article-preview :id="formDataId" @close="() => $refs.popup.close()"></article-preview>
    </uni-popup>
    <!-- #endif -->
	</view>
</template>

<script>
// 引入编辑器组件
import EditorComponent from "@/uni_modules/uni-cms/components/editor/editor.vue"
// 引入Delta转换函数
import { translateInputContent, translateOutputContent } from '@/uni_modules/uni-cms/common/translate-content'
// 引入表单验证器
import { validator } from '@/uni_modules/uni-cms/common/validator/uni-cms-articles.js'
// 自动保存mixin
import autoSaveMixin from '@/uni_modules/uni-cms/common/auto-save-mixin.js';
import {parseImageUrl} from "@/uni_modules/uni-cms/common/parse-image-url";

// 引入文章预览组件
// #ifdef H5
import ArticlePreview from "@/uni_modules/uni-cms/components/preview/preview.vue";
// #endif

// 引入数据库相关
const db = uniCloud.database();
const dbCollectionName = 'uni-cms-articles';

// 根据字段获取验证器
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
		EditorComponent,
    // #ifdef H5
    ArticlePreview
    // #endif
	},
  mixins: [autoSaveMixin],
	data() {
		// 初始化表单数据
		let formData = {
			"user_id": "",
			"category_id": "",
			"title": "",
			"content": null,
			"excerpt": "",
			"article_status": 0,
			"is_sticky": null,
			"is_essence": null,
			"comment_status": null,
			"thumbnail": [{}],
			"publish_date": null
		}
		return {
			// 初始化表单数据的id
			formDataId: '',
			// 表单数据
			formData,
			// 表单选项
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
			// 表单验证规则
			rules: {
				...getValidator(Object.keys(formData))
			},
			// 编辑器格式
			formats: {},
			// 字数统计
			wordCount: null,
      // 插入图片抽屉宽度
      drawerWidth: 0,
      // 封面图展示方式
      thumbMode: 1,
    }
	},
	// 当页面准备好时，设置表单验证规则
	onReady() {
		this.$refs.form.setRules(this.rules)
	},
	// 当页面加载时，如果有id则获取表单数据
	onLoad(e) {
		if (e.id) {
			const id = e.id
			this.formDataId = id
			this.getDetail(id)
		}
	},
  mounted () {
    const sysinfo = uni.getSystemInfoSync()
    this.drawerWidth = sysinfo.windowWidth * .8
  },
	methods: {
    // 封面图展示方式改变
    thumbModeChange (e) {
      const coverCount = Number(e.detail.value)
      this.formData.thumbnail = Array.from(new Array(coverCount)).map((item, index) => {
        if (this.formData.thumbnail[index]) {
          return this.formData.thumbnail[index]
        } else {
          return {}
        }
      })
      this.thumbMode = coverCount
    },
		/**
		 * 获取表单数据
		 * @param {String} id - 文章id
		 */
		getDetail(id) {
			// 显示加载中
			uni.showLoading({
				mask: true
			})
			// 从数据库中获取文章数据
			db.collection(dbCollectionName).doc(id).field("user_id,category_id,title,content,excerpt,article_status,is_sticky,is_essence,comment_status,thumbnail,publish_date").get().then((res) => {
				const data = res.result.data[0]
				if (data) {
					// 将获取到的数据赋值给formData
					this.formData = data
					// 如果有缩略图，则设置缩略图预览
					const thumbnail = typeof this.formData.thumbnail === 'string' ? [this.formData.thumbnail] : this.formData.thumbnail

          // 更新封面图展示方式
          this.thumbMode = this.formData.thumbnail && this.formData.thumbnail.length ? this.formData.thumbnail.length : 0
					// 设置编辑器内容
					this.setContents()

					// 处理封面图
					parseImageUrl(thumbnail).then(res => {
						this.formData.thumbnail = res
					})
				}
			}).catch((err) => {
				// 显示错误提示
				uni.showModal({
					content: err.message || '请求服务失败',
					showCancel: false
				})
			}).finally(() => {
				// 隐藏加载中
				uni.hideLoading()
			})
		},
		/**
		 * 当编辑器准备好时，设置编辑器内容
		 * @param {Object} editorCtx - 编辑器上下文
		 */
		onEditorReady(editorCtx) {
			// 如果编辑器上下文不存在，则返回
			if (!editorCtx) return

			// 将编辑器上下文赋值给组件实例的editorCtx属性
			this.editorCtx = editorCtx

			// 设置编辑器内容
			this.setContents()
		},

		/**
		 * 设置编辑器内容
		 */
		setContents() {
			// 检查编辑器上下文是否存在
			if (this.editorCtx && this.formData.content) {
				// #ifdef H5
				// 如果是H5平台，则直接使用formData中的内容
				const content = this.formData.content
				// #endif

				// #ifndef H5
				// 如果不是H5平台，则需要将formData中的内容转换为编辑器所需的格式
				const content = translateInputContent(this.formData.content)
				// #endif

				// 设置编辑器内容
				this.editorCtx.setContents({
					delta: content
				})
			}
		},

		/**
		 * 验证表单并提交
		 * @param {Number} status - 文章状态
		 */
		submit(status) {
			// 检查文章标题是否存在
			if (!this.formData.title) {
				// 隐藏加载中
				uni.hideLoading()
				// 显示文章标题必填的提示
				return uni.showToast({
					icon: 'none',
					title: '文章标题必填',
				})
			}

      if (this.formData.thumbnail) {
        for (const thumbnail of this.formData.thumbnail) {
          if (!thumbnail.source) {
            // 如果封面图为空，提示用户
            uni.hideLoading()
            return uni.showToast({
              icon: 'none',
              title: '封面图必填',
            })
          }
        }
      }

      return new Promise(resolve => {
        // 验证表单
        this.$refs.form.validate().then((res) => {
          // 获取编辑器内容
          this.editorCtx.getContents({
            success: async (e) => {
              // 提交表单
              await this.submitForm({
                ...res,
                thumbnail: this.formData.thumbnail.map(item => item.source),
                article_status: status,
                title: this.formData.title,
                content: translateOutputContent(e.delta),
                publish_date: this.formData.publish_date ? this.formData.publish_date : Date.now()
              })

              resolve()
            }
          })
        }).catch((e) => {
          console.error(e)
        })
      })
		},

		/**
		 * 提交表单
		 * @param {Object} value - 表单数据
		 */
		submitForm(value) {
			uni.showLoading({
				mask: true
			})
			// 使用 clientDB 提交数据
			return db.collection(dbCollectionName).doc(this.formDataId).update(value).then(() => {
				// 提交成功后，根据文章状态弹出不同的提示信息
				uni.showToast({
					icon: 'none',
					title: value.article_status === 0 ? '保存成功' : this.formData.article_status === 0 ? '发布成功' : '更新成功'
				})

				try {
					// 触发父页面事件，刷新数据
					this.getOpenerEventChannel().emit('refreshData')
				} catch (e) { }

        // 清除自动保存内容
        this.clearAutoSaveStorage && this.clearAutoSaveStorage()

        // 延迟 500ms 后，如果文章状态为已发布，返回上一页。
				setTimeout(() => {
					if (value.article_status === 1) {
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

		/**
		 * 文本内容变化时更新字数统计
		 * @param {Object} e - 文本内容变化事件
		 */
		onTextChange(e) {
			this.wordCount = e.detail

      // 自动保存
      this.autoSaveContent && this.autoSaveContent()
		},

		/**
		 * 返回上一页或跳转到文章列表页
		 */
		navigateBack() {
			const pages = getCurrentPages()

			if (pages.length > 1) {
				uni.navigateBack(-1)
			} else {
				uni.redirectTo({
					url: '/uni_modules/uni-cms/pages/article/list/list'
				})
			}
		},

    openInsertImageDrawer(index) {
      this.$refs.insertImageDrawer.open()
      this.coverIndex = index
    },
		async onInsertCover(selectMediaItems) {
			const coverIndex = this.coverIndex !== null ? this.coverIndex : 0
			const image = selectMediaItems[0]
			const newThumbnail = [...this.formData.thumbnail]
			const parseImages = await parseImageUrl(image.src)

			newThumbnail[coverIndex] = parseImages[0]

			this.$refs.insertImageDrawer.close()
			this.formData.thumbnail = newThumbnail
		},
    removeThumbnail(index) {
      const newThumbnail = [...this.formData.thumbnail]
      newThumbnail[index] = {}

      this.formData.thumbnail = newThumbnail
      this.autoGetCover = false
    },
    async previewArticle () {
      if (this.formDataId) {
        // 先保存文章
        await this.submit(0)
        this.$refs.popup.open()
      }
    }
	}
}
</script>

<style lang="scss">
@import '@/uni_modules/uni-cms/common/style/article-detail.scss';
</style>
