<template>
  <view class="fix-top-window">
    <view class="uni-container">
      <uni-stat-table :data="tableData" :filedsMap="popupFieldsMap" :loading="loading" />
      <view class="uni-pagination-box">
        <uni-pagination
          show-icon
          show-page-size
          :page-size="options.pageSize"
          :current="options.pageCurrent"
          :total="options.total"
          @change="changePageCurrent"
          @pageSizeChange="changePageSize"
        />
      </view>
    </view>

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { mapfields, stringifyQuery, getTimeOfSomeDayAgo, division, format, formatDate, parseDateTime, debounce } from '@/js_sdk/uni-stat/util.js';
  import { popupFieldsMap as popupFieldsMapSource } from './fieldsMap.js';
  const panelOption = [
    {
      title: '错误总数',
      value: 0,
      tooltip: '指应用在某个时间段内出现错误的总数',
    },
    {
      title: '错误率',
      value: 0,
      tooltip: '时间范围内的总错误数/应用启动次数，如果小于0.01%，默认显示为0',
    },
  ];
  import { ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  const popupFieldsMapState = ref(popupFieldsMapSource);
  const popupFieldsMap = popupFieldsMapState;
  const optionsState = ref({
    pageSize: 20,
    pageCurrent: 1,
    // 当前页
    total: 0, // 数据总量
  });
  const options = optionsState;
  const queryState = ref({
    error_hash: '',
    create_time: [],
  });
  const query = queryState;
  const loadingState = ref(false);
  const loading = loadingState;
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const changePageCurrentAction = (e) => {
    optionsState.value.pageCurrent = e.current;
    getTableDataAction(stringifyQuery(queryState.value));
  };
  const changePageCurrent = changePageCurrentAction;
  const changePageSizeAction = (pageSize) => {
    optionsState.value.pageSize = pageSize;
    optionsState.value.pageCurrent = 1; // 重置分页
    // 重置分页
    getTableDataAction(stringifyQuery(queryState.value));
  };
  const changePageSize = changePageSizeAction;
  const getTableDataAction = (query) => {
    const { pageCurrent } = optionsState.value;
    loadingState.value = true;
    const db = uniCloud.database();
    db.collection('uni-stat-error-logs')
      .where(query)
      .orderBy('create_time', 'desc')
      .skip((pageCurrent - 1) * optionsState.value.pageSize)
      .limit(optionsState.value.pageSize)
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        optionsState.value.total = count;
        for (const item of data) {
          item.create_time = parseDateTime(item.create_time, 'dateTime');
        }
        tableDataState.value = data;
      })
      .finally(() => {
        loadingState.value = false;
      });
  };
  const getTableData = getTableDataAction;
  onLoad((option) => {
    let { error_hash, create_time } = option;
    if (error_hash) {
      create_time = Number(create_time);
      queryState.value.error_hash = error_hash;
      queryState.value.create_time = [create_time, create_time + 24 * 60 * 60 * 1000];
      getTableDataAction(stringifyQuery(queryState.value));
    }
  });
</script>

<style>
  .uni-stat-panel {
    box-shadow: unset;
    border-bottom: 1px solid #eee;
    padding: 0;
    margin: 0 15px;
  }
</style>
