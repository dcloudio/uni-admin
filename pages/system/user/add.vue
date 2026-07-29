<template>
  <view class="uni-container">
    <uni-forms ref="formRef" v-model="formData" :rules="rules" validateTrigger="bind" @submit="submit">
      <uni-forms-item name="username" label="用户名" required>
        <uni-easyinput v-model="formData.username" :clearable="false" placeholder="请输入用户名" />
      </uni-forms-item>
      <uni-forms-item name="nickname" label="用户昵称" required>
        <uni-easyinput v-model="formData.nickname" :clearable="false" placeholder="请输入用户昵称" />
      </uni-forms-item>
      <uni-forms-item name="password" label="初始密码" required>
        <uni-easyinput v-model="formData.password" :clearable="false" placeholder="请输入初始密码" />
      </uni-forms-item>
      <uni-forms-item name="role" label="角色列表" class="flex-center-x">
        <uni-data-checkbox multiple :localdata="roles" v-model="formData.role" />
      </uni-forms-item>
      <uni-forms-item name="tags" label="用户标签" labelWidth="100" class="flex-center-x">
        <uni-data-checkbox ref="checkboxRef" :multiple="true" v-model="formData.tags" collection="uni-id-tag" field="tagid as value, name as text"></uni-data-checkbox>
        <span class="link-btn" @click="gotoTagAdd">新增</span>
        <span class="link-btn" @click="gotoTagList" style="margin-left: 10px">管理</span>
      </uni-forms-item>
      <uni-forms-item name="authorizedApp" label="可登录应用" labelWidth="100" class="flex-center-x">
        <uni-data-checkbox :multiple="true" v-model="formData.authorizedApp" collection="opendb-app-list" field="appid as value, name as text"></uni-data-checkbox>
        <span class="link-btn" @click="gotoAppList">管理</span>
      </uni-forms-item>
      <uni-forms-item name="mobile" label="手机号">
        <uni-easyinput v-model="formData.mobile" :clearable="false" placeholder="请输入手机号" />
      </uni-forms-item>
      <uni-forms-item name="email" label="邮箱">
        <uni-easyinput v-model="formData.email" :clearable="false" placeholder="请输入邮箱" />
      </uni-forms-item>
      <uni-forms-item name="status" label="是否启用">
        <switch @change="binddata('status', $event.detail.value)" :checked="formData.status" />
      </uni-forms-item>
      <view class="uni-button-group">
        <button style="width: 100px" type="primary" class="uni-button" @click="submitForm">{{ $t('common.button.submit') }}</button>
        <navigator open-type="navigateBack" style="margin-left: 15px"
          ><button style="width: 100px" class="uni-button">{{ $t('common.button.back') }}</button></navigator
        >
      </view>
    </uni-forms>
  </view>
</template>

<script setup>
  import { validator } from '@/js_sdk/validator/uni-id-users.js';
  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'uni-id-users';
  function getValidator(fields) {
    let result = {};
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key];
      }
    }
    return result;
  }
  import { request } from '@/js_sdk/uni-admin/request.js';
  import { getCurrentInstance, ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  const { proxy } = getCurrentInstance();
  const formDataState = ref({
    username: '',
    nickname: '',
    password: '',
    role: [],
    authorizedApp: [],
    tags: [],
    mobile: undefined,
    email: undefined,
    status: true, //默认启用
  });
  const formData = formDataState;
  const rulesState = ref({
    ...getValidator(['username', 'password', 'role', 'mobile', 'email']),
    status: {
      rules: [
        {
          format: 'bool',
        },
      ],
    },
  });
  const rules = rulesState;
  const rolesState = ref([]);
  const roles = rolesState;
  const checkboxRef = ref(null);
  const formRef = ref(null);
  const gotoAppListAction = () => {
    uni.navigateTo({
      url: '../app/list',
    });
  };
  const gotoAppList = gotoAppListAction;
  const gotoTagListAction = () => {
    uni.navigateTo({
      url: '../tag/list',
    });
  };
  const gotoTagList = gotoTagListAction;
  const gotoTagAddAction = () => {
    uni.navigateTo({
      url: '../tag/add',
      events: {
        refreshCheckboxData: () => {
          checkboxRef.value.loadData();
        },
      },
    });
  };
  const gotoTagAdd = gotoTagAddAction;
  const submitFormAction = () => {
    formRef.value.submit();
  };
  const submitForm = submitFormAction;
  const submitAction = (event) => {
    const { value, errors } = event.detail;

    // 表单校验失败页面会提示报错 ，要停止表单提交逻辑
    // 表单校验失败页面会提示报错 ，要停止表单提交逻辑
    if (errors) {
      return;
    }
    uni.showLoading({
      title: '提交中...',
      mask: true,
    });
    // 是否启用功能的数据类型转换， 0 正常， 1 禁用
    // 是否启用功能的数据类型转换， 0 正常， 1 禁用
    if (typeof value.status === 'boolean') {
      value.status = Number(!value.status);
    }
    request('addUser', value)
      .then(() => {
        uni.showToast({
          title: '新增成功',
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
      .finally((err) => {
        uni.hideLoading();
      });
  };
  const submit = submitAction;
  const loadrolesAction = () => {
    db.collection('uni-id-roles')
      .limit(500)
      .get()
      .then((res) => {
        const roleIds = [];
        rolesState.value = res.result.data.map((item) => {
          roleIds.push(item.role_id);
          return {
            value: item.role_id,
            text: item.role_name,
          };
        });
        if (roleIds.indexOf('admin') === -1) {
          rolesState.value.unshift({
            value: 'admin',
            text: '超级管理员',
          });
        }
      })
      .catch((err) => {
        uni.showModal({
          title: '提示',
          content: err.message,
          showCancel: false,
        });
      });
  };
  const loadroles = loadrolesAction;
  onLoad(() => {
    loadrolesAction();
  });
</script>
<style>
  ::v-deep .uni-forms-item__label {
    width: 90px !important;
  }
</style>
