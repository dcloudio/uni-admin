<template>
    <view class="container">
        <view class="flex-c-between m-b-30">
            <text>角色</text>
            <button class="button" @click="add" size="mini" type="default" style="margin: 0;">新增</button>
        </view>
        <uni-table border stripe>
            <uni-tr>
                <uni-th width="100" align="center">角色id</uni-th>
                <uni-th width="100" align="center">角色名称</uni-th>
                <uni-th width="100" align="center">备注</uni-th>
                <uni-th width="100" align="center">创建时间</uni-th>
                <uni-th width="100" align="center">设置</uni-th>
            </uni-tr>
            <uni-tr v-for="(item ,index) in roleList" :key="index">
                <uni-td>{{item.role_id}}</uni-td>
                <uni-td>
                    <view class="name">{{item.role_name}}</view>
                </uni-td>
                <uni-td>{{item.comment}}</uni-td>
                <uni-td>{{item.create_date}}</uni-td>
                <uni-td>
                    <view class="flex-cc">
                        <button class="button" size="mini" :plain="true" type="default" @click="edit(item)" style="margin-right: 10px;">编辑</button>
                        <button class="button" size="mini" :plain="true"  type="warn" @click="deleteRole(item.role_id)">删除</button>
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
                roleList: [],
            }
        },
        onShow(){
            this.getRoleList()
        },
        methods: {
            getRoleList(){
                this.$request('base/role/getList', {
                    limit: 10000,
                    offset: 0,
                    needTotal: true
                }).then(res => {
                    console.log(res)
                    this.roleList = res.roleList
                })
            },
            add(){
                uni.navigateTo({
                    url: './edit'
                })
            },
            edit(item){
                uni.navigateTo({
                    url: `./edit?roleID=${item.role_id}&roleName=${item.role_name}&comment=${item.comment}`
                })
            },
            async deleteRole(id){
                await this.$request('base/role/deleteRole', {roleID: id})
                this.getRoleList()
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
