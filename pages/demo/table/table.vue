<template>
    <view class="container">
        <view class="header">
            <view class="header-button">
                <button class="button" type="default" @click="add">新增</button>
            </view>
            <view class="search">
                <input class="input-class" type="text" v-model="searchVal" placeholder="请输入搜索内容" />
                <button class="button" type="default" @click="search">搜索</button>
            </view>
        </view>
        <uni-table border stripe type="selection" @selection-change="selectionChange">
            <uni-tr>
                <uni-th width="100" align="center">日期</uni-th>
                <uni-th width="100" align="center">姓名</uni-th>
                <uni-th align="center">地址</uni-th>
                <uni-th width="160" align="center">设置</uni-th>
            </uni-tr>
            <template v-if="!loading && tableData.length > 0 ">
                <uni-tr v-for="(item ,index) in tableData" :key="index">
                    <uni-td>{{item.date}}</uni-td>
                    <uni-td>
                        <view class="name">{{item.name}}</view>
                    </uni-td>
                    <uni-td>{{item.address}}</uni-td>
                    <uni-td>
                        <view class="button-box">
                            <button class="button" type="primary">修改</button>
                            <button class="button" type="warn">删除</button>
                        </view>
                    </uni-td>
                </uni-tr>
            </template>
            <view v-else class="loading">
                <text v-if="!loading && tableData.length === 0" class="text">没有更多数据</text>
                <text v-else class="text">loading...</text>
            </view>
        </uni-table>
        <view class="pagination-box">
            <uni-pagination class="pagination" show-icon :page-size="pageSize" :current.sync="current" :total="total"
                @change="change" />
        </view>
    </view>
</template>

<script>
    import tableData from './tableData.js'
    export default {
        data() {
            return {
                searchVal: '',
                tableData: [],
                // 每页数据量
                pageSize: 10,
                // 当前页
                current: 1,
                // 数据总量
                total: 0,
                loading: true
            }
        },
        computed: {
            selectedItems() {
                return this.selectedIndexs.map(i => tableData[i])
            }
        },
        onLoad() {
            this.serachData = tableData
            this.loading = true
            setTimeout(() => {
                this.loading = false
                this.getData()
            }, 1000)
        },
        methods: {
            add(){
                this.$refs.popup.open()
            },
            selectionChange(e) {
                console.log(e.detail);
            },
            change(e) {
                this.tableData = this.serachData.filter((item, index) => {
                    const idx = index - (e.current - 1) * this.pageSize
                    return idx < this.pageSize && idx >= 0
                })
            },
            search() {
                this.serachData = []
                this.current = 1
                tableData.forEach(item => {
                    if (item.name.indexOf(this.searchVal) !== -1) {
                        this.serachData.push(item)
                    }
                })
                this.getData()
            },
            getData() {
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
    .header {
        display: flex;
        justify-content: space-between;
        margin: 15px 0;
    }
    .header-button {
        display: flex;
    }
    .search {
        display: flex;
        justify-content: flex-end;
        align-items: center;
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

    .loading {
        position: relative;
        display: table-row;
        height: 50px;
        line-height: 50px;
    }

    .text {
        position: absolute;
        right: 0;
        left: 50%;
    }
</style>
