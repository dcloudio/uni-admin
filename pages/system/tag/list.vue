<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="primary" size="mini" @click="navigateTo('./add')">新增</button>
        <button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
        <button class="uni-button" type="primary" size="mini" @click="batchSmsRef.open()">群发短信</button>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db
        ref="udbRef"
        collection="uni-id-tag"
        field="tagid,name,description,create_date"
        :where="where"
        page-data="replace"
        :orderby="orderby"
        :getcount="true"
        :page-size="options.pageSize"
        :page-current="options.pageCurrent"
        v-slot:default="{ data, pagination, loading, error, options }"
        :options="options"
        loadtime="manual"
        @load="onqueryload"
      >
        <uni-table ref="tableRef" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'tagid')" sortable @sort-change="sortChange($event, 'tagid')">标签的tagid</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'name')" sortable @sort-change="sortChange($event, 'name')">标签名称</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'description')" sortable @sort-change="sortChange($event, 'description')"
              >标签描述</uni-th
            >
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')" sortable @sort-change="sortChange($event, 'create_date')"
              >创建时间</uni-th
            >
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ item.tagid }}</uni-td>
            <uni-td align="center">
              <uni-tag type="primary" inverted size="small" :text="item.name"></uni-tag>
            </uni-td>
            <uni-td align="center">{{ item.description }}</uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('../user/list?tagid=' + item.tagid, false)" class="uni-button" size="mini" type="primary">成员</button>
                <button @click="navigateTo('./edit?id=' + item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination
            show-iconn
            show-page-size
            :page-size="pagination.size"
            v-model="pagination.current"
            :total="pagination.count"
            @change="onPageChanged"
            @pageSizeChange="changeSize"
          />
        </view>
      </unicloud-db>
    </view>

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <batch-sms ref="batchSmsRef" toType="userTags" :receiver="smsReceiver"></batch-sms>
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { enumConverter, filterToWhere } from '@/js_sdk/validator/uni-id-tag.js';
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = ''; // 排序字段
  // 排序字段
  const dbSearchFields = []; // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20;
  const pageCurrent = 1;
  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
  };
  import { computed, nextTick, ref } from 'vue';
  import { onLoad, onReady } from '@dcloudio/uni-app';
  const queryState = ref('');
  const query = queryState;
  const whereState = ref('');
  const where = whereState;
  const orderbyState = ref(dbOrderBy);
  const orderby = orderbyState;
  const orderByFieldNameState = ref('');
  const orderByFieldName = orderByFieldNameState;
  const selectedIndexsState = ref([]);
  const selectedIndexs = selectedIndexsState;
  const optionsState = ref({
    pageSize,
    pageCurrent,
    filterData: {},
    ...enumConverter,
  });
  const options = optionsState;
  const imageStylesState = ref({
    width: 64,
    height: 64,
  });
  const imageStyles = imageStylesState;
  const exportExcelState = ref({
    filename: 'uni-id-tag.xls',
    type: 'xls',
    fields: {
      标签的tagid: 'tagid',
      标签名称: 'name',
      标签描述: 'description',
    },
  });
  const exportExcel = exportExcelState;
  const exportExcelDataState = ref([]);
  const exportExcelData = exportExcelDataState;
  const _filterState = ref(undefined);
  const _filter = _filterState;
  const udbRef = ref(null);
  const tableRef = ref(null);
  const batchSmsRef = ref(null);
  const smsReceiverComputed = computed(() => {
    if (selectedIndexsState.value.length) {
      let dataList = udbRef.value.dataList;
      return selectedIndexsState.value.map((i) => dataList[i].tagid);
    }
  });
  const smsReceiver = smsReceiverComputed;
  const onqueryloadAction = (data) => {
    exportExcelDataState.value = data;
  };
  const onqueryload = onqueryloadAction;
  const changeSizeAction = (pageSize) => {
    optionsState.value.pageSize = pageSize;
    optionsState.value.pageCurrent = 1;
    nextTick(() => {
      loadDataAction();
    });
  };
  const changeSize = changeSizeAction;
  const getWhereAction = () => {
    const query = queryState.value.trim();
    if (!query) {
      return '';
    }
    const queryRe = new RegExp(query, 'i');
    return dbSearchFields.map((name) => queryRe + '.test(' + name + ')').join(' || ');
  };
  const getWhere = getWhereAction;
  const searchAction = () => {
    const newWhere = getWhereAction();
    whereState.value = newWhere;
    nextTick(() => {
      loadDataAction();
    });
  };
  const search = searchAction;
  const loadDataAction = (clear = true) => {
    udbRef.value.loadData({
      clear,
    });
  };
  const loadData = loadDataAction;
  const onPageChangedAction = (e) => {
    selectedIndexsState.value.length = 0;
    tableRef.value.clearSelection();
    udbRef.value.loadData({
      current: e.current,
    });
  };
  const onPageChanged = onPageChangedAction;
  const navigateToAction = (url, clear) => {
    // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
    uni.navigateTo({
      url,
      events: {
        refreshData: () => {
          loadDataAction(clear);
        },
      },
    });
  };
  const navigateTo = navigateToAction;
  const selectedItemsAction = () => {
    let dataList = udbRef.value.dataList;
    return selectedIndexsState.value.map((i) => dataList[i]._id);
  };
  const selectedItems = selectedItemsAction;
  const delTableAction = () => {
    udbRef.value.remove(selectedItemsAction(), {
      success: (res) => {
        tableRef.value.clearSelection();
      },
    });
  };
  const delTable = delTableAction;
  const selectionChangeAction = (e) => {
    selectedIndexsState.value = e.detail.index;
  };
  const selectionChange = selectionChangeAction;
  const confirmDeleteAction = (id) => {
    udbRef.value.remove(id, {
      success: (res) => {
        tableRef.value.clearSelection();
      },
    });
  };
  const confirmDelete = confirmDeleteAction;
  const sortChangeAction = (e, name) => {
    orderByFieldNameState.value = name;
    if (e.order) {
      orderbyState.value = name + ' ' + orderByMapping[e.order];
    } else {
      orderbyState.value = '';
    }
    tableRef.value.clearSelection();
    nextTick(() => {
      udbRef.value.loadData();
    });
  };
  const sortChange = sortChangeAction;
  const filterChangeAction = (e, name) => {
    _filterState.value[name] = {
      type: e.filterType,
      value: e.filter,
    };
    let newWhere = filterToWhere(_filterState.value, db.command);
    if (Object.keys(newWhere).length) {
      whereState.value = newWhere;
    } else {
      whereState.value = '';
    }
    nextTick(() => {
      udbRef.value.loadData();
    });
  };
  const filterChange = filterChangeAction;
  onLoad(() => {
    _filterState.value = {};
  });
  onReady(() => {
    udbRef.value.loadData();
  });
</script>
