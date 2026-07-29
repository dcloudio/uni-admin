<template>
  <view class="uni-container">
    <uni-forms ref="formRef" :value="formData" validateTrigger="bind">
      <uni-forms-item name="permission_id" label="权限ID" required>
        <uni-easyinput
          placeholder="权限唯一标识，不可修改，不允许重复"
          @input="binddata('permission_id', $event.detail.value)"
          v-model="formData.permission_id"
          trim="both"
          disabled
        ></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="permission_name" label="权限名称" required>
        <input placeholder="权限名称" @input="binddata('permission_name', $event.detail.value)" class="uni-input-border" v-model="formData.permission_name" trim="both" />
      </uni-forms-item>
      <uni-forms-item name="comment" label="备注">
        <textarea placeholder="备注" @input="binddata('comment', $event.detail.value)" class="uni-textarea-border" v-model="formData.comment" trim="both"></textarea>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px" @click="submit">{{ $t('common.button.submit') }}</button>
        <navigator open-type="navigateBack" style="margin-left: 15px">
          <button class="uni-button" style="width: 100px">{{ $t('common.button.back') }}</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script setup>
  import { validator } from '@/js_sdk/validator/uni-id-permissions.js';
  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'uni-id-permissions';
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
  import { onLoad, onReady } from '@dcloudio/uni-app';
  const { proxy } = getCurrentInstance();
  let formDataInitial = {
    permission_id: '',
    permission_name: '',
    comment: '',
  };
  const formDataState = ref(formDataInitial);
  const formData = formDataState;
  const formOptionsState = ref({});
  const formOptions = formOptionsState;
  const rulesState = ref({
    ...getValidator(Object.keys(formDataInitial)),
  });
  const rules = rulesState;
  const formDataIdState = ref(undefined);
  const formDataId = formDataIdState;
  const formRef = ref(null);
  const submitAction = () => {
    uni.showLoading({
      mask: true,
    });
    formRef.value
      .validate()
      .then((res) => {
        submitFormAction(res);
      })
      .catch(() => {
        uni.hideLoading();
      });
  };
  const submit = submitAction;
  const submitFormAction = (value) => {
    // 使用 clientDB 提交数据
    db.collection(dbCollectionName)
      .doc(formDataIdState.value)
      .update(value)
      .then((res) => {
        uni.showToast({
          title: '修改成功',
        });
        proxy.getOpenerEventChannel().emit('refreshData');
        setTimeout(() => uni.navigateBack(), 500);
      })
      .catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false,
        });
      })
      .finally(() => {
        uni.hideLoading();
      });
  };
  const submitForm = submitFormAction;
  const getDetailAction = (id) => {
    uni.showLoading({
      mask: true,
    });
    db.collection(dbCollectionName)
      .doc(id)
      .field('permission_id,permission_name,comment')
      .get()
      .then((res) => {
        const data = res.result.data[0];
        if (data) {
          formDataState.value = data;
        }
      })
      .catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false,
        });
      })
      .finally(() => {
        uni.hideLoading();
      });
  };
  const getDetail = getDetailAction;
  onLoad((e) => {
    if (e.id) {
      const id = e.id;
      formDataIdState.value = id;
      getDetailAction(id);
    }
  });
  onReady(() => {
    formRef.value.setRules(rulesState.value);
  });
</script>

<style>
  ::v-deep .uni-forms-item__label {
    width: 90px !important;
  }
</style>
