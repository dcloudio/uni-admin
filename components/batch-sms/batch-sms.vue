<template>
  <view>
    <uni-popup ref="smsPopupRef" type="center" @change="popupChange" :is-mask-click="false">
      <view class="sms-manager">
        <view class="sms-manager--header mb">群发短信</view>
        <uni-forms :label-width="100" :modelValue="smsDataModel" ref="smsFormRef">
          <uni-forms-item v-if="toType === 'user' && !isSelectedReceiver" label="目标对象" name="smsPreset" :rules="[{ required: true, errorMessage: '请选择目标对象' }]" required>
            <uni-data-select class="type m" placeholder="预设条件" size="mini" :clear="false" :localdata="smsPresetList" v-model="smsDataModel.smsPreset"> </uni-data-select>
            <view class="sms-data-tip">如需给指定用户发送，请在列表选择要发送的用户。</view>
          </uni-forms-item>
          <uni-forms-item label="目标对象" v-else-if="toType === 'user' && isSelectedReceiver">
            <view>当前已选择{{ receiver.length }}人</view>
          </uni-forms-item>
          <uni-forms-item label="目标对象" v-else-if="toType === 'userTags'">
            <view>当前已选择{{ receiver.length }}个标签</view>
            <view class="sms-data-tip">如标签关联的用户没有绑定手机号，将不会发送短信。</view>
          </uni-forms-item>

          <uni-forms-item label="跨分页选择" v-if="isSelectedReceiver && hasCondition">
            <checkbox-group @change="smsFilteredChange">
              <checkbox style="transform: scale(0.9)" :checked="smsDataModel.filtered"></checkbox>
            </checkbox-group>
            <view class="sms-data-tip">对用户进行了筛选后，可能存在分页无法全部选中时，请勾选跨分页选中</view>
          </uni-forms-item>
          <uni-forms-item label="任务名称" name="name" required :rules="[{ required: true, errorMessage: '请输入任务名称' }]">
            <uni-easyinput v-model="smsDataModel.name" placeholder="请输入任务名称，例如 “7日内未登录用户召回”" />
          </uni-forms-item>
          <uni-forms-item required label="短信模板" name="templateId" :rules="[{ required: true, errorMessage: '请选择短信模板' }]">
            <template v-if="!smsTemplateLoading">
              <view v-if="smsTemplate.length">
                <uni-data-select
                  class="type m"
                  placeholder="请选择短信模板"
                  size="mini"
                  :clear="false"
                  :localdata="smsTemplate"
                  v-model="smsDataModel.templateId"
                  @change="onSmsTemplateSelected"
                >
                </uni-data-select>
                <view class="sms-data-tip">
                  导入短信模版参考<a class="a-link" href="https://uniapp.dcloud.net.cn/uniCloud/admin.html#群发短信" target="_blank">教程</a>；若有新的短信模版，可
                  <text @click="chooseFile" class="a-link">点此导入 </text>
                </view>
              </view>
              <view v-else>
                <button @click="chooseFile" type="primary" style="width: 120px" size="mini">上传短信模板</button>
                <view class="sms-data-tip"
                  >当前未导入短信模板，请从dev.dcloud.net.cn的短信-<a href="https://dev.dcloud.net.cn/pages/sms/template" target="_blank">模板配置</a
                  >中导出短信模版，并在此导入。教程<a href="https://uniapp.dcloud.net.cn/uniCloud/admin.html#batch-sms" target="_blank">详见</a></view
                >
              </view>
            </template>
            <template v-else> 模板加载中... </template>
          </uni-forms-item>
          <uni-forms-item label="短信内容" v-if="smsTemplateContent">
            <view class="form-item-flex-center">{{ smsTemplateContent }}</view>
          </uni-forms-item>
          <uni-forms-item label="模板变量配置" :error-message="smsTemplateDataErrorMessage" v-if="smsDataModel.templateData.length">
            <view class="sms-data-item" :key="template.field" v-for="(template, index) in smsDataModel.templateData">
              <uni-easyinput class="field m" v-model="template.field" placeholder="字段" :clearable="false" :disabled="true" style="width: 120px; flex: none" />
              <uni-easyinput class="value m" v-model="template.value" placeholder="例 {uni-id-users.username}" :clearable="false" />
            </view>
            <view class="sms-data-tip">
              短信变量支持固定值和数据表查询两种方式；固定值如：各位同事，数据表查询如：{uni-id-users.username}；请注意，若使用数据表查询方式，目前仅支持查询 uni-id-users
              表；并注意确保数据库中查询字段值不为空，否则短信将发送失败。
            </view>
          </uni-forms-item>
        </uni-forms>
        <view class="uni-group">
          <button @click="sendSms(true)" class="uni-button">预览</button>
          <button @click="sendSms()" class="uni-button" type="primary">提交</button>
        </view>
      </view>
      <uni-icons type="closeempty" size="24" class="close" @click="close"></uni-icons>
    </uni-popup>
    <uni-popup ref="previewPopupRef" type="center" :is-mask-click="false">
      <view class="sms-manager preview">
        <view class="sms-manager--header mb">
          <view>短信预览</view>
          <view class="sub-title">仅预览第一条短信内容</view>
          <view class="sub-title"
            >预计送达 <text style="color: red">{{ smsSendUserCount }}</text> 位用户</view
          >
        </view>
        <view class="content">
          <view v-for="(content, index) of smsPreviewContent" :key="index">{{ content }}</view>
          <view class="length"
            >短信字数：
            <text class="num">{{ smsPreviewContent.length ? smsPreviewContent[0].length : 0 }}</text>
            字
          </view>
        </view>
        <view class="tip">
          <view>说明：</view>
          <view>若从数据表中查询，字段内容长度会影响总字数，短信字数＝短信签名字数+短信内容字数。</view>
          <view>短信长度不超过70个字，按照一条短信计费；超过70个字，按照67字/条拆分成多条计费。</view>
        </view>
        <view class="uni-group">
          <button @click="previewPopupRef.close()" class="uni-button">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
  const uniSmsCo = uniCloud.importObject('uni-sms-co');
  import { computed, ref, watch } from 'vue';
  defineOptions({
    name: 'batchSms',
  });
  const props = defineProps({
    // 发送类型 user|userTags
    toType: String,
    // 接收者 user=user._id, userTags=tag.id
    receiver: {
      type: Array,
      default() {
        return [];
      },
    },
    // 条件；跨分页选择时需要
    condition: {
      type: Object,
      default() {
        return {};
      },
    },
  });
  const smsTemplateLoadingState = ref(false);
  const smsTemplateLoading = smsTemplateLoadingState;
  const smsPresetListState = ref([
    {
      value: 'all',
      text: '全部用户',
    },
    {
      value: '7-day-offline-users',
      text: '7天内未登录用户',
    },
    {
      value: '15-day-offline-users',
      text: '15天内未登录用户',
    },
    {
      value: '30-day-offline-users',
      text: '30天内未登录用户',
    },
  ]);
  const smsPresetList = smsPresetListState;
  const smsTemplateState = ref([]);
  const smsTemplate = smsTemplateState;
  const smsTemplateDataErrorMessageState = ref('');
  const smsTemplateDataErrorMessage = smsTemplateDataErrorMessageState;
  const smsDataModelState = ref({
    name: '',
    templateId: '',
    templateData: [],
    smsPreset: '',
    filtered: false,
  });
  const smsDataModel = smsDataModelState;
  const smsTemplateContentState = ref('');
  const smsTemplateContent = smsTemplateContentState;
  const smsPreviewContentState = ref([]);
  const smsPreviewContent = smsPreviewContentState;
  const smsSendUserCountState = ref(0);
  const smsSendUserCount = smsSendUserCountState;
  const smsPopupRef = ref(null);
  const smsFormRef = ref(null);
  const previewPopupRef = ref(null);
  const isSelectedReceiverComputed = computed(() => {
    return !!props.receiver.length;
  });
  const isSelectedReceiver = isSelectedReceiverComputed;
  const sendAllComputed = computed(() => {
    return smsDataModelState.value.smsPreset === 'all' || props.toType === 'userTags';
  });
  const sendAll = sendAllComputed;
  const hasConditionComputed = computed(() => {
    return !!Object.keys(props.condition).length;
  });
  const hasCondition = hasConditionComputed;
  const smsFilteredChangeAction = () => {
    smsDataModelState.value.filtered = !smsDataModelState.value.filtered;
  };
  const smsFilteredChange = smsFilteredChangeAction;
  const popupChangeAction = (e) => {
    if (!e.show) resetAction();
  };
  const popupChange = popupChangeAction;
  const openAction = () => {
    smsPopupRef.value.open();
    loadSmsTemplateAction();
  };
  const open = openAction;
  const closeAction = () => {
    resetAction();
    smsPopupRef.value.close();
  };
  const close = closeAction;
  const loadSmsTemplateAction = async () => {
    if (smsTemplateState.value.length > 0 || smsTemplateLoadingState.value) return;
    smsTemplateLoadingState.value = true;
    try {
      const uniSmsCo = uniCloud.importObject('uni-sms-co', {
        customUI: true,
      });
      const res = await uniSmsCo.template();
      smsTemplateState.value = res.map((item) => ({
        ...item,
        value: item._id,
        text: item.name,
      }));
    } finally {
      smsTemplateLoadingState.value = false;
    }
  };
  const loadSmsTemplate = loadSmsTemplateAction;
  const onSmsTemplateSelectedAction = (templateId) => {
    const current = smsTemplateState.value.find((template) => template.value === templateId);
    if (!current) return;
    const reg = new RegExp(/\$\{(.*?)\}/g);
    let templateVars = [];
    let _execResult;
    while ((_execResult = reg.exec(current.content))) {
      const param = _execResult[1];
      if (param) {
        templateVars.push({
          field: param,
          value: '',
        });
      }
    }
    smsDataModelState.value.templateData = templateVars;
  };
  const onSmsTemplateSelected = onSmsTemplateSelectedAction;
  const sendSmsAction = async (isPreview = false) => {
    const values = await smsFormRef.value.validate();
    const receiver = props.receiver;
    for (const template of smsDataModelState.value.templateData) {
      if (!template.value) {
        smsTemplateDataErrorMessageState.value = '字段/值不可为空';
        return;
      }
    }
    smsTemplateDataErrorMessageState.value = '';
    const to = {
      type: props.toType,
      receiver,
    };
    if (smsDataModelState.value.filtered || smsDataModelState.value.smsPreset) {
      to.condition = smsDataModelState.value.smsPreset || props.condition;
    }
    if (isPreview) {
      const res = await uniSmsCo.preview(to, values.templateId, smsDataModelState.value.templateData);
      if (res.errCode === 0) {
        smsPreviewContentState.value = res.list;
        previewPopupRef.value.open();
        smsSendUserCountState.value = res.total;
        return;
      }
    }
    uni.showModal({
      title: '发送确认',
      content: `短信${
        sendAllComputed.value ? '将发送给所有用户' : smsSendUserCountState.value ? `预计发送${smsSendUserCountState.value}人` : `将发送给符合条件的用户`
      }，确定发送？`,
      success: async (e) => {
        smsSendUserCountState.value = 0;
        if (e.cancel) return;
        const res = await uniSmsCo.createSmsTask(to, values.templateId, smsDataModelState.value.templateData, {
          taskName: values.name,
        });
        if (res.taskId) {
          uni.showModal({
            content: '短信任务已提交，您可在DCloud开发者后台查看短信发送记录',
            confirmText: '立即查看',
            cancelText: '关闭',
            success: (e) => {
              if (e.cancel) {
                resetAction();
                smsPopupRef.value.close();
              } else {
                // #ifdef H5
                window.open('https://unicloud.dcloud.net.cn/pages/uni-sms/send-record', '_blank');
                // #endif
                // ifndef H5
                resetAction();
                smsPopupRef.value.close();
                // endif
              }
            },
          });
        }
      },
    });
  };
  const sendSms = sendSmsAction;
  const chooseFileAction = () => {
    if (typeof window.FileReader === 'undefined') {
      uni.showModal({
        content: '当前浏览器不支持文件上传，请升级浏览器重试',
        showCancel: false,
      });
      return;
    }
    uni.chooseFile({
      count: 1,
      extension: ['.json'],
      success: ({ tempFiles }) => {
        if (tempFiles.length <= 0) return;
        const [file] = tempFiles;
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => parserFileJsonAction(null, reader.result);
        reader.onerror = () => parserFileJsonAction(reader.error);
      },
      fail: () => {
        uni.showModal({
          content: '打开选择文件框失败',
          showCancel: false,
        });
      },
    });
  };
  const chooseFile = chooseFileAction;
  const parserFileJsonAction = async (error, fileContent) => {
    if (error) {
      console.error(error);
      uni.showModal({
        content: '文件读取失败，请重新上传文件',
        showCancel: false,
      });
      return;
    }
    let templates = [];
    try {
      templates = JSON.parse(fileContent);
    } catch (e) {
      console.error(e);
      uni.showModal({
        content: '短信模板解析失败，请检查模板格式',
        showCancel: false,
      });
      return;
    }
    const res = await uniSmsCo.updateTemplates(templates);
    if (res.errCode === 0) {
      uni.showModal({
        content: '短信模板更新成功',
        showCancel: false,
        success: () => {
          loadSmsTemplateAction();
        },
      });
    }
  };
  const parserFileJson = parserFileJsonAction;
  const resetAction = () => {
    smsDataModelState.value.name = '';
    smsDataModelState.value.smsPreset = '';
    smsDataModelState.value.templateId = '';
    smsDataModelState.value.templateData = [];
    smsPreviewContentState.value = [];
    smsTemplateContentState.value = '';
    smsSendUserCountState.value = 0;
  };
  const reset = resetAction;
  watch(
    () => smsDataModelState.value,
    (smsDataModel) => {
      if (!smsDataModel.templateId) return '';
      const template = smsTemplateState.value.find((template) => template.value === smsDataModel.templateId);
      let content = smsDataModel.templateData.reduce((res, param) => {
        const reg = new RegExp(`\\$\\{${param.field}\\}`);
        return res.replace(reg, ($1) => param.value || $1);
      }, template.content);
      smsTemplateContentState.value = `【${template.sign}】${content}`;
    },
    {
      deep: true,
    }
  );

  defineExpose({ close: closeAction, open: openAction });
