<template>
    <view>
        <view class="m-b-30">
            {{title}}
        </view>
        <uni-forms ref="form" :form-rules="rules" class="uni-forms">
            <uni-field :disabled="isEdit" :clearable="!isEdit" label="角色id" name="roleID" v-model="role.roleID"
                placeholder="请填写角色id" />
            <uni-field label="角色名称" name="roleName" v-model="role.roleName" placeholder="请填写角色名称" />
            <uni-field label="备注" v-model="role.comment" type="textarea" placeholder="请填写备注" />
            <view class="m-t-10 m-b-30">
                <view v-if="isEdit" class="tips">* 编辑时不能修改角色id</view>
            </view>
            <button form-type="submit" type="primary" size="mini" @click="save">保存</button>
            <button type="default" size="mini" @click="back">返回</button>
        </uni-forms>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                role: {
                    roleID: '',
                    roleName: '',
                    comment: '',
                },
                rules: {
                    roleID: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入角色id',
                                trigger: 'blur'
                            }
                        ]
                    },
                    roleName: {
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
                return this.isEdit ? '编辑角色' : '新增角色'
            }
        },
        onLoad(option) {
            if (option.roleID) {
                this.role = {
                    roleID: option.roleID,
                    roleName: option.roleName,
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
            save() {
                this.$request('base/role/' + (this.isEdit ? 'update' : 'add'), this.role)
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
        width: 70px;
        margin: 0;
        margin-right: 20px;
    }
</style>
