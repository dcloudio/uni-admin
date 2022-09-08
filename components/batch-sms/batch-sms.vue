<template>
    <view>
        <uni-popup ref="smsPopup" type="center">
            <view class="sms-manager">
                <view class="sms-manager--header mb">发送短信</view>
                <uni-forms :label-width="100" :modelValue="smsDataModel" ref="smsForm">
                    <uni-forms-item label="目标对象" v-if="toType === 'user'">
                        <span v-if="isSelectedReceiver">当前已选择{{ receiver.length }}人</span>
                        <span v-else>全部用户</span>
                        <view class="sms-data-tip">请确认此处填写的字段与短信模板中的字段相匹配，否则短信会发送失败。</view>
                    </uni-forms-item>
                    <uni-forms-item label="目标对象" v-else>
                        <span>当前已选择{{ receiver.length }}个标签</span>
                        <view class="sms-data-tip">请确认此处填写的字段与短信模板中的字段相匹配，否则短信会发送失败。</view>
                    </uni-forms-item>
                    <uni-forms-item required label="短信模板" name="templateId"
                        :rules="[{ required: true, errorMessage: '请选择短信模板' }]">
                        <uni-data-select class="type m" placeholder="请选择短信模板" size="mini" :clear="false"
                            v-model="smsDataModel.templateId" :localdata="smsTemplateSelect" @change="onSmsTemplateSelected">
                        </uni-data-select>
                        <!-- <uni-easyinput v-model="smsDataModel.templateId" placeholder="请输入短信模板ID" /> -->
                    </uni-forms-item>
                    <uni-forms-item label="模板变量配置" :error-message="smsTemplateDataErrorMessage" v-if="smsDataModel.templateData.length">
                        <view class="sms-data-item" :key="template.field" v-for="(template, index) in smsDataModel.templateData">
                            <uni-easyinput class="field m" v-model="template.field" placeholder="字段"
                                :clearable="false" :disabled="true" style="width: 120px;flex:none;" />
                            <!-- <uni-data-select class="type m" placeholder="请选择字段类型" size="mini" :clear="false"
                                v-model="template.type" :localdata="smsdDataFieldSelect">
                            </uni-data-select> -->
                            <uni-easyinput class="value m" v-model="template.value" placeholder="支持 uni-id-users 表字段，格式 {字段名}"
                                :clearable="false" />
                            <!-- <uni-data-select class="m" placeholder="请选择" size="mini" :clear="false"
                                v-model="template.value" :localdata="smsDynamicField" v-else>
                            </uni-data-select> -->
                            <!-- <uni-icons class="add m" v-if="index === 0" type="plus" size="26"
                                @click="smsDataItemChange('plus')"></uni-icons>
                            <uni-icons class="minus m" v-else type="minus" size="26" color="#f00"
                                @click="smsDataItemChange('minus', index)"></uni-icons> -->
                        </view>
                        <view class="sms-data-tip">请确认此处填写的字段与短信模板中的字段相匹配，否则短信会发送失败。</view>
                    </uni-forms-item>
                    <uni-forms-item label="短信预览" v-if="smsPreviewContent">
                       <view class="form-item-flex-center">{{smsPreviewContent}}</view>
                    </uni-forms-item>
                </uni-forms>
                <view class="uni-group">
                    <button @click="sendSms" class="uni-button" type="primary">发送</button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>

const uniSmsCo = uniCloud.importObject('uni-sms-co')

export default {
    name: 'batchSms',
    props: {
        // 发送类型 user|userTags
        toType: String,
        // 接收者 user=user._id, userTags=tag.id
        receiver: {
            type: Array,
            default () {
                return []
            }
        },

    },
    data() {
        return {
            smsTemplate: [],
            smsTemplateSelect: [],
            smsdDataFieldSelect: [
                { value: 'static', text: "静态数据" },
                { value: 'dynamic', text: "动态数据" }
            ],
            smsTemplateDataErrorMessage: '',
            smsDataModel: {
                templateId: '',
                templateData: []
            },
            smsPreviewContent: ''
        }
    },
    computed: {
        isSelectedReceiver () {
            return !!this.receiver.length
        },
        sendAll () {
            return !this.isSelectedReceiver || this.toType === 'userTags'
        }
    },
    watch: {
        smsDataModel: {
            handler (smsDataModel) {
                if (!smsDataModel.templateId) return ''

                const template = this.smsTemplate.find(template => template.id === smsDataModel.templateId)
                let content = smsDataModel.templateData.reduce((res, param) => {
                    const reg = new RegExp(`\\$\\{${param.field}\\}`)
                    return res.replace(reg, ($1) => param.value || $1)
                }, template.content)
            
                this.smsPreviewContent = content
            },
            deep: true
        }
    },
    mounted () {
        this.loadSmsTemplate()
    },
    methods: {
        async loadSmsTemplate () {
            const res = await uniSmsCo.template()
            if (!res || res.length <= 0) return
            this.smsTemplate = res
            this.smsTemplateSelect = res.map(template => ({
                text: template.name,
                value: template.id
            }))
        },
        open() {
            this.$refs.smsPopup.open()
        },
        smsDataItemChange(type, index) {
            if (type === 'plus') {
                this.smsDataModel.templateData.push({
                    field: '',
                    value: '',
                    type: 'static'
                })
            } else {
                this.smsDataModel.templateData.splice(index, 1)
            }
        },
        onSmsTemplateSelected (templateId) {
            const current = this.smsTemplate.find(template => template.id === templateId)

            if (!current) return

            const reg = new RegExp(/\$\{(.*?)\}/g)
            let templateVars = []
            let _execResult

            while (_execResult = reg.exec(current.content)) {
                const param = _execResult[1]

                if (param) {
                    templateVars.push({
                        field: param,
                        value: '',
                        type: 'static'
                    })
                }
            }

            this.smsDataModel.templateData = templateVars
        },
        async sendSms() {
            const values = await this.$refs.smsForm.validate()
            const receiver = this.receiver
            console.log(this.smsDataModel.templateData)

            for (const template of this.smsDataModel.templateData) {
                if (!template.field || !template.value) {
                    this.smsTemplateDataErrorMessage = '字段/值不可为空'
                    return
                }
                break
            }
            this.smsTemplateDataErrorMessage = ''

            const res = await uniSmsCo.createSmsTask({
                all: this.sendAll,
                type: this.toType,
                receiver
            },
                values.templateId,
                this.smsDataModel.templateData)

            if (res.taskId) {
                uni.showModal({
                    content: '短信任务已创建，可在短信任务中查看进度',
                    showCancel: false,
                    success: () => {
                        this.smsDataModel.templateId = ''
                        this.smsDataModel.templateData = []
                        this.smsPreviewContent = ''
                        this.$refs.smsPopup.close()
                    }
                })
            }
        }
    }
}
</script>

<style lang="scss">
@import '@/uni_modules/uni-scss/variables.scss';

.sms-manager {
    width: 560px;
    background: #fff;
    padding: 30px;
    border-radius: 5px;

    &--header {
        text-align: center;
        font-size: 22px;

        &.mb {
            margin-bottom: 50px;
        }
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

    //.options {
    //  display: flex;
    //  align-content: center;
    //}
    .field {
        // flex: 1;
    }

    .type {
        width: 100px;
        flex: none;
    }

    .value {
        // width: 80px;
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