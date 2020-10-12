<template>
    <view class="container">
        <uni-table border stripe>
            <uni-table-tr>
                <uni-table-th width="100" align="center">日期</uni-table-th>
                <uni-table-th width="100" align="center">姓名</uni-table-th>
                <uni-table-th width="500" align="center">地址</uni-table-th>
                <uni-table-th width="100" align="center">设置</uni-table-th>
            </uni-table-tr>
            <uni-table-tr v-for="(item ,index) in tableData" :key="index">
                <uni-table-td>{{item.date}}</uni-table-td>
                <uni-table-td>
                    <view class="name">{{item.name}}</view>
                </uni-table-td>
                <uni-table-td>{{item.address}}</uni-table-td>
                <uni-table-td>
                    <button type="default">详情</button>
                </uni-table-td>
            </uni-table-tr>
        </uni-table>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                tableData: [{
                    date: '2016-05-02',
                    name: '王小虎1',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-04',
                    name: '王小2',
                    address: '上海市普陀区金沙江路 1517 弄'
                }, {
                    date: '2016-05-01',
                    name: '王小虎3',
                    address: '上海市普陀区金沙江路 1519 弄'
                }, {
                    date: '2016-05-03',
                    name: '王小4',
                    address: '上海市普陀区金沙江路 1516 弄'
                }]
            }
        },
        onLoad() {

        },
        methods: {

        }
    }
</script>

<style>
    .container {
        padding: 10px;
    }

    .name {
        text-decoration: underline;
        color: #ff5a5f;
        cursor: pointer;
    }

    .name:active {
        color: blue;
    }
</style>
