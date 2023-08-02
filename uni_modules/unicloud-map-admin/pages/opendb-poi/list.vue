<template>
  <view>
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="支持根据名称、地址、电话模糊搜索" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
        <button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db ref="udb" :collection="collectionList" field="visible,location,title,tel,category,type,icon,rotate, level,address,province,city,district,create_date" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'category')" sortable @sort-change="sortChange($event, 'category')">分类</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'type')" sortable @sort-change="sortChange($event, 'type')">类型</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'title')" sortable @sort-change="sortChange($event, 'title')">名称</uni-th>
            <uni-th align="center">图标</uni-th>
						<uni-th align="center">经纬度（latitude,longitude）</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'address')" sortable @sort-change="sortChange($event, 'address')">地址</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'tel')" sortable @sort-change="sortChange($event, 'tel')">电话</uni-th>
            <!-- <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'province')" sortable @sort-change="sortChange($event, 'province')">省</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'city')" sortable @sort-change="sortChange($event, 'city')">市</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'district')" sortable @sort-change="sortChange($event, 'district')">区/县</uni-th> -->
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')" sortable @sort-change="sortChange($event, 'create_date')">创建时间</uni-th>
						 <uni-th align="center" sortable @sort-change="sortChange($event, 'visible')">是否显示</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center">{{item.category}}</uni-td>
						<uni-td align="center">{{item.type}}</uni-td>
            <uni-td align="center">{{item.title}}</uni-td>
            <uni-td align="center">
							<!-- 当设置的本地图标在admin内不存在时，显示自定义图标，当存在时，直接显示图片 -->
							<text v-if="item.iconError">自定义图标</text>
							<image :src="item.icon" v-else-if="item.icon" style="width: 40px;height: 40px;" mode="aspectFit" @error="iconError(item)" @load="iconLoad(item)"></image>
							<text v-else>默认图标</text>
						</uni-td>
						<uni-td align="center"><text v-if="item.location && item.location.coordinates && item.location.coordinates.length === 2">{{item.location.coordinates[1] +","+ item.location.coordinates[0]}}</text></uni-td>
            <uni-td align="center">{{item.address}}</uni-td>
						<uni-td align="center">{{item.tel}}</uni-td>
           <!-- <uni-td align="center">{{item.province}}</uni-td>
            <uni-td align="center">{{item.city}}</uni-td>
            <uni-td align="center">{{item.district}}</uni-td> -->
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
            </uni-td>
						<uni-td align="center">
							<switch :checked="item.visible" @change="visibleChange(item)" />
							<!-- <text @click="visibleChange(item)">{{item.visible == true ? '✅' : '❌'}}</text> -->
						</uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
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
  import { enumConverter, filterToWhere } from '@/uni_modules/unicloud-map-admin/validator/opendb-poi.js';

  const db = uniCloud.database()
  // 表查询配置
  const dbOrderBy = '' // 排序字段
  const dbSearchFields = ['title','address','tel'] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20
  const pageCurrent = 1

  const orderByMapping = {
    "ascending": "asc",
    "descending": "desc"
  }

  export default {
    data() {
      return {
        collectionList: "opendb-poi",
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
          "filename": "opendb-poi.xls",
          "type": "xls",
          "fields": {
            "地理位置": "location",
            "名称": "title",
            "电话": "tel",
            "图标": "icon",
            "地址": "address",
						"分类": "category",
						"类型": "type",
            "创建时间": "create_date",
						"是否显示": "visible"
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
      onqueryload(data) {
        this.exportExcelData = data
      },
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
        this.where = newWhere
        this.$nextTick(() => {
          this.loadData()
        })
      },
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear
        })
      },
      onPageChanged(e) {
        this.selectedIndexs.length = 0
        this.$refs.table.clearSelection()
        this.$refs.udb.loadData({
          current: e.current
        })
      },
      navigateTo(url, clear) {
        // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
        uni.navigateTo({
          url,
          events: {
            refreshData: () => {
              this.loadData(clear)
            }
          }
        })
      },
      // 多选处理
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
      // 多选
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
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
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter
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
      },
			visibleChange(item){
				let visible = !item.visible;
				db.collection("opendb-poi").doc(item._id).update({
					visible
				}).then((res)=>{
					if (res.result.updated){
						item.visible = visible;
					}
				})
			},
			iconError(item){
				this.$set(item,"iconError", true);
				//item.iconError = true;
			},
			iconLoad(item){
				this.$set(item,"iconError", false);
				//item.iconError = true;
			},
    }
  }
</script>

<style>
</style>
