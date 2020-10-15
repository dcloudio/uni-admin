<template>
    <view>
        <view class="m-b-30">
            {{title}}
        </view>
        <uni-forms ref="form" :form-rules="rules" class="uni-forms">
            <uni-field :disabled="isEdit" :clearable="!isEdit" :required="true"  label="权限id" name="permissionID" v-model="permission.permissionID"
                placeholder="请填写权限id" />
            <uni-field :required="true" label="权限名称" name="permissionName" v-model="permission.permissionName" placeholder="请填写权限名称" />
            <uni-field label="备注" v-model="permission.comment" type="textarea" placeholder="请填写备注" />
            <view class="m-t-10 m-b-30">
                <view v-if="isEdit" class="tips">* 编辑时不能修改权限id</view>
            </view>
            <button type="primary" size="mini" :disabled="isLoading" :loading="isLoading" @click="submitForm">保存</button>
            <button type="default" size="mini" @click="back">返回</button>
        </uni-forms>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                isLoading: false,
                permission: {
                    permissionID: '',
                    permissionName: '',
                    comment: '',
                },
                rules: {
                    permissionID: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入权限id',
                                trigger: 'blur'
                            }
                        ]
                    },
                    permissionName: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入备注',
                                trigger: 'blur'
                            },
                        ]
                    }
                }
            }
        },
        computed: {
            title() {
                return this.isEdit ? '编辑权限' : '新增权限'
            }
        },
        onLoad(option) {
            if (option.permissionID) {
                this.permission = {
                    permissionID: option.permissionID,
                    permissionName: option.permissionName,
                    comment: option.comment,
                }
                this.isEdit = true
            } else {
                this.isEdit = false
            }
            uni.setNavigationBarTitle({
                title: this.title
            })
        },
        methods: {
            submitForm() {
                const {permissionID, permissionName} = this.permission
                if (permissionID && permissionName) {
                    this.save()
                } else {
                    uni.showModal({
                        content: '请填写必填项',
                        showCancel: false
                    })
                }
            },
            save() {
                let that = this
                this.isLoading = true
                this.$request('base/permission/' + (this.isEdit ? 'update' : 'add'), this.permission).then(res => {
                    this.isLoading = false
                    uni.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                that.back()
                            }
                        }
                    });
                })
            },
            back() {
                uni.navigateBack()
            },
        }
    }
</script>


<style>
    page {
        background-color: #fff;
        padding: 20px;
    }

    .uni-forms button {
        margin: 0;
        margin-right: 20px;
    }
</style>
