<template>
  <view class="uni-container">
    <uni-forms ref="formRef" :value="formData" validateTrigger="bind">
      <uni-forms-item name="tagid" label="标签tagid" required>
        <uni-easyinput placeholder="标签的tagid" v-model="formData.tagid"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="name" label="标签名称" required>
        <uni-easyinput placeholder="标签名称" v-model="formData.name"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="description" label="标签描述">
        <textarea placeholder="标签描述" @input="binddata('description', $event.detail.value)" class="uni-textarea-border" v-model="formData.description"></textarea>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px">
          <button class="uni-button" style="width: 100px">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script setup>
  import { validator } from '@/js_sdk/validator/uni-id-tag.js';
  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'uni-id-tag';
  function getValidator(fields) {
    let result = {};
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key];
      }
    }
    return result;
  }
  import { getCurrentInstance, ref } from 'vue';
  import { onReady } from '@dcloudio/uni-app';
  const { proxy } = getCurrentInstance();
  let formDataInitial = {
    tagid: '',
    name: '',
    description: '',
  };
  const formDataState = ref(formDataInitial);
  const formData = formDataState;
  const formOptionsState = ref({});
  const formOptions = formOptionsState;
  const rulesState = ref({
    ...getValidator(Object.keys(formDataInitial)),
  });
  const rules = rulesState;
  const formRef = ref(null);
  const submitAction = () => {
    uni.showLoading({
      mask: true,
    });
    formRef.value
      .validate()
      .then((res) => {
        return submitFormAction(res);
      })
      .catch(() => {})
      .finally(() => {
        uni.hideLoading();
      });
  };
  const submit = submitAction;
  const submitFormAction = (value) => {
    // 使用 clientDB 提交数据
    return db
      .collection(dbCollectionName)
      .add(value)
      .then((res) => {
        uni.showToast({
          title: '新增成功',
        });
        proxy.getOpenerEventChannel().emit('refreshData');
        proxy.getOpenerEventChannel().emit('refreshCheckboxData');
        setTimeout(() => uni.navigateBack(), 500);
      })
      .catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false,
        });
      });
  };
  const submitForm = submitFormAction;
  onReady(() => {
    formRef.value.setRules(rulesState.value);
  });
</script>
<style>
  ::v-deep .uni-forms-item__label {
    width: 90px !important;
  }
</style>
