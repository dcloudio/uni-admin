<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="name" label="名称" required>
        <uni-easyinput placeholder="类别名称" v-model="formData.name" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="description" label="描述">
        <uni-easyinput placeholder="类别描述" v-model="formData.description" trim="both"></uni-easyinput>
      </uni-forms-item>
      <!--      <uni-forms-item name="icon" label="图标地址">-->
      <!--        <uni-easyinput placeholder="类别图标地址" v-model="formData.icon" trim="both"></uni-easyinput>-->
      <!--      </uni-forms-item>-->
      <uni-forms-item name="sort" label="排序">
        <uni-easyinput placeholder="类别显示顺序" type="number" v-model="formData.sort"></uni-easyinput>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
import { validator } from '@/uni_modules/uni-cms/common/validator/uni-cms-categories.js';

const db = uniCloud.database();
const dbCmd = db.command;
const dbCollectionName = 'uni-cms-categories';

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

// 导出组件
export default {
  // 数据
  data() {
    // 表单数据
    let formData = {
      "name": "",
      "description": "",
      "icon": "",
      "sort": null,
      "article_count": null
    }
    return {
      formData,
      formOptions: {},
      // 表单验证规则
      rules: {
        ...getValidator(Object.keys(formData))
      }
    }
  },
  // 当页面准备好时
  onReady() {
    // 设置表单验证规则
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    /**
     * 验证表单并提交
     */
    submit() {
      // 显示加载中
      uni.showLoading({
        mask: true
      })
      // 验证表单
      this.$refs.form.validate().then((res) => {
        return this.submitForm(res)
      }).catch(() => {
      }).finally(() => {
        // 隐藏加载中
        uni.hideLoading()
      })
    },

    /**
     * 提交表单
     */
    submitForm(value) {
      // 使用 clientDB 提交数据
      return db.collection(dbCollectionName).add(value).then((res) => {
        // 提示新增成功
        uni.showToast({
          title: '新增成功'
        })
        try {
          // 刷新数据
          this.getOpenerEventChannel().emit('refreshData')
        } catch (e) { }
        // 返回上一页
        setTimeout(() => uni.navigateBack(), 500)
      }).catch((err) => {
        // 显示错误提示
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false
        })
      })
    }
  }
}

</script>
