<template>
    <view>
        <view class="uni-header">
            <view class="uni-group">
                <view class="uni-title">权限管理</view>
                <view class="uni-sub-title"></view>
            </view>
            <view class="uni-group">
                <input class="uni-search" type="text" v-model="query" placeholder="权限标识/名称" />
                <button class="uni-button" type="default" @click="search">搜索</button>
                <button @click="navigateTo('./add')" class="uni-button" type="default">新增</button>
            </view>
        </view>
        <view class="uni-container">
            <uni-clientdb ref="dataQuery" :collection="collectionName" :options="options" :where="where" page-data="replace"
                :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
                v-slot:default="{data,pagination,loading,error}">
                <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
                    <uni-tr>
                        <uni-th width="250" align="center">标识</uni-th>
                        <uni-th width="150" align="center">名称</uni-th>
                        <uni-th align="center">备注</uni-th>
                        <uni-th width="170" align="center">创建时间</uni-th>
                        <uni-th width="160" align="center">操作</uni-th>
                    </uni-tr>
                    <uni-tr v-for="(item,index) in data" :key="index">
                        <uni-td align="center">{{item.permission_id}}</uni-td>
                        <uni-td align="center">{{item.permission_name}}</uni-td>
                        <uni-td align="center">{{item.comment}}</uni-td>
                        <uni-td align="center">
                            <uni-dateformat :date="item.create_date" :threshold="[0, 0]" />
                        </uni-td>
                        <uni-td align="center">
                            <view class="uni-group">
                                <button size="mini" @click="navigateTo('./edit?id='+item._id)" class="uni-button" type="primary">修改</button>
                                <button size="mini" @click="confirmDelete(item._id)" class="uni-button" type="warn">删除</button>
                            </view>
                        </uni-td>
                    </uni-tr>
                </uni-table>
                <view class="uni-pagination-box">
                    <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.total"
                        @change="onPageChanged" />
                </view>
            </uni-clientdb>
        </view>
    </view>
</template>

<script>
    const db = uniCloud.database()
    // 表查询配置
    const dbCollectionName = 'uni-id-permissions'
    const dbOrderBy = 'create_date desc'
    const dbSearchFields = ['permission_id', 'permission_name'] // 支持模糊搜索的字段列表
    // 分页配置
    const pageSize = 20
    const pageCurrent = 1

    export default {
        data() {
            return {
                query: '',
                where: '',
                orderby: dbOrderBy,
                collectionName: dbCollectionName,
                options: {
                    pageSize,
                    pageCurrent
                }
            }
        },
        methods: {
            getWhere() {
                const query = this.query.trim()
                if (!query) {
                    return ''
                }
                const queryRe = `/${query}/i`
                return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
            },
            search() {
                const newWhere = this.getWhere()
                const isSameWhere = newWhere === this.where
                this.where = newWhere
                if (isSameWhere) { // 相同条件时，手动强制刷新
                    this.loadData()
                }
            },
            loadData(clear = true) {
                this.$refs.dataQuery.loadData({
                    clear
                })
            },
            onPageChanged(e) {
                this.$refs.dataQuery.loadData({
                    current: e.current
                })
            },
            navigateTo(url) {
                uni.navigateTo({
                    url,
                    events: {
                        refreshData: () => {
                            this.loadData()
                        }
                    }
                })
            },
            confirmDelete(id) {
                uni.showModal({
                    title: '提示',
                    content: '确认删除该记录？',
                    success: (res) => {
                        res.confirm && this.delete(id)
                    }
                })
            },
            async delete(id) {
                uni.showLoading({
                    mask: true
                })
                try {
                    await db.collection(this.collectionName).doc(id).remove()
                } catch (e) {
                    uni.showModal({
                        title: '提示',
                        content: e.message
                    })
                }
                uni.hideLoading()
                this.loadData(false)
            }
        }
    }
</script>
<style>
</style>
