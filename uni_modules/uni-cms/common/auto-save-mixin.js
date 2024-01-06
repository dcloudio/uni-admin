export default {
  data() {
    return {
      autoSaveKey: 'uni-cms-auto-save-create', // 自动保存localStorage的key
      // #ifdef H5
      autoSave: {
        status: 0, // 自动保存状态 0: 未保存 1: 保存中 2: 已保存
      }, // 是否自动保存
      // #endif
      // #ifndef H5
      autoSave: false, // 是否自动保存
      // #endif
    }
  },
  computed: {
    isCreateArticle (){
      return !this.formDataId
    }
  },
  mounted() {
    if (!this.autoSave) return

    if (this.formDataId) {
      this.autoSaveKey = 'uni-cms-auto-save-edit-' + this.formDataId
    }
    this.initAutoSaveContent()
  },
  methods: {
    // 初始化自动保存内容
    initAutoSaveContent() {
      const authSaveContent = uni.getStorageSync(this.autoSaveKey)
      if (!authSaveContent) return
      let content
      try {
        content = JSON.parse(authSaveContent)
      } catch (e) {
        console.error('自动保存内容解析失败', e)
      }
      if (!content) return

      uni.showModal({
        title: "提示",
        content: this.isCreateArticle ? "检测到您上次编辑的内容，是否恢复？": "检测到您有未发布的内容，是否恢复？",
        confirmText: "恢复",
        cancelText: "丢弃",
        success: (res) => {
          if (res.confirm) {
            // 是否存在初始化内容
            if (this.editorCtx) {
              this.editorCtx.setContents({
                delta: content.content
              })
            }
            this.formData.title = content.title
            this.formData.excerpt = content.excerpt
          } else {
            // 清除自动保存内容
            uni.removeStorageSync(this.autoSaveKey)
          }
        }
      })
    },
    autoSaveContent() {
      if (!this.autoSave) return

      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer)
      }

      this.autoSave.status = 1

      // 每隔3秒钟保存一次，防止频繁操作
      // 保存至localStorage中。key为文章ID，value为文章内容delta
      this.autoSaveTimer = setTimeout(() => {
        this.editorCtx.getContents({
          success: (res) => {
            const {delta} = res
            const content = JSON.stringify({
              title: this.formData.title,
              excerpt: this.formData.excerpt,
              content: delta,
            })
            uni.setStorage({
              key: this.autoSaveKey,
              data: content,
              success: () => {
                this.autoSave.status = 2
              },
              fail: (err) => {
                console.log(err)
              }
            })
          },
          fail: (e) => {
            console.error(e)
          }
        })
      }, 500)
    },
    clearAutoSaveStorage() {
      if (this.autoSave) {
        uni.removeStorageSync(this.autoSaveKey)
      }
    }
  }
}
