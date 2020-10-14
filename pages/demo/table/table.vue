<template>
    <view>
        <view class="uni-header uni-header-between">
            <view class="uni-button-group">
                <view class="uni-title">表格</view>
                <view class="uni-sub-title">高级表格内容，如多选、搜索等</view>
            </view>
            <view class="uni-button-group">
                <input class="uni-search" type="text" v-model="searchVal" placeholder="请输入搜索内容" />
                <button class="uni-button" type="default" @click="search">搜索</button>
                <button class="uni-button" type="default" @click="add">新增</button>
                <button class="uni-button" type="default" @click="add">导出表格</button>
            </view>
        </view>
        <view class="container">
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
                            <view class="uni-button-group">
                                <button class="uni-button" type="primary">修改</button>
                                <button class="uni-button" type="warn">删除</button>
                            </view>
                        </uni-td>
                    </uni-tr>
                </template>
                <view v-else class="uni-table-loading">
                    <text v-if="!loading && tableData.length === 0" class="uni-table-text">没有更多数据</text>
                    <text v-else class="uni-table-text">loading...</text>
                </view>
            </uni-table>
            <view class="uni-pagination-box">
                <uni-pagination show-icon :page-size="pageSize" :current.sync="current" :total="total" @change="change" />
            </view>
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
            add() {
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

</style>
