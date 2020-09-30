<template>
	<view>
        <view class="flex-c-between m-b-30">
            <view class="">
                角色列表
            </view>
            <button type="primary" size="mini" style="width: 70px; margin: 0;">添加+</button>
        </view>
        <table>
            <thead>
                <tr>
                    <th colspan="1">角色id</th>
                    <th colspan="1">角色名称</th>
                    <th colspan="1">备注</th>
                    <th colspan="1">更新时间</th>
                    <th colspan="1">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="role in roleList" :key="role.role_id">
                    <td>{{role.role_id}}</td>
                    <td>{{role.role_name}}</td>
                    <td>{{role.comment}}</td>
                    <td>{{role.create_date}}</td>
                    <td>
                        <button type="default" size="mini" @click="edit">编辑</button>
                        <button type="default" size="mini">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>
	</view>
</template>

<script>
	export default {
		data() {
			return {
                roleList: []
			}
		},
        mounted() {
            this.getRoleList()
        },
		methods: {
            async getRoleList(){
                await this.$http('roleList/getList', {
                    limit: 10000,
                    offset: 0,
                    needTotal: true
                }).then(res => {
                    console.log(res)
                    this.roleList = res.roleList
                })
            },
            edit(){
                uni.navigateTo({
                    url: './A-0-1'
                })
            }
		}
	}
</script>

<style>
table {
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
}

td {
    border-top: 1px solid #333;
}

thead,
tfoot {
    /* background-color: #333; */
    color: #333;
}
</style>
