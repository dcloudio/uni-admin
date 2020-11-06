<template>
    <view class="uni-container">
        <uni-forms ref="form" validateTrigger="bind" :rules="rules" @submit="submit">
            <uni-forms-item name="permission_id" label="权限标识">
                <input disabled v-model="formData.permission_id" @input="binddata('permission_id', $event.detail.value)"
                    class="uni-input-border uni-disabled" />
            </uni-forms-item>
            <uni-forms-item name="permission_name" label="权限名称">
                <input v-model="formData.permission_name" @input="binddata('permission_name', $event.detail.value)"
                    class="uni-input-border" />
            </uni-forms-item>
            <uni-forms-item name="comment" label="备注">
                <textarea v-model="formData.comment" @input="binddata('comment', $event.detail.value)" class="uni-textarea-border"></textarea>
            </uni-forms-item>

            <view class="uni-button-group">
                <button style="width: 100px;" type="primary" class="uni-button" @click="submitForm">提交</button>
                <navigator open-type="navigateBack" style="margin-left: 15px;"><button style="width: 100px;" class="uni-button">返回</button></navigator>
            </view>
        </uni-forms>
    </view>
</template>

<script>
    import validator from '@/js_sdk/validator/uni-id-permissions.js';

    const db = uniCloud.database();
    const dbCmd = db.command;
    const dbCollectionName = 'uni-id-permissions';

    function getValidator(fields) {
        let reuslt = {}
        for (let key in validator) {
            if (fields.includes(key)) {
                reuslt[key] = validator[key]
            }
        }
        return reuslt
    }

    export default {
        data() {
            return {
                formData: {
                    "permission_id": "",
                    "permission_name": "",
                    "comment": ""
                },
                rules: {
                    ...getValidator(["permission_id", "permission_name", "comment"])
                }
            }
        },
        onLoad(e) {
            const id = e.id
            this.formDataId = id
            this.getDetail(id)
        },
        methods: {
            /**
             * 触发表单提交
             */
            submitForm(form) {
                this.$refs.form.submit();
            },

            /**
             * 表单提交
             * @param {Object} event 回调参数 Function(callback:{value,errors})
             */
            submit(event) {
                const {
                    value,
                    errors
                } = event.detail

                // 表单校验失败页面会提示报错 ，要停止表单提交逻辑
                if (errors) {
                    return
                }

                uni.showLoading({
                    title: '修改中...',
                    mask: true
                })

                // 使用 uni-clientDB 提交数据
                db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
                    uni.showToast({
                        title: '修改成功'
                    })
                    this.getOpenerEventChannel().emit('refreshData')
                    setTimeout(() => uni.navigateBack(), 500)
                }).catch((err) => {
                    uni.showModal({
                        content: err.message || '请求服务失败',
                        showCancel: false
                    })
                }).finally(() => {
                    uni.hideLoading()
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
                db.collection(dbCollectionName).where({
                    _id: id
                }).get().then((res) => {
                    const data = res.result.data[0]
                    if (data) {
                        Object.keys(this.formData).forEach(name => {
                            this.binddata(name, data[name])
                        })
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
