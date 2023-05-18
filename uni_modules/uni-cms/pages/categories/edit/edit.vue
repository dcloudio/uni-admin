<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="name" label="名称" required>
        <uni-easyinput placeholder="类别名称" v-model="formData.name" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="description" label="描述">
        <uni-easyinput placeholder="类别描述" v-model="formData.description" trim="both"></uni-easyinput>
      </uni-forms-item>
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

// 获取需要验证的字段
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
    // 表单数据
    let formData = {
      "name": "",
      "description": "",
      "icon": "",
      "sort": null,
      "create_date": null
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
  onLoad(e) {
    // 如果有id参数，则获取详情
    if (e.id) {
      const id = e.id
      this.formDataId = id
      this.getDetail(id)
    }
  },
  onReady() {
    // 设置表单验证规则
    this.$refs.form.setRules(this.rules)
  },
  methods: {
    /**
     * 验证表单并提交
     */
    submit() {
      uni.showLoading({
        mask: true
      })
      // 验证表单
      this.$refs.form.validate().then((res) => {
        return this.submitForm(res)
      }).catch(() => {
      }).finally(() => {
        uni.hideLoading()
      })
    },

    /**
     * 提交表单
     * @param {Object} value 表单数据
     */
    submitForm(value) {
      // 使用 clientDB 提交数据
      return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
        uni.showToast({
          title: '修改成功'
        })
        // 刷新列表
        try {
          this.getOpenerEventChannel().emit('refreshData')
        } catch (e) { }
        // 返回上一页
        setTimeout(() => uni.navigateBack(), 500)
      }).catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false
        })
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
      // 获取详情
      db.collection(dbCollectionName).doc(id).field("name,description,icon,sort,create_date").get().then((res) => {
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
    }
  }
}

</script>
