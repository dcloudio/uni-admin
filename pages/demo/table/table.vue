<template>
    <view class="container">
        <uni-table border stripe>
            <uni-tr>
                <uni-th width="100" align="center">日期</uni-th>
                <uni-th width="100" align="center">姓名</uni-th>
                <uni-th width="500" align="center">地址</uni-th>
                <uni-th width="100" align="center">设置</uni-th>
            </uni-tr>
            <uni-tr v-for="(item ,index) in tableData" :key="index">
                <uni-td>{{item.date}}</uni-td>
                <uni-td>
                    <view class="name">{{item.name}}</view>
                </uni-td>
                <uni-td>{{item.address}}</uni-td>
                <uni-td>
                    <button class="button" type="default">详情</button>
                </uni-td>
            </uni-tr>
        </uni-table>
        <view class="pagination-box">
            <uni-pagination class="pagination" show-icon :page-size="pageSize" :current="current" :total="total" @change="change" />
        </view>
    </view>
</template>

<script>
    import tableData from './tableData.js'
    export default {
        data() {
            return {
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
            this.tableData = tableData.filter((item, index) => index < this.pageSize)
            this.total = tableData.length
        },
        methods: {
            change(e){
                this.tableData = tableData.filter((item, index) => {
                    const idx  = index - (e.current-1)*this.pageSize
                    return idx < this.pageSize && idx >= 0
                })
            }
        }
    }
</script>

<style>
    .container {
        padding: 10px;
    }
    .button {

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
