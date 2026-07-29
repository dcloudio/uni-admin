<template>
  <!-- 对应页面：设备统计-活跃度  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <view class="uni-sub-title hide-on-phone">用户活跃度分析</view>
      </view>
    </view>
    <view class="uni-container">
      <view class="uni-stat--x flex p-1015">
        <view class="uni-stat--app-select">
          <uni-data-select
            collection="opendb-app-list"
            field="appid as value, name as text"
            orderby="text asc"
            :defItem="1"
            label="应用选择"
            @change="changeAppid"
            v-model="query.appid"
            :clear="false"
          />
          <uni-data-select
            collection="opendb-app-versions"
            :where="versionQuery"
            class="ml-m"
            field="_id as value, version as text, uni_platform as label, create_date as date"
            format="{label} - {text}"
            orderby="date desc"
            label="版本选择"
            v-model="query.version_id"
          />
        </view>
      </view>
      <view class="uni-stat--x flex">
        <uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" :yesterday="false" @change="changeTimeRange" />
        <uni-datetime-picker
          type="datetimerange"
          :end="new Date().getTime()"
          v-model="query.start_time"
          returnType="timestamp"
          :clearIcon="false"
          class="uni-stat-datetime-picker"
          :class="{ 'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length }"
          @change="useDatetimePicker"
        />
      </view>
      <view class="uni-stat--x">
        <uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" @change="changePlatform" />
        <uni-data-select
          ref="version-select"
          v-if="query.platform_id && query.platform_id.indexOf('==') === -1"
          collection="uni-stat-app-channels"
          :where="channelQuery"
          class="p-channel"
          field="_id as value, channel_name as text"
          orderby="text asc"
          label="渠道/场景值选择"
          v-model="query.channel_id"
        />
      </view>
      <view class="uni-stat--x p-m">
        <view class="label-text mb-l"> 趋势图 </view>
        <uni-stat-tabs type="box" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
        <view class="uni-charts-box">
          <qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp :errorMessage="errorMessage" />
        </view>
      </view>
      <view class="uni-stat--x p-m">
        <uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" tooltip />
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
    </view>

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  import {
    mapfields,
    stringifyQuery,
    stringifyField,
    stringifyGroupField,
    getTimeOfSomeDayAgo,
    division,
    format,
    formatDate,
    maxDeltaDay,
    debounce,
  } from '@/js_sdk/uni-stat/util.js';
  import fieldsMapSource from './fieldsMap.js';
  import { computed, ref, watch } from 'vue';
  const tableNameState = ref('uni-stat-result');
  const tableName = tableNameState;
  const fieldsMapState = ref(fieldsMapSource);
  const fieldsMap = fieldsMapState;
  const queryState = ref({
    dimension: 'day',
    appid: '',
    platform_id: '',
    uni_platform: '',
    version_id: '',
    channel_id: '',
    start_time: [],
  });
  const query = queryState;
  const optionsState = ref({
    pageSize: 20,
    pageCurrent: 1,
    // 当前页
    total: 0, // 数据总量
  });
  const options = optionsState;
  const loadingState = ref(false);
  const loading = loadingState;
  const currentDateTabState = ref(0);
  const currentDateTab = currentDateTabState;
  const currentChartTabState = ref('day');
  const currentChartTab = currentChartTabState;
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const channelDataState = ref([]);
  const channelData = channelDataState;
  const tabNameState = ref('日活');
  const tabName = tabNameState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const debounceGetState = ref(undefined);
  const debounceGet = debounceGetState;
  const chartTabsComputed = computed(() => {
    const tabs = [
      {
        _id: 'day',
        name: '日活',
      },
      {
        _id: 'week',
        name: '周活',
      },
      {
        _id: 'month',
        name: '月活',
      },
    ];
    if (maxDeltaDay(queryState.value.start_time, 7)) {
      tabs.forEach((tab, index) => {
        if (tab._id === 'month') {
          tab.disabled = true;
        } else {
          tab.disabled = false;
        }
      });
    }
    return tabs;
  });
  const chartTabs = chartTabsComputed;
  const channelQueryComputed = computed(() => {
    const platform_id = queryState.value.platform_id;
    return stringifyQuery({
      platform_id,
    });
  });
  const channelQuery = channelQueryComputed;
  const versionQueryComputed = computed(() => {
    const { appid, uni_platform } = queryState.value;
    const query = stringifyQuery({
      appid,
      uni_platform,
    });
    return query;
  });
  const versionQuery = versionQueryComputed;
  const useDatetimePickerAction = () => {
    currentDateTabState.value = -1;
  };
  const useDatetimePicker = useDatetimePickerAction;
  const changeAppidAction = (id) => {
    getChannelDataAction(id, false);
  };
  const changeAppid = changeAppidAction;
  const changePlatformAction = (id, index, name, item) => {
    getChannelDataAction(null, id);
    queryState.value.version_id = 0;
    queryState.value.uni_platform = item.code;
  };
  const changePlatform = changePlatformAction;
  const changeTimeRangeAction = (id, index) => {
    currentDateTabState.value = index;
    const day = 24 * 60 * 60 * 1000;
    let start, end;
    start = getTimeOfSomeDayAgo(id);
    if (!id) {
      end = getTimeOfSomeDayAgo(0) + day - 1;
    } else {
      end = getTimeOfSomeDayAgo(0) - 1;
    }
    queryState.value.start_time = [start, end];
  };
  const changeTimeRange = changeTimeRangeAction;
  const changePageCurrentAction = (e) => {
    optionsState.value.pageCurrent = e.current;
    getTabelDataAction(queryState.value);
  };
  const changePageCurrent = changePageCurrentAction;
  const changePageSizeAction = (pageSize) => {
    optionsState.value.pageSize = pageSize;
    optionsState.value.pageCurrent = 1; // 重置分页
    // 重置分页
    getTabelDataAction(queryState.value);
  };
  const changePageSize = changePageSizeAction;
  const changeChartTabAction = (type, index, name) => {
    currentChartTabState.value = type;
    tabNameState.value = name;
    getChartDataAction(queryState.value, type, name);
  };
  const changeChartTab = changeChartTabAction;
  const getAllDataAction = (query) => {
    if (!query.appid) {
      errorMessageState.value = '请先选择应用';
      return; // 如果appid为空，则不进行查询
    }

    errorMessageState.value = '';
    getChartDataAction(query, currentChartTabState.value, tabNameState.value);
    getTabelDataAction(query);
  };
  const getAllData = getAllDataAction;
  const getChartDataAction = (query, type, name = '日活', field = 'active_device_count') => {
    chartDataState.value = {};
    const options = {
      categories: [],
      series: [
        {
          name,
          data: [],
        },
      ],
    };
    query = stringifyQuery(query, false, ['uni_platform']);
    console.log('query: ', query);
    const db = uniCloud.database();
    if (type === 'day') {
      db.collection(tableNameState.value)
        .where(query)
        .field(`${stringifyField(fieldsMapSource, field)}, start_time`)
        .groupBy('start_time')
        .groupField(stringifyGroupField(fieldsMapSource, field))
        .orderBy('start_time', 'asc')
        .get({
          getCount: true,
        })
        .then((res) => {
          const { count, data } = res.result;
          chartDataState.value = [];
          for (const item of data) {
            const x = formatDate(item.start_time, 'day');
            const y = item[field];
            options.series[0].data.push(y);
            options.categories.push(x);
          }
          chartDataState.value = options;
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      // 周、月范围的处理
      getRangeCountDataAction(query, type).then((res) => {
        const oldType = type;
        if (type === 'week') type = 'isoWeek';
        const { count, data } = res.result;
        chartDataState.value = [];
        const wunWeekTime = 7 * 24 * 60 * 60 * 1000;
        for (const item of data) {
          const date = +new Date(item.year, 0) + (Number(item[type]) * wunWeekTime - 1);
          const x = formatDate(date, oldType);
          const y = item[type + '_' + field];
          if (y) {
            options.series[0].data.push(y);
            options.categories.push(x);
          }
        }
        chartDataState.value = options;
      });
    }
  };
  const getChartData = getChartDataAction;
  const getTabelDataAction = (queryData, field = 'active_device_count') => {
    const { pageCurrent } = optionsState.value;
    let query = stringifyQuery(queryData);
    loadingState.value = true;
    const db = uniCloud.database();
    db.collection(tableNameState.value)
      .where(query)
      .field(`${stringifyField(fieldsMapSource, field)}, start_time`)
      .groupBy('start_time')
      .groupField(stringifyGroupField(fieldsMapSource, field))
      .orderBy('start_time', 'desc')
      .skip((pageCurrent - 1) * optionsState.value.pageSize)
      .limit(optionsState.value.pageSize)
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        let daysData = data,
          daysCount = count,
          weeks = [],
          months = [];
        // 获取周活、月活
        // stringifyQuery(queryData)
        let query = JSON.parse(JSON.stringify(queryData));
        query.dimension = 'week';
        getRangeCountDataAction(stringifyQuery(query), 'week').then((res) => {
          const { count, data } = res.result;
          weeks = data;
          // queryData.dimension = 'month'
          let query = JSON.parse(JSON.stringify(queryData));
          query.dimension = 'month';
          getRangeCountDataAction(stringifyQuery(query), 'month')
            .then((res) => {
              const { count, data } = res.result;
              months = data;
              const allData = mapWithWeekAndMonthAction(daysData, weeks, months);
              for (const item of allData) {
                mapfields(fieldsMapSource, item, item);
              }
              tableDataState.value = [];
              optionsState.value.total = daysCount;
              tableDataState.value = allData;
            })
            .finally(() => {
              loadingState.value = false;
            });
        });
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
      });
  };
  const getTabelData = getTabelDataAction;
  const getRangeCountDataAction = (query, type, field = 'active_device_count') => {
    if (type === 'week') type = 'isoWeek';
    const { pageCurrent } = optionsState.value;
    const db = uniCloud.database();
    return db
      .collection(tableNameState.value)
      .where(query)
      .field(`${field}, start_time, ${type}(add(new Date(0),start_time), "Asia/Shanghai") as ${type},year(add(new Date(0),start_time), "Asia/Shanghai") as year`)
      .groupBy(`year, ${type}`)
      .groupField(`sum(${field}) as ${type}_${field}`)
      .orderBy(`year asc, ${type} asc`)
      .get({
        getCount: true,
      });
  };
  const getRangeCountData = getRangeCountDataAction;
  const mapWithWeekAndMonthAction = (data, weeks, months, field = 'active_device_count') => {
    for (const item of data) {
      const date = new Date(item.start_time);
      const year = date.getUTCFullYear();
      const month = date.getMonth() + 1;
      const week = getWeekNumberAction(date);
      for (const w of weeks) {
        if (w.isoWeek === week && w.year === year) {
          item[`week_${field}`] = w[`isoWeek_${field}`];
        }
      }
      for (const m of months) {
        if (m.month === month && m.year === year) {
          item[`month_${field}`] = m[`month_${field}`];
        }
      }
    }
    return data;
  };
  const mapWithWeekAndMonth = mapWithWeekAndMonthAction;
  const getWeekNumberAction = (d) => {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    // Calculate full weeks to nearest Thursday
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };
  const getWeekNumber = getWeekNumberAction;
  const getChannelDataAction = (appid, platform_id) => {
    queryState.value.channel_id = '';
    const db = uniCloud.database();
    const condition = {};
    //对应应用
    //对应应用
    appid = appid ? appid : queryState.value.appid;
    if (appid) {
      condition.appid = appid;
    }
    //对应平台
    //对应平台
    platform_id = platform_id ? platform_id : queryState.value.platform_id;
    if (platform_id) {
      condition.platform_id = platform_id;
    }
    let platformTemp = db.collection('uni-stat-app-platforms').field('_id, name').getTemp();
    let channelTemp = db.collection('uni-stat-app-channels').where(condition).field('_id, channel_name, create_time, platform_id').getTemp();
    db.collection(channelTemp, platformTemp)
      .orderBy('platform_id', 'asc')
      .get()
      .then((res) => {
        let data = res.result.data;
        let channels = [];
        if (data.length > 0) {
          let channelName;
          for (let i in data) {
            channelName = data[i].channel_name ? data[i].channel_name : '默认';
            if (data[i].platform_id.length > 0) {
              channelName = data[i].platform_id[0].name + '-' + channelName;
            }
            channels.push({
              value: data[i]._id,
              text: channelName,
            });
          }
        }
        channelDataState.value = channels;
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
      })
      .finally(() => {});
  };
  const getChannelData = getChannelDataAction;
  watch(
    () => queryState.value,
    (val) => {
      optionsState.value.pageCurrent = 1; // 重置分页
      // 重置分页
      debounceGetState.value();
    },
    {
      deep: true,
    }
  );
  debounceGetState.value = debounce(() => {
    getAllDataAction(queryState.value);
  }, 300);
  getChannelDataAction();
</script>

<style></style>
