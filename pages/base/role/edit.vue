<template>
	<view>
        <view class="m-b-30">
            编辑角色
        </view>
        <uni-forms ref="form" :form-rules="rules" class="uni-forms">
            <uni-field class="m-b-30" label="角色id" name="roleID" v-model="role.roleID" placeholder="请填写角色id" />
            <uni-field class="m-b-30" label="角色名称" name="roleName" v-model="role.roleName" placeholder="请填写角色名称" />
            <uni-field class="m-b-30" label="备注" v-model="role.comment" type="textarea" placeholder="请填写备注" />
            <button form-type="submit" type="primary" size="mini" @click="submit">编辑</button>
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
                            },
                            {
                                minLength: 2,
                                maxLength: 30,
                                errorMessage: '角色名称长度在{minLength}到{maxLength}个字符',
                                trigger: 'change'
                            }
                        ]
                    },
                    roleName: {
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
		methods: {
            async submit(){
                await this.$http('role/add', this.role)
            }
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
