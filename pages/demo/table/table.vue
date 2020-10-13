<template>
    <view class="container">
        <view class="search">
            <input class="input-class" type="text" v-model="searchVal" placeholder="请输入搜索内容"/>
            <button class="button" type="default" @click="search">搜索</button>
        </view>
        <uni-table border stripe>
            <uni-tr>
                <uni-th width="100" align="center">日期</uni-th>
                <uni-th width="100" align="center">姓名</uni-th>
                <uni-th width="500" align="center">地址</uni-th>
                <uni-th width="160" align="center">设置</uni-th>
            </uni-tr>
            <uni-tr v-for="(item ,index) in tableData" :key="index">
                <uni-td>{{item.date}}</uni-td>
                <uni-td>
                    <view class="name">{{item.name}}</view>
                </uni-td>
                <uni-td>{{item.address}}</uni-td>
                <uni-td>
                   <view class="button-box">
                       <button class="button" type="primary">详情</button>
                       <button class="button" type="warn">删除</button>
                   </view>
                </uni-td>
            </uni-tr>
        </uni-table>
        <view class="pagination-box">
            <uni-pagination class="pagination" show-icon :page-size="pageSize" :current.sync="current" :total="total" @change="change" />
        </view>
    </view>
</template>

<script>
    import tableData from './tableData.js'
    export default {
        data() {
            return {
                searchVal:'',
                tableData: [],
                // 每页数据量
                pageSize:10,
                // 当前页
                current:1,
                // 数据总量
                total:0
            }
        },
        onLoad() {
            this.serachData = tableData
            this.getData()
        },
        methods: {
            change(e){
                this.tableData = this.serachData.filter((item, index) => {
                    const idx  = index - (e.current-1)*this.pageSize
                    return idx < this.pageSize && idx >= 0
                })
            },
            search(){
                this.serachData = []
                this.current = 1
                tableData.forEach(item=>{
                    if(item.name.indexOf(this.searchVal) !== -1){
                        this.serachData.push(item)
                    }
                })
                this.getData()
            },
            getData(){
                this.tableData = this.serachData.filter((item, index) => index < this.pageSize)
                this.total = this.serachData.length
            }
        }
    }
</script>

<style>
    .container {
        padding: 10px;
    }

    .search {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 15px;
        /* border: 1px red solid; */
    }
    .button-box {
        display: flex;
        justify-content: center;
    }
    .button {
        margin: 0;
        width: 80px;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        margin-right: 5px;
    }
    .button--danger {
        color: #fff;
        background-color: #ff5a5f;
    }
    .input-class {
        /* width: 300px; */
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        padding: 0 10px;
        border: 1px #eee solid;
        margin-right: 15px;
    }
    .pagination-box {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .pagination {
        /* width: 300px; */
    }
</style>
