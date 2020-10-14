<template>
    <view>
        <view class="m-b-30">
            {{title}}
        </view>
        <uni-forms ref="form" :form-rules="rules" class="uni-forms">
            <uni-field label="角色id" :label-width="100" :inputBorder="true" :border-bottom="false" name="roleID" v-model="role.roleID"
                :disabled="isEdit" :clearable="!isEdit" placeholder="请填写角色id" />
            <uni-field label="角色名称" :label-width="100" :inputBorder="true" :border-bottom="false" name="roleName"
                v-model="role.roleName" placeholder="请填写角色名称" />
            <uni-field label="备注" :labelWidth="100" :inputBorder="true" :border-bottom="false" v-model="role.comment"
                type="textarea" placeholder="请填写备注" />
            <permissions ref="permissions" label="权限配置" :label-width="150" :permissions="permissions" />
            <view class="m-b-30">
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
                permissions: [],
                role: {
                    roleID: '',
                    roleName: '',
                    comment: '',
                    permission: []
                },
                rules: {
                    roleID: {
                        rules: [{
                            required: true,
                            errorMessage: '请输入角色id',
                            trigger: 'blur'
                        }]
                    },
                    roleName: {
                        rules: [{
                            required: true,
                            errorMessage: '请输入角色名称',
                            trigger: 'blur'
                        }]
                    }
                }
            }
        },
        computed: {
            title() {
                return this.isEdit ? '编辑角色' : '新增角色'
            }
        },
        mounted() {
        },
        onLoad(options) {
            if (options.role) {
                this.role = JSON.parse(options.role)
                this.getRole(this.role.roleID)
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
                this.role.permission = this.$refs.permissions.getValues()
                this.$request('base/role/' + (this.isEdit ? 'update' : 'add'), this.role).then(res => {
                    uni.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false
                    });
                })
            },
            back() {
                uni.navigateBack()
            },
            async getRole(id) {
               await this.$request('base/role/getRole', {
                    roleID: id
                }).then(res => {
                    this.role = {
                        roleID: res.role_id,
                        roleName: res.role_name,
                        comment: res.comment,
                        permission: res.permission
                    }
                })
                this.getPermissions()
            },
            getPermissions() {
                this.$request('base/permission/getList', {
                    limit: 10000,
                    offset: 0
                }).then(res => {
                    const permissionIds = this.role.permission
                    this.permissions = res.permissionList.map(item => {
                        if (permissionIds.indexOf(item.permission_id) !== -1) {
                            item.checked = true
                        }
                        return item
                    })
                })
            },
        }
    }
</script>


<style>
    page {
        background-color: #fff;
        padding: 20px;
    }

    .uni-forms {
        /* max-width: 600px; */
    }

    .uni-forms button {
        width: 70px;
        margin: 0;
        margin-right: 20px;
    }
</style>
