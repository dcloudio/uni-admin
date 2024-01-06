<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <view class="uni-title"></view>
        <view class="uni-sub-title"></view>
      </view>
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button v-if="hasPermission('CREATE_UNI_CMS_CATEGORIES')" class="uni-button" type="primary" size="mini" @click="navigateTo('../add/add')">新增</button>
        <button v-if="hasPermission('DELETE_UNI_CMS_CATEGORIES')" class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db ref="udb" :collection="collectionList" field="name,description,icon,sort,article_count,create_date" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'name')" sortable @sort-change="sortChange($event, 'name')">名称</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'description')" sortable @sort-change="sortChange($event, 'description')">描述</uni-th>
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'sort')" sortable @sort-change="sortChange($event, 'sort')">排序</uni-th>
<!--            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'article_count')" sortable @sort-change="sortChange($event, 'article_count')">article_count</uni-th>-->
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')" sortable @sort-change="sortChange($event, 'create_date')">创建时间</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
            <uni-td align="center">{{item.name}}</uni-td>
            <uni-td align="center">{{item.description}}</uni-td>
            <uni-td align="center">{{item.sort}}</uni-td>
<!--            <uni-td align="center">{{item.article_count}}</uni-td>-->
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button v-if="hasPermission('UPDATE_UNI_CMS_CATEGORIES')" @click="navigateTo('../edit/edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
                <button v-if="hasPermission('DELETE_UNI_CMS_CATEGORIES')" @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>
  </view>
</template>

<script>
  import { enumConverter, filterToWhere } from '@/uni_modules/uni-cms/common/validator/uni-cms-categories.js';
  import authMixin from "@/uni_modules/uni-cms/common/auth-mixin";

  const db = uniCloud.database()
  // 表查询配置
   // 排序字段
  const dbOrderBy = ''
   // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  const dbSearchFields = ['name']
  // 分页配置
  const pageSize = 20
  const pageCurrent = 1

  const orderByMapping = {
    "ascending": "asc",
    "descending": "desc"
  }

  export default {
    mixins: [authMixin],
    data() {
      return {
        collectionList: "uni-cms-categories",
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: "",
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {},
          ...enumConverter
        },
        imageStyles: {
          width: 64,
          height: 64
        },
        exportExcel: {
          "filename": "uni-cms-categories.xls",
          "type": "xls",
          "fields": {
            "名称": "name",
            "描述": "description",
            "图标地址": "icon",
            "排序": "sort",
            "文章数量": "article_count",
            "创建时间": "create_date"
          }
        },
        exportExcelData: []
      }
    },
    onLoad() {
      this._filter = {}
    },
    onReady() {
      this.$refs.udb.loadData()
    },
methods: {
      // 当数据加载完成时，将数据赋值给 exportExcelData
      onqueryload(data) {
        this.exportExcelData = data
      },
      // 获取查询条件
      getWhere() {
        const query = this.query.trim()
        if (!query) {
          return ''
        }
        const queryRe = new RegExp(query, 'i')
        // 将查询条件转换为正则表达式
        return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
      },
      // 执行搜索操作
      search() {
        const newWhere = this.getWhere()
        this.where = newWhere
        this.$nextTick(() => {
          this.loadData()
        })
      },
      // 加载数据
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear
        })
      },
      // 当页码改变时，清空选中项并重新加载数据
      onPageChanged(e) {
        this.selectedIndexs.length = 0
        this.$refs.table.clearSelection()
        this.$refs.udb.loadData({
          current: e.current
        })
      },
      // 跳转到指定页面
      navigateTo(url, clear) {
        // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
        uni.navigateTo({
          url,
          events: {
            // 监听 refreshData 事件，当页面返回时刷新数据
            refreshData: () => {
              this.loadData(clear)
            }
          }
        })
      },
      // 获取选中项的 ID
      selectedItems() {
        var dataList = this.$refs.udb.dataList
        return this.selectedIndexs.map(i => dataList[i]._id)
      },
      // 批量删除
      delTable() {
        this.$refs.udb.remove(this.selectedItems(), {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      // 选中项改变时更新 selectedIndexs 数组
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      // 确认删除
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      // 排序改变时更新 orderByFieldName 和 orderby
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order]
        } else {
          this.orderby = ''
        }
        this.$refs.table.clearSelection()
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      },
      // 筛选改变时更新 _filter 和 where
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter
        }

        // range 类型的筛选，如果输入的值不是数字，则不进行筛选
        const {type, value} = this._filter[name]
        if (type === 'range') {
          for (const val of value) {
            if (typeof val === "number" && isNaN(val)) return
          }
        }

        let newWhere = filterToWhere(this._filter, db.command)
        if (Object.keys(newWhere).length) {
          this.where = newWhere
        } else {
          this.where = ''
        }
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      }
    }

  }
</script>

<style>
</style>
