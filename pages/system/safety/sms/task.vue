<template>
    <view>
        <view class="uni-header">
            <uni-stat-breadcrumb />
        </view>
        <view class="uni-container">
            <unicloud-db ref="udb" collection="batch-sms-task" orderby="create_date desc" page-data="replace"
                :getcount="true" :page-size="page.size" :page-current="page.current"
                v-slot:default="{data,pagination,loading,error}">
                <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
                    <uni-tr>
                        <uni-th align="center">序号</uni-th>
                        <uni-th align="center">名称</uni-th>
                        <!-- <uni-th align="center">App ID</uni-th> -->
                        <uni-th align="center">短信模板</uni-th>
                        <uni-th align="center">发送总数</uni-th>
                        <uni-th align="center">成功</uni-th>
                        <uni-th align="center">失败</uni-th>
                        <uni-th align="center">创建时间</uni-th>
                        <uni-th align="center">操作</uni-th>
                    </uni-tr>
                    <uni-tr v-for="(item,index) in data" :key="index">
                        <uni-td align="center">{{(pagination.current -1)*pagination.size + (index+1)}}</uni-td>
                        <uni-td align="center">{{item.name}}</uni-td>
                        <!-- <uni-td align="center">{{item.app_id}}</uni-td> -->
                        <uni-td align="center">{{item.template_id}}</uni-td>
                        <uni-td align="center">{{item.send_qty}}</uni-td>
                        <uni-td align="center">{{item.success_qty}}</uni-td>
                        <uni-td align="center">{{item.fail_qty}}</uni-td>
                        <uni-td align="center">
                            <uni-dateformat :date="item.create_date" :threshold="[0, 0]" />
                        </uni-td>
                        <uni-td align="center">
                            <view class="uni-group">
                                <button @click="navigateTo('./record?id=' + item._id)" class="uni-button"
                                    size="mini" type="primary">发送记录</button>
                            </view>
                        </uni-td>
                    </uni-tr>
                </uni-table>
                <view class="uni-pagination-box">
                    <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current"
                        :total="pagination.count" @change="onPageChanged" />
                </view>
            </unicloud-db>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            page: {
                size: 20,
                current: 1
            }
        }
    },
    methods: {
        navigateTo(url) {
            uni.navigateTo({
                url
            })
        },
        onPageChanged(e) {
            this.$refs.udb.loadData({
                current: e.current
            })
        }
    }
}
</script>