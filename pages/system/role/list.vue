
<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <view class="uni-title"></view>
        <view class="uni-sub-title"></view>
      </view>
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" placeholder="请输入搜索内容" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
        <button class="uni-button" type="default" size="mini" @click="delTable">批量删除</button>
      </view>
    </view>
    <view class="uni-container">
      <uni-clientdb ref="udb" :collection="collectionName" :options="options" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error}">
        <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
              <uni-th align="center">角色Id</uni-th>  <uni-th align="center">角色名</uni-th>  <uni-th align="center">备注</uni-th>  
            <uni-th width="204" align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
               <uni-td align="center">{{item.role_id}}</uni-td>    <uni-td align="center">{{item.role_name}}</uni-td>    <uni-td align="center">{{item.comment}}</uni-td>   
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id='+item._id)" class="uni-button" size="mini" type="primary">修改</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count"
            @change="onPageChanged" />
        </view>
      </uni-clientdb>
    </view>
  </view>
</template>

<script>
  const db = uniCloud.database()
  // 表查询配置
  const dbCollectionName = 'uni-id-roles'
  const dbOrderBy = '' // 排序字段
  const dbSearchFields = [] // 支持模糊搜索的字段列表
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
        const queryRe = new RegExp(query, 'i')
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
        this.$refs.udb.loadData({
          clear
        })
      },
      onPageChanged(e) {
        this.$refs.udb.loadData({
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
      // 多选处理
      selectedItems() {
        var dataList = this.$refs.udb.dataList
        return this.selectedIndexs.map(i => dataList[i]._id)
      },
      //批量删除
      delTable() {
        this.$refs.udb.remove(this.selectedItems())
      },
      // 多选
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id)
      }
    }
  }
</script>
<style>
</style>

