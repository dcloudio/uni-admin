<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" :placeholder="$t('common.placeholder.query')" />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">{{ $t('common.button.search') }}</button>
        <button class="uni-button" type="primary" size="mini" @click="navigateTo('./add')">{{ $t('common.button.add') }}</button>
        <button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">{{ $t('common.button.batchDelete') }}</button>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db
        ref="udbRef"
        collection="opendb-app-list"
        field="appid,app_type,name,description,remark,create_date"
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
        <uni-table
          ref="tableRef"
          :loading="loading || addAppidLoading"
          :emptyText="error.message || $t('common.empty')"
          border
          stripe
          type="selection"
          @selection-change="selectionChange"
          class="table-pc"
        >
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'appid')" sortable @sort-change="sortChange($event, 'appid')">AppID</uni-th>
            <uni-th
              align="center"
              filter-type="select"
              :filter-data="appTypeData"
              @filter-change="filterChange($event, 'app_type')"
              sortable
              @sort-change="sortChange($event, 'app_type')"
              >应用类型</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'name')" sortable @sort-change="sortChange($event, 'name')">应用名称</uni-th>
            <uni-th
              align="center"
              filter-type="search"
              @filter-change="filterChange($event, 'description')"
              sortable
              @sort-change="sortChange($event, 'description')"
              :width="descriptionThWidth"
              >应用描述
            </uni-th>
            <uni-th align="center">应用备注</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')" sortable @sort-change="sortChange($event, 'create_date')"
              >创建时间</uni-th
            >
            <uni-th align="center" :width="buttonThWidth">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index" :disabled="item.appid === appid">
            <uni-td align="center">{{ item.appid }}</uni-td>
            <uni-td align="center">{{ getAppType(item.app_type) }}</uni-td>
            <uni-td align="center">{{ item.name }}</uni-td>
            <uni-td align="left"
              ><text>{{ item.description || '-' }}</text></uni-td
            >
            <uni-td align="left"
              ><text>{{ item.remark || '-' }}</text></uni-td
            >
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <!-- <view v-if="item.appid === appid">
								-
							</view> -->
              <view class="uni-group">
                <button @click="publish(item._id)" class="uni-button" size="mini" type="primary">{{ $t('common.button.publish') }}</button>
                <button @click="navigateTo('/uni_modules/uni-upgrade-center/pages/version/list?appid=' + item.appid, false)" class="uni-button" size="mini" type="primary">
                  {{ $t('common.button.version') }}
                </button>
                <button @click="navigateTo('./add?id=' + item.appid, false)" class="uni-button" size="mini" type="primary">{{ $t('common.button.edit') }}</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">{{ $t('common.button.delete') }}</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>

        <view class="uni-pagination-box">
          <uni-pagination
            show-icon
            show-page-size
            :page-size="pagination.size"
            v-model="pagination.current"
            :total="pagination.count"
            @change="onPageChanged"
            @pageSizeChange="pageSizeChange"
          />
        </view>
      </unicloud-db>
    </view>

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>
<script setup>
  import { enumConverter, filterToWhere } from '../../../js_sdk/validator/opendb-app-list.js';
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = 'create_date'; // 排序字段
  // 排序字段
  const dbSearchFields = []; // 模糊搜索字段，支持模糊搜索的字段列表
  // 分页配置
  // 模糊搜索字段，支持模糊搜索的字段列表
  // 分页配置
  const pageSize = 20;
  const pageCurrent = 1;
  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
  };
  import { useStore } from 'vuex';
  import { computed, nextTick, ref } from 'vue';
  import { onLoad, onReady } from '@dcloudio/uni-app';
  const store = useStore();
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
    filename: 'opendb-app-list.xls',
    type: 'xls',
    fields: {
      AppID: 'appid',
      应用类型: 'app_type',
      应用名称: 'name',
      应用描述: 'description',
      创建时间: 'create_date',
    },
  });
  const exportExcel = exportExcelState;
  const exportExcelDataState = ref([]);
  const exportExcelData = exportExcelDataState;
  const addAppidLoadingState = ref(true);
  const addAppidLoading = addAppidLoadingState;
  const descriptionThWidthState = ref(380);
  const descriptionThWidth = descriptionThWidthState;
  const buttonThWidthState = ref(400);
  const buttonThWidth = buttonThWidthState;
  const appTypeDataState = ref([
    {
      text: 'uni-app',
      value: 0,
    },
    {
      text: 'uni-app x',
      value: 1,
    },
  ]);
  const appTypeData = appTypeDataState;
  const _filterState = ref(undefined);
  const _filter = _filterState;
  const pageSizeIndexState = ref(undefined);
  const pageSizeIndex = pageSizeIndexState;
  const udbRef = ref(null);
  const tableRef = ref(null);
  const appNameComputed = computed(() => {
    return store.state.app.appName;
  });
  const appName = appNameComputed;
  const appidComputed = computed(() => {
    return store.state.app.appid;
  });
  const appid = appidComputed;
  const pageSizeChangeAction = (pageSize) => {
    optionsState.value.pageSize = pageSize;
    optionsState.value.pageCurrent = 1;
    nextTick(() => {
      loadDataAction();
    });
  };
  const pageSizeChange = pageSizeChangeAction;
  const onqueryloadAction = (data) => {
    if (!data.find((item) => item.appid === appidComputed.value)) {
      addCurrentAppidAction({
        appid: appidComputed.value,
        app_type: 0,
        name: appNameComputed.value,
        description: 'admin 管理后台',
      });
    } else {
      addAppidLoadingState.value = false;
    }
    exportExcelDataState.value = data;
  };
  const onqueryload = onqueryloadAction;
  const changeSizeAction = (e) => {
    pageSizeIndexState.value = e.detail.value;
  };
  const changeSize = changeSizeAction;
  const addCurrentAppidAction = (app) => {
    // 使用 clientDB 提交当前 appid
    db.collection('opendb-app-list')
      .add(app)
      .then((res) => {
        loadDataAction();
        setTimeout(() => {
          uni.showModal({
            content: `检测到数据库中无当前应用, 已自动添加应用: ${appNameComputed.value}`,
            showCancel: false,
          });
        }, 500);
      })
      .catch((err) => {})
      .finally(() => {
        addAppidLoadingState.value = false;
      });
  };
  const addCurrentAppid = addCurrentAppidAction;
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
    loadDataAction();
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
    console.warn(
      '删除应用，只能删除应用表 opendb-app-list 中的应用数据记录，不能删除与应用关联的其他数据，例如：使用升级中心 uni-upgrade-center 等插件产生的数据（应用版本数据等）'
    );
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
    console.warn(
      '删除应用，只能删除应用表 opendb-app-list 中的应用数据记录，不能删除与应用关联的其他数据，例如：使用升级中心 uni-upgrade-center 等插件产生的数据（应用版本数据等）'
    );
    udbRef.value.remove(id, {
      confirmContent: '是否删除该应用',
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
  const publishAction = (id) => {
    uni.navigateTo({
      url: '/pages/system/app/uni-portal/uni-portal?id=' + id,
    });
  };
  const publish = publishAction;
  const getAppTypeAction = (app_type = 0) => {
    const data = ['uni-app', 'uni-app x'];
    return data[app_type] || '未知类型';
  };
  const getAppType = getAppTypeAction;
  onLoad(() => {
    _filterState.value = {};
  });
  onReady(() => {
    udbRef.value.loadData();
  });
</script>

<style></style>
