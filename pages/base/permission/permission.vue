<template>
    <view class="container">
        <view class="flex-c-between m-b-30">
            <text>权限</text>
            <button class="button" @click="add" size="mini" type="default" style="margin: 0;">新增</button>
        </view>
        <uni-table border stripe>
            <uni-tr>
                <uni-th width="100" align="center">权限id</uni-th>
                <uni-th width="100" align="center">权限名称</uni-th>
                <uni-th width="100" align="center">备注</uni-th>
                <uni-th width="100" align="center">创建时间</uni-th>
                <uni-th width="100" align="center">设置</uni-th>
            </uni-tr>
            <uni-tr v-for="(item ,index) in permissionList" :key="index">
                <uni-td>{{item.permission_id}}</uni-td>
                <uni-td>
                    <view class="name">{{item.permission_name}}</view>
                </uni-td>
                <uni-td>{{item.comment}}</uni-td>
                <uni-td>{{item.create_date}}</uni-td>
                <uni-td>
                    <view class="flex-cc">
                        <button class="button" size="mini" :plain="true" type="default" @click="edit(item)" style="margin-right: 10px;">编辑</button>
                        <button class="button" size="mini" :plain="true"  type="warn" @click="remove(item.permission_id)">删除</button>
                    </view>
                </uni-td>
            </uni-tr>
        </uni-table>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                permissionList: [],
            }
        },
        onShow(){
            this.getPermissionList()
        },
        methods: {
            getPermissionList(){
                this.$request('base/permission/getList', {
                    limit: 10000,
                    offset: 0,
                    needTotal: true
                }).then(res => {
                    console.log(res)
                    this.permissionList = res.permissionList
                })
            },
            add(){
                uni.navigateTo({
                    url: './edit'
                })
            },
            edit(item){
                uni.navigateTo({
                    url: `./edit?permissionID=${item.permission_id}&permissionName=${item.permission_name}&comment=${item.comment}`
                })
            },
            async deletePermission(id){
                await this.$request('base/permission/deletePermission', {permissionID: id})
                this.getPermissionList()
            },
            remove(id) {
                const that = this
                uni.showModal({
                    title: '提示',
                    content: '确认删除该权限？',
                    success: function (res) {
                        if (res.confirm) {
                            that.deletePermission(id)
                        }
                    }
                })
            }
        }
    }
</script>

<style>
    .container {
        padding: 20px;
    }

    .pagination-box {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
    button {
        margin: 0;
    }
</style>
