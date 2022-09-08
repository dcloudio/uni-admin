<template>
    <view>
        <view class="uni-header">
            <uni-stat-breadcrumb />
            <view class="uni-group">
                <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入手机号查询" />
				<button class="uni-button hide-on-phone" type="default" size="mini" @click="search">{{$t('common.button.search')}}</button>
            </view>
        </view>
        <view class="uni-container">
            <unicloud-db ref="udb" collection="batch-sms-result" page-data="replace" :getcount="true"
                :page-size="page.size" :page-current="page.current" :where="where"
                v-slot:default="{data,pagination,loading,error}">
                <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
                    <uni-tr>
                        <uni-th align="center">序号</uni-th>
                        <uni-th align="center">手机号</uni-th>
                        <uni-th align="center">短信内容</uni-th>
                        <uni-th align="center">创建时间</uni-th>
                        <uni-th align="center">发送时间</uni-th>
                        <uni-th align="center">状态</uni-th>
                        <uni-th align="center">原因</uni-th>
                    </uni-tr>
                    <uni-tr v-for="(item,index) in data" :key="index">
                        <uni-td align="center">{{(pagination.current -1)*pagination.size + (index+1)}}</uni-td>
                        <uni-td align="center">{{item.mobile}}</uni-td>
                        <uni-td align="center">{{templateContent(item)}}</uni-td>
                        <uni-td align="center">
                            <uni-dateformat :date="item.create_date" :threshold="[0, 0]" />
                        </uni-td>
                        <uni-td align="center">
                            <uni-dateformat :date="item.send_date" :threshold="[0, 0]" />
                        </uni-td>
                        <uni-td align="center">{{recordStatus[item.status]}}</uni-td>
                        <uni-td align="center">{{item.reason}}</uni-td>
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
const uniSmsCo = uniCloud.importObject('uni-sms-co')
const recordStatus = {
    0: "未发送",
    1: "已发送",
    2: "发送失败"
}
export default {
    data() {
        return {
            taskId: '',
            task: {},
            recordStatus,
            where: '',
            page: {
                size: 20,
                current: 1
            }
        }
    },
    onLoad(e) {
        this.taskId = e.id
        this.where = ``
        this.loadTask()
    },
    computed: {
        
    },
    methods: {
        templateContent (record) {
            const {content} = this.task.template
            if (!content) return

            return content.replace(/\$\{(.*?)\}/g, ($1, param) => {
                console.log(record)
                return record.var_data?.[param] ?? $1
            })
        },
        async loadTask () {
            const task = await uniSmsCo.task(this.taskId)

            if (task) {
                this.task = task
            }
        },
        search () {

        }
    }
}
</script>