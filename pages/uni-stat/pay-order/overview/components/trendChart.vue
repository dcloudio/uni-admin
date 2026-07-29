<template>
  <view class="uni-stat--x p-m">
    <view class="uni-stat-card-header">趋势图</view>
    <!-- 时间纬度 -->
    <view class="flex">
      <uni-stat-tabs type="box" :current="dateTabs.index" :tabs="dateTabs.list" @change="dateTabsChange" />
      <uni-datetime-picker
        type="datetimerange"
        v-model="dateTabs.time"
        :end="Date.now()"
        return-type="timestamp"
        :clear-icon="false"
        class="uni-stat-datetime-picker"
        @change="datePickerChange"
      />
    </view>
    <uni-stat-tabs type="box" :current="statTabs.index" :tabs="statTabs.list" @change="statTabsChange" />
    <view class="uni-charts-box">
      <qiun-data-charts type="area" :chartData="chartData" :opts="opts" :errorMessage="errorMessage" />
    </view>
  </view>
</template>

<script setup>
  import {
    formatterData,
    // 格式化字段数据
    fillTrendChartData,
    stringifyQuery,
    // 对象转JQL查询字符串
    parseDateTime,
    // 格式化时间
    debounce,
    // 防抖函数
    stringifyField,
    stringifyGroupField,
    getTimeOfSomeDayAgo,
  } from '@/js_sdk/uni-stat/util.js';
  import timeUtil from '@/js_sdk/uni-stat/timeUtil.js';
  import { fieldsGroupMap } from '../fieldsMap.js';
  let statTabsList = [];
  fieldsGroupMap.forEach((item) => {
    const _id = item.group;
    const name = item.title;
    if (_id && name) {
      statTabsList.push({
        _id,
        name,
        list: item.list,
      });
    }
  });
  import { ref, watch } from 'vue';
  const props = defineProps({
    query: {
      type: [Object],
      default: function () {
        return {};
      },
    },
  });
  const tableNameState = ref('uni-stat-pay-result');
  const tableName = tableNameState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const optsState = ref({
    color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc'],
    padding: [15, 15, 0, 15],
    legend: {},
    enableScroll: true,
    dataLabel: false,
    // 是否显示数据标签
    xAxis: {
      disableGrid: true,
      itemCount: 24,
      fontSize: 12,
      boundaryGap: 'center', // center justify
    },

    yAxis: {
      gridType: 'dash',
      dashLength: 2,
      data: [
        {
          tofix: 2,
        },
      ],
    },
    extra: {
      area: {
        type: 'straight',
        opacity: 0.2,
        addLine: true,
        width: 2,
        gradient: false,
      },
    },
    legend: {
      position: 'bottom',
    },
  });
  const opts = optsState;
  const dateTabsState = ref({
    time: [],
    timeStr: '',
    index: 2,
    // 默认最近7天
    list: [
      {
        _id: 1,
        name: '昨天',
        dimension: 'hour',
      },
      {
        _id: 0,
        name: '今天',
        dimension: 'hour',
      },
      {
        _id: 7,
        name: '最近七天',
        dimension: 'day',
      },
      {
        _id: 30,
        name: '最近30天',
        dimension: 'day',
      },
      {
        _id: 90,
        name: '最近90天',
        dimension: 'day',
      },
      {
        _id: 372,
        name: '月纬度',
        dimension: 'month',
      },
      {
        _id: 1116,
        name: '季纬度',
        dimension: 'quarter',
      },
      {
        _id: 4392,
        name: '年纬度',
        dimension: 'year',
      },
    ],
  });
  const dateTabs = dateTabsState;
  const statTabsState = ref({
    index: 0,
    list: statTabsList,
  });
  const statTabs = statTabsState;
  const queryModeState = ref(0);
  const queryMode = queryModeState;
  const getCloudDataDebounceState = ref(undefined);
  const getCloudDataDebounce = getCloudDataDebounceState;
  const getCloudDataAction = (obj = {}) => {
    let query = props.query;
    if (!query.appid) {
      errorMessageState.value = '请先选择应用';
      return; // 如果appid为空，则不进行查询
    }

    errorMessageState.value = '';
    let insideQuery = getWhereAction();
    let where = {
      ...query,
      ...insideQuery,
    };
    let fieldsMap = statTabsState.value.list[statTabsState.value.index].list;
    where = stringifyQuery(where, true, ['uni_platform']);
    //console.log('trendChart-where: ', where);
    //console.log('trendChart-where: ', where);
    const db = uniCloud.database();
    db.collection(tableNameState.value)
      .where(where)
      .field(`${stringifyField(fieldsMap)}, start_time`)
      .groupBy(`start_time`)
      .groupField(stringifyGroupField(fieldsMap))
      .orderBy('start_time', 'asc')
      .limit(100)
      .get({
        getCount: true,
      })
      .then((res) => {
        let { count, data } = res.result;
        data = fillTrendChartData(data, insideQuery, fieldsMap); // 补全数据
        // 数据格式化
        data = formatterData({
          fieldsMap,
          data,
          formatter: false,
        });
        //console.log('trendChartData: ', data)
        setChartDataAction(data, fieldsMap, insideQuery);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {});
  };
  const getCloudData = getCloudDataAction;
  const setChartDataAction = (data, fieldsMap, insideQuery) => {
    let chartData = {
      categories: [],
      series: [],
    };
    fieldsMap.map((item, index) => {
      if (item.trendChart) {
        chartData.series.push({
          name: item.title,
          data: [],
        });
      }
    });
    for (const item of data) {
      const x = formatDateAction(item.start_time, insideQuery.dimension);
      chartData.categories.push(x);
      fieldsMap.map((item2, index) => {
        if (item2.trendChart) {
          let y = Number(item[item2.field]);
          chartData.series[index].data.push(y);
        }
      });
    }
    chartDataState.value = chartData;
  };
  const setChartData = setChartDataAction;
  const formatDateAction = (date, type) => {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let hour = d.getHours();
    let quarter = Math.floor((d.getMonth() + 3) / 3); //季度
    //季度
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (type === 'hour') {
      return `${hour}时`;
    } else if (type === 'month') {
      return `${year}-${month}`;
    } else if (type === 'quarter') {
      return `${year}/Q${quarter}`;
    } else if (type === 'year') {
      return `${year}`;
    } else {
      return parseDateTime(d);
    }
  };
  const formatDate = formatDateAction;
  const datePickerChangeAction = (time) => {
    dateTabsState.value.time = time;
    //this.dateTabs.index = null;
    //this.dateTabs.index = null;
    queryModeState.value = 1;
    getCloudDataAction();
  };
  const datePickerChange = datePickerChangeAction;
  const dateTabsChangeAction = (id, index) => {
    dateTabsState.value.index = index;
    queryModeState.value = 0;
    getCloudDataAction();
  };
  const dateTabsChange = dateTabsChangeAction;
  const statTabsChangeAction = (id, index, name) => {
    statTabsState.value.index = index;
    getCloudDataAction({
      field: id,
      name,
    });
  };
  const statTabsChange = statTabsChangeAction;
  const getWhereAction = () => {
    const day = 24 * 60 * 60 * 1000;
    let start_time = [];
    let item = dateTabsState.value.list[dateTabsState.value.index] || {};
    if (typeof item._id === 'number' && queryModeState.value === 0) {
      let start = getTimeOfSomeDayAgo(item._id);
      let end = timeUtil.getOffsetStartAndEnd('day', 0).endTime; // end默认=今天的截止时间
      if (item._id == 1) {
        // 如果是查昨天,则特殊处理下,end=昨天的截止时间
        end = timeUtil.getOffsetStartAndEnd('day', 0, start).endTime;
      }
      start_time = [start, end];
    } else if (dateTabsState.value.time) {
      start_time = dateTabsState.value.time; // 当前选择的时间
    }

    let dimension = item.dimension || 'day'; // 获取时间纬度
    // 获取时间纬度
    dateTabsState.value.timeStr = `${timeUtil.timeFormat(start_time[0])} ~ ${timeUtil.timeFormat(start_time[1])}`;
    dateTabsState.value.time = start_time;
    return {
      dimension,
      // 时间纬度
      start_time, // 时间范围
    };
  };
  const getWhere = getWhereAction;
  watch(
    () => props.query,
    (val) => {
      getCloudDataDebounceState.value();
    },
    {
      deep: true,
    }
  );
  getCloudDataDebounceState.value = debounce(() => {
    getCloudDataAction();
  }, 300);
  getCloudDataDebounceState.value();
</script>

<style lang="scss" scoped>
  .justify-center {
    justify-content: center;
  }
</style>