</script>

<style lang="scss">
  @import '@/uni_modules/uni-scss/variables.scss';

  .a-link {
    cursor: pointer;
    color: $uni-primary;
    text-decoration: none;
  }

  .close {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
  }

  .sms-manager {
    width: 570px;
    background: #fff;
    padding: 30px;
    border-radius: 5px;

    &.preview {
      width: 550px;
    }

    &--header {
      text-align: center;
      font-size: 22px;

      &.mb {
        margin-bottom: 50px;
      }

      .sub-title {
        margin-top: 5px;
        font-size: 16px;
        color: #999;
      }
    }

    .content {
      margin-top: 20px;
      font-size: 16px;
      line-height: 1.5;

      .length {
        text-align: right;
        font-size: 13px;
        margin-top: 20px;

        .num {
          color: red;
        }
      }
    }

    .tip {
      border-top: #ccc solid 1px;
      padding-top: 20px;
      margin-top: 20px;
      line-height: 1.7;
      font-size: 13px;
      color: #999;
    }
  }

  .sms-data-item {
    display: flex;
    align-items: center;
    margin-top: 10px;

    &:first-child {
      margin-top: 0;
    }

    .m {
      margin: 0 5px;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    .type {
      width: 100px;
      flex: none;
    }

    .add,
    .minus {
      cursor: pointer;
    }
  }

  .sms-data-tip {
    color: $uni-info;
    font-size: 12px;
    margin-top: 5px;
  }

  .form-item-flex-center {
    height: 100%;
    display: flex;
    align-items: center;
  }
</style>
