<template>
    <view>
        <uni-popup ref="smsPopup" type="center" @change="popupChange">
            <view class="sms-manager">
                <view class="sms-manager--header mb">群发短信</view>
                <uni-forms :label-width="100" :modelValue="smsDataModel" ref="smsForm">
                    <uni-forms-item label="目标对象" v-if="toType === 'user'">
                        <view v-if="isSelectedReceiver">当前已选择{{ receiver.length }}人</view>
                        <view v-else>全部用户</view>
                        <view class="sms-data-tip">如需给指定用户发送，请在列表选择要发送的用户。</view>
                    </uni-forms-item>
                    <uni-forms-item label="目标对象" v-else>
                        <view>当前已选择{{ receiver.length }}个标签</view>
                        <view class="sms-data-tip">请确认此处填写的字段与短信模板中的字段相匹配，否则短信会发送失败。</view>
                    </uni-forms-item>
                    <uni-forms-item label="名称" name="name" required :rules="[{ required: true, errorMessage: '请输入任务名称' }]">
                        <uni-easyinput v-model="smsDataModel.name" placeholder="请输入任务名称" />
                    </uni-forms-item>
                    <uni-forms-item required label="短信模板" name="templateId"
                        :rules="[{ required: true, errorMessage: '请选择短信模板' }]">
                        <unicloud-db ref="template_db" collection="batch-sms-template" v-slot:default="{data,loading}"
                            field="_id as value,content as text">
                            <template v-if="!loading">
                                <view v-if="data.length">
                                    <uni-data-select class="type m" placeholder="请选择短信模板" size="mini" :clear="false"
                                        :localdata="data" v-model="smsDataModel.templateId" @change="onSmsTemplateSelected">
                                    </uni-data-select>
                                    <view class="sms-data-tip">添加新的短信模板后，<text @click="chooseFile" class="a-link">点此重新导入</text></view>
                                </view>
                                <view v-else>
                                    <button @click="chooseFile" type="primary" style="width: 120px;" size="mini">上传短信模板</button>
                                    <view class="sms-data-tip">当前未添加短信模板，请在开发者中心-短信验证码导出短信模板后上传</view>
                                </view>
                            </template>
                            <template v-else>
                                模板加载中...
                            </template>
                        </unicloud-db>
                    </uni-forms-item>
                    <uni-forms-item label="模板变量配置" :error-message="smsTemplateDataErrorMessage"
                        v-if="smsDataModel.templateData.length">
                        <view class="sms-data-item" :key="template.field"
                            v-for="(template, index) in smsDataModel.templateData">
                            <uni-easyinput class="field m" v-model="template.field" placeholder="字段" :clearable="false"
                                :disabled="true" style="width: 120px;flex:none;" />
                            <uni-easyinput class="value m" v-model="template.value"
                                placeholder="支持 uni-id-users 表字段，格式 {字段名} 例 {username}" :clearable="false" />
                        </view>
                        <view class="sms-data-tip">如填写字段变量，请确保数据库中字段值不为空，否则短信将发送失败。</view>
                    </uni-forms-item>
                    <uni-forms-item label="短信预览" v-if="smsPreviewContent">
                        <view class="form-item-flex-center">{{smsPreviewContent}}</view>
                    </uni-forms-item>
                </uni-forms>
                <view class="uni-group">
                    <button @click="sendSms(true)" class="uni-button">预览</button>
                    <button @click="sendSms()" class="uni-button" type="primary">发送</button>
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
            default() {
                return []
            }
        },

    },
    data() {
        return {
            smsdDataFieldSelect: [
                { value: 'static', text: "静态数据" },
                { value: 'dynamic', text: "动态数据" }
            ],
            smsTemplateDataErrorMessage: '',
            smsDataModel: {
                name: '',
                templateId: '',
                templateData: []
            },
            smsPreviewContent: ''
        }
    },
    computed: {
        isSelectedReceiver() {
            return !!this.receiver.length
        },
        sendAll() {
            return !this.isSelectedReceiver || this.toType === 'userTags'
        }
    },
    watch: {
        smsDataModel: {
            handler(smsDataModel) {
                if (!smsDataModel.templateId) return ''

                const template = this.$refs.template_db.dataList.find(template => template.value === smsDataModel.templateId)
                let content = smsDataModel.templateData.reduce((res, param) => {
                    const reg = new RegExp(`\\$\\{${param.field}\\}`)
                    return res.replace(reg, ($1) => param.value || $1)
                }, template.text)

                this.smsPreviewContent = content
            },
            deep: true
        }
    },
    methods: {
        popupChange (e) {
            if (!e.show) this.reset()
        },
        open() {
            this.$refs.smsPopup.open()
        },
        onSmsTemplateSelected(templateId) {
            const current = this.$refs.template_db.dataList.find(template => template.value === templateId)

            if (!current) return

            const reg = new RegExp(/\$\{(.*?)\}/g)
            let templateVars = []
            let _execResult

            while (_execResult = reg.exec(current.text)) {
                const param = _execResult[1]

                if (param) {
                    templateVars.push({
                        field: param,
                        value: ''
                    })
                }
            }

            this.smsDataModel.templateData = templateVars
        },
        async sendSms(isPreview = false) {
            const values = await this.$refs.smsForm.validate()
            const receiver = this.receiver

            for (const template of this.smsDataModel.templateData) {
                if (!template.field || !template.value) {
                    this.smsTemplateDataErrorMessage = '字段/值不可为空'
                    return
                }
                break
            }
            this.smsTemplateDataErrorMessage = ''

            if (isPreview) {
                const res = await uniSmsCo.preview(
                    {
                        all: this.sendAll,
                        type: this.toType,
                        receiver
                    },
                    values.templateId,
                    this.smsDataModel.templateData
                )

                if (res.errCode === 0) {
                    uni.showModal({
                        title: '短信预览',
                        content: res.list.join('\n'),
                        showCancel: false
                    })
                    return
                }
            }

            uni.showModal({
                title: '发送确认',
                content: `短信${this.sendAll ? '将发送给所有用户': `预计发送${this.receiver.length}人`}，确定发送？`,
                success: async (e) => {
                    if (e.cancel) return

                    const res = await uniSmsCo.createSmsTask({
                        all: this.sendAll,
                        type: this.toType,
                        receiver
                    },
                    values.templateId,
                    this.smsDataModel.templateData, {
                        taskName: values.name
                    }
                    )

                    if (res.taskId) {
                        uni.showModal({
                            content: '短信任务已创建，可在短信任务中查看进度',
                            showCancel: false,
                            success: () => {
                                this.reset()
                                this.$refs.smsPopup.close()
                            }
                        })
                    }
                }
            })
        },
        chooseFile() {
            if (typeof window.FileReader === 'undefined') {
                uni.showModal({
                    content: '当前浏览器不支持文件上传，请升级浏览器重试',
                    showCancel: false
                })
                return
            }

            uni.chooseFile({
                count: 1,
                extension: ['.json'],
                success: ({ tempFiles }) => {
                    if (tempFiles.length <= 0) return
                    const [file] = tempFiles
                    const reader = new FileReader()

                    reader.readAsText(file)
                    reader.onload = () => this.parserFileJson(null, reader.result)
                    reader.onerror = () => this.parserFileJson(reader.error)
                },
                fail: () => {
                    uni.showModal({
                        content: '打开选择文件框失败',
                        showCancel: false
                    })
                }
            })
        },
        async parserFileJson(error, fileContent) {
            if (error) {
                console.error(error)
                uni.showModal({
                    content: '文件读取失败，请重新上传文件',
                    showCancel: false
                })
                return
            }

            let templates = []
            try {
                templates = JSON.parse(fileContent)
            } catch (e) {
                console.error(e)
                uni.showModal({
                    content: '短信模板解析失败，请检查模板格式',
                    showCancel: false
                })
                return
            }

            const res = await uniSmsCo.updateTemplates(templates)
            if (res.errCode === 0) {
                uni.showModal({
                    content: '短信模板更新成功',
                    showCancel: false,
                    success: () => {
                        this.$refs.template_db.refresh()
                    }
                })
            }
        },
        reset () {
            this.smsDataModel.name = ''
            this.smsDataModel.templateId = ''
            this.smsDataModel.templateData = []
            this.smsPreviewContent = ''
        }
    }
}
</script>

<style lang="scss">
@import '@/uni_modules/uni-scss/variables.scss';

.a-link {
    cursor: pointer;
}
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