<template>
	<view>
        <view class="m-b-30">
            {{isEdit ? '编辑权限' : '新增权限'}}
        </view>
        <uni-forms ref="form" :form-rules="rules" class="uni-forms">
            <uni-field :disabled="isEdit" :clearable="!isEdit" label="权限id" name="permissionID" v-model="permission.permissionID" placeholder="请填写权限id" />
            <uni-field label="权限名称" name="permissionName" v-model="permission.permissionName" placeholder="请填写权限名称" />
            <uni-field label="备注" v-model="permission.comment" type="textarea" placeholder="请填写备注" />
            <view class="m-t-10 m-b-30">
                <view v-if="isEdit" class="tips">* 编辑时不能修改权限id</view>
            </view>
            <button v-if="!isEdit" form-type="submit" type="primary" size="mini" @click="add">保存</button>
            <button v-if="isEdit" form-type="submit" type="primary" size="mini" @click="update">确定</button>
            <button type="primary" size="mini" @click="back">返回</button>
        </uni-forms>
	</view>
</template>

<script>
	export default {
		data() {
			return {
                permission: {
                    permissionID: '',
                    permissionName: '',
                    comment: '',
                },
                isEdit: false,
                rules: {
                    permissionID: {
                        rules: [{
                                required: true,
                                errorMessage: '请输入权限id',
                                trigger: 'blur'
                            },
                            {
                                minLength: 2,
                                maxLength: 30,
                                errorMessage: '权限名称长度在{minLength}到{maxLength}个字符',
                                trigger: 'change'
                            }
                        ]
                    },
                    permissionName: {
                        rules: [{
                                errorMessage: '请输入备注',
                                trigger: 'blur'
                            },
                            {
                                minLength: 3,
                                maxLength: 30,
                                errorMessage: '备注长度在{minLength}到{maxLength}个字符',
                                trigger: 'change'
                            }
                        ]
                    }
                }
			}
		},
        onLoad(option){
            if (Object.keys(option).length !== 0) {
                this.permission = {
                    permissionID: option.permissionID,
                    permissionName: option.permissionName,
                    comment: option.comment,
                }
                this.isEdit = true
            } else {
                this.isEdit = false
            }
        },
		methods: {
            async add(){
                await this.$request('base/permission/add', this.permission)
            },
            async update(){
                await this.$request('base/permission/update', this.permission)
            },
            back(){
                uni.navigateBack({

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
    .uni-forms button {
        width: 70px;
        margin: 0;
        margin-right: 20px;
    }
</style>
