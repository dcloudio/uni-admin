import { computed, reactive, ref } from 'vue';
import { request } from '@/js_sdk/uni-admin/request.js';
import { validator, mpPlatform as mpPlatformOptions } from '@/js_sdk/validator/opendb-app-list.js';

const formatFilePickerValue = (url) =>
  url
    ? {
        name: '',
        extname: '',
        url,
      }
    : {};

function getValidator(fields) {
  const result = {};
  for (const key in validator) {
    if (fields.includes(key)) {
      result[key] = validator[key];
    }
  }
  return result;
}

const schemes = ['mimarket', 'samsungapps', 'appmarket', 'oppomarket', 'vivomarket'];
const schemeBrand = ['xiaomi', 'samsung', 'huawei', 'oppo', 'vivo'];

export function usePublishAddDetail(formRef) {
  const formData = reactive({
    appid: '',
    name: '',
    app_type: 0,
    icon_url: '',
    introduction: '',
    alias: '',
    description: '',
    screenshot: [],
    store_list: [],
    app_android: {},
    app_ios: {},
    app_harmony: {},
    mp_weixin: {},
    mp_alipay: {},
    mp_baidu: {},
    mp_toutiao: {},
    mp_qq: {},
    mp_lark: {},
    mp_kuaishou: {},
    mp_dingtalk: {},
    mp_jd: {},
    h5: {},
    quickapp: {},
  });
  const rules = Object.freeze(getValidator(Object.keys(formData)));
  const mpPlatform = Object.freeze(mpPlatformOptions);
  const screenshotList = ref([]);
  const middleware_img = reactive({});
  const middleware_checkbox = reactive({});
  const appPackageInfo = ref({});
  const appPlatformKeys = Object.freeze(['app_ios', 'app_android', 'app_harmony']);
  const appPlatformValues = Object.freeze({
    app_android: 'Android',
    app_ios: 'iOS',
    app_harmony: 'Harmony',
  });
  const keepItems = ref(Object.freeze([]));
  const isEdit = ref(false);
  const deletedStore = reactive([]);
  const mpPlatformKeys = Object.freeze(Object.keys(mpPlatform));
  const platFormKeys = Object.freeze([].concat(mpPlatformKeys, appPlatformKeys));

  [].concat(mpPlatformKeys, ['icon_url', 'quickapp']).forEach((key) => {
    middleware_img[key] = {};
  });
  platFormKeys.forEach((key) => {
    middleware_checkbox[key] = false;
  });

  const hasPackage = computed(() => appPackageInfo.value && !!Object.keys(appPackageInfo.value).length);

  function requestCloudFunction(functionName, params = {}) {
    return request(functionName, params, {
      functionName: 'uni-upgrade-center',
    });
  }

  function hasValue(value) {
    if (typeof value !== 'object') return !!value;
    if (value instanceof Array) return !!value.length;
    return !!(value && Object.keys(value).length);
  }

  function initFormData(obj) {
    if (!obj || !Object.keys(obj).length) return;
    for (const key in obj) {
      const value = obj[key];
      switch (key) {
        case 'icon_url':
          middleware_img[key] = formatFilePickerValue(value);
          break;
        case 'screenshot':
          screenshotList.value = value.map((item) => formatFilePickerValue(item));
          break;
        default:
          if ((key.indexOf('mp') !== -1 || key.indexOf('app') !== -1) && hasValue(value)) {
            setPlatformChcekbox(key, true);
            if (value.qrcode_url) middleware_img[key] = formatFilePickerValue(value.qrcode_url);
          }
          break;
      }
      setFormData(key, value);
    }
  }

  function setFormData(key, value) {
    const keys = key.indexOf('.') !== -1 ? key.split('.') : [key];
    const lens = keys.length - 1;
    let tempObj = formData;
    keys.forEach((currentKey, index) => {
      const obj = tempObj[currentKey];
      if (typeof obj === 'object' && index < lens) {
        tempObj = obj;
      } else {
        tempObj[currentKey] = value;
      }
    });
  }

  function getFormData(key) {
    const keys = key.indexOf('.') !== -1 ? key.split('.') : [key];
    let tempObj = formData;
    for (let i = 0; i < keys.length; i++) {
      tempObj = tempObj[keys[i]];
      if (tempObj == null) {
        return false;
      }
    }
    return tempObj;
  }

  function formatFormData() {
    setFormData(
      'screenshot',
      screenshotList.value.map((item) => item.fileID || item.url)
    );

    for (let i = 0; i < formData.store_list.length; i++) {
      const item = formData.store_list[i];
      if (item.scheme.trim().length === 0) {
        formData.store_list.splice(i, 1);
        i--;
        continue;
      }

      const index = schemes.indexOf((item.scheme.match(/(.*):\/\//) || [])[1]);
      if (index !== -1) {
        if (item.id !== schemeBrand[index]) {
          deletedStore.push(item.id);
        }
        item.id = schemeBrand[index];
      }
      item.priority = parseFloat(item.priority);
    }

    keepItems.value = platFormKeys
      .filter((key) => getPlatformChcekbox(key) && (formData[key].url || formData[key].abm_url || formData[key].qrcode_url))
      .concat(['icon_url', 'screenshot', 'create_date', 'store_list', 'app_type']);

    if (formData.h5 && formData.h5.url) keepItems.value.push('h5');
  }

  function autoFill() {
    const appid = getFormData('appid');
    if (!appid) return;

    uni.showLoading({ mask: true });
    requestCloudFunction('getAppInfo', { appid })
      .then((res) => {
        if (res.success) {
          setFormData('description', res.description);
          setFormData('name', res.name);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        uni.hideLoading();
      });
  }

  function autoFillApp() {
    const appid = getFormData('appid');
    if (!appid) return;

    appPlatformKeys.forEach((key) => {
      fetchAppInfo(appid, appPlatformValues[key]).then((res) => {
        if (res && res.success) {
          setPlatformChcekbox(key, true);
          setFormData(key, {
            name: res.name,
            url: res.url,
          });
        }
      });
    });
  }

  function fetchAppInfo(appid, platform) {
    uni.showLoading({ mask: true });
    return requestCloudFunction('getAppVersionInfo', { appid, platform })
      .then((res) => res)
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        uni.hideLoading();
      });
  }

  function iconUrlSuccess(res, key) {
    uni.showToast({
      icon: 'success',
      title: '上传成功',
      duration: 500,
    });
    setFormData(key, res.tempFiles[0].url);
  }

  async function iconUrlDelete(res, key) {
    await requestCloudFunction('deleteFile', {
      fileList: [res.tempFile.fileID || res.tempFile.url],
    });
    uni.showToast({
      icon: 'success',
      title: '删除成功',
      duration: 800,
    });
    if (!key) return;
    setFormData(key, '');
    formRef.value.clearValidate(key);
  }

  function getPlatformChcekbox(mpName) {
    return middleware_checkbox[mpName];
  }

  function setPlatformChcekbox(mpName, value = false) {
    middleware_checkbox[mpName] = value;
  }

  function selectFile() {
    if (hasPackage.value) {
      uni.showToast({
        icon: 'none',
        title: '只可上传一个文件，请删除已上传后重试',
        duration: 1000,
      });
    }
  }

  return {
    formData,
    rules,
    mpPlatform,
    screenshotList,
    middleware_img,
    middleware_checkbox,
    appPackageInfo,
    appPlatformKeys,
    appPlatformValues,
    keepItems,
    isEdit,
    deletedStore,
    mpPlatformKeys,
    platFormKeys,
    hasPackage,
    requestCloudFunction,
    initFormData,
    setFormData,
    getFormData,
    formatFormData,
    autoFill,
    autoFillApp,
    fetchAppInfo,
    iconUrlSuccess,
    iconUrlDelete,
    getPlatformChcekbox,
    setPlatformChcekbox,
    selectFile,
  };
}
