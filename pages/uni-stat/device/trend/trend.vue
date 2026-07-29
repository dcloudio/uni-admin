<template>
  <!-- 对应页面：设备统计-趋势分析  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <view class="uni-sub-title hide-on-phone">各指标趋势分析</view>
      </view>
    </view>
    <view class="uni-container">
      <view class="uni-stat--x flex p-1015">
        <view class="uni-stat--app-select">
          <uni-data-select
            collection="opendb-app-list"
            @change="changeAppid"
            field="appid as value, name as text"
            orderby="text asc"
            :defItem="1"
            label="应用选择"
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
        <uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
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
        <uni-stat-tabs label="维度选择" type="box" :current="currentDimensionTab" :tabs="dimensionTabs" @change="changeDimensionTab" />
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
      <uni-stat-panel :items="panelData" />

      <view class="uni-stat--x p-m">
        <view class="label-text mb-l"> 趋势图 </view>
        <uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
        <view class="uni-charts-box">
          <qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp :errorMessage="errorMessage" :eopts="setOptions" />
        </view>
      </view>

      <view class="uni-stat--x p-m">
        <uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" />
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
    getFieldTotal,
    debounce,
  } from '@/js_sdk/uni-stat/util.js';
  import fieldsMapSource from './fieldsMap.js';
  import { computed, ref, watch } from 'vue';
  const getFieldTotalContext = {
    get panelData() {
      return panelDataState.value;
    },
  };
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
  const currentDateTabState = ref(1);
  const currentDateTab = currentDateTabState;
  const currentDimensionTabState = ref(1);
  const currentDimensionTab = currentDimensionTabState;
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const panelDataState = ref(fieldsMapSource.filter((f) => f.hasOwnProperty('value')));
  const panelData = panelDataState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const chartTabState = ref('new_user_count');
  const chartTab = chartTabState;
  const channelDataState = ref([]);
  const channelData = channelDataState;
  const tabIndexState = ref(0);
  const tabIndex = tabIndexState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const setOptionsState = ref({
    xAxis: {
      boundaryGap: false,
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      left: 40,
      right: 50,
      bottom: 50,
      top: 60,
      containLabel: true,
      show: false,
    },
  });
  const setOptions = setOptionsState;
  const debounceGetState = ref(undefined);
  const debounceGet = debounceGetState;
  const chartTabsComputed = computed(() => {
    const tabs = [];
    fieldsMapSource.forEach((item) => {
      const { field: _id, title: name } = item;
      const isTab = item.hasOwnProperty('value');
      if (_id && name && isTab) {
        tabs.push({
          _id,
          name,
        });
      }
    });
    return tabs;
  });
  const chartTabs = chartTabsComputed;
  const dimensionTabsComputed = computed(() => {
    const tabs = [
      {
        _id: 'hour',
        name: '按时',
      },
      {
        _id: 'day',
        name: '按日',
      },
      {
        _id: 'week',
        name: '按周',
      },
      {
        _id: 'month',
        name: '按月',
      },
    ];
    if (!getDaysAction()) {
      queryState.value.dimension = 'hour';
      tabs.forEach((tab, index) => {
        if (tab._id === 'hour') {
          tab.disabled = false;
        } else {
          tab.disabled = true;
        }
      });
      currentDimensionTabState.value = 0;
    } else {
      //this.query.dimension = 'day'
      tabs.forEach((tab, index) => {
        if (tab._id === 'hour') {
          tab.disabled = false;
        } else {
          tab.disabled = false;
        }
      });
      //this.currentDimensionTab = 1
    }

    return tabs;
  });
  const dimensionTabs = dimensionTabsComputed;
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
  const getDaysAction = () => {
    if (!queryState.value.start_time.length) return true;
    const day = 24 * 60 * 60 * 1000;
    const [start, end] = queryState.value.start_time;
    const lessTwoDay = end - start >= day;
    return lessTwoDay;
  };
  const getDays = getDaysAction;
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
  const changeDimensionTabAction = (dimension, index) => {
    currentDimensionTabState.value = index;
    queryState.value.dimension = dimension;
  };
  const changeDimensionTab = changeDimensionTabAction;
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
  const changeChartTabAction = (id, index, name) => {
    tabIndexState.value = index;
    getChartDataAction(queryState.value, id, name);
  };
  const changeChartTab = changeChartTabAction;
  const getAllDataAction = (query) => {
    if (!query.appid) {
      errorMessageState.value = '请先选择应用';
      return; // 如果appid为空，则不进行查询
    }

    errorMessageState.value = '';
    getPanelDataAction();
    getChartDataAction(query);
    getTabelDataAction(query);
  };
  const getAllData = getAllDataAction;
  const getChartDataAction = (query, field = chartTabsComputed.value[tabIndexState.value]._id, name = chartTabsComputed.value[tabIndexState.value].name) => {
    // this.chartData = {}
    query = stringifyQuery(query, true, ['uni_platform']);
    const dimension = queryState.value.dimension;
    //console.log('query: ', query, this.query.dimension)
    //console.log('query: ', query, this.query.dimension)
    const db = uniCloud.database();
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
        const options = {
          categories: [],
          series: [
            {
              name,
              data: [],
            },
          ],
        };
        let mapper = fieldsMapSource.filter((f) => f.field === field);
        mapper = JSON.parse(JSON.stringify(mapper));
        delete mapper[0].value;
        mapper[0].formatter = '';
        for (const item of data) {
          mapfields(mapper, item, item);
          const x = formatDate(item.start_time, dimension);
          let y = item[field];
          options.series[0].data.push(y);
          options.categories.push(x);
        }
        chartDataState.value = options;
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
      })
      .finally(() => {
        loadingState.value = false;
      });
  };
  const getChartData = getChartDataAction;
  const getTabelDataAction = (query) => {
    const { pageCurrent } = optionsState.value;
    query = stringifyQuery(query, true, ['uni_platform']);
    console.log('query: ', query);
    optionsState.value.pageCurrent = 1; // 重置分页
    // 重置分页
    loadingState.value = true;
    const db = uniCloud.database();
    db.collection(tableNameState.value)
      .where(query)
      .field(stringifyField(fieldsMapSource))
      .groupBy('start_time')
      .groupField(stringifyGroupField(fieldsMapSource))
      .orderBy('start_time', 'desc')
      .skip((pageCurrent - 1) * optionsState.value.pageSize)
      .limit(optionsState.value.pageSize)
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        for (const item of data) {
          let date = item.start_time;
          if (date) {
            const dimension = queryState.value.dimension;
            item.start_time = formatDate(date, dimension);
          }
          mapfields(fieldsMapSource, item, item);
        }
        tableDataState.value = [];
        optionsState.value.total = count;
        tableDataState.value = data;
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
      })
      .finally(() => {
        loadingState.value = false;
      });
  };
  const getTabelData = getTabelDataAction;
  const getPanelDataAction = () => {
    let cloneQuery = JSON.parse(JSON.stringify(queryState.value));
    //cloneQuery.dimension = 'day'
    //cloneQuery.dimension = 'day'
    let query = stringifyQuery(cloneQuery, false, ['uni_platform']);
    const db = uniCloud.database();
    const subTable = db
      .collection(tableNameState.value)
      .where(query)
      .field(`${stringifyField(fieldsMapSource)},stat_date`)
      .groupBy('appid')
      .groupField(stringifyGroupField(fieldsMapSource))
      .orderBy('stat_date', 'desc')
      .get()
      .then((res) => {
        const item = res.result.data[0];
        item && (item.total_devices = 0);
        getFieldTotal.call(getFieldTotalContext, cloneQuery);
        panelDataState.value = [];
        panelDataState.value = mapfields(fieldsMapSource, item);
      });
  };
  const getPanelData = getPanelDataAction;
  const navToAction = (id) => {
    const url = `/pages/uni-stat/overview/overview?id=${id}`;
    uni.navigateTo({
      url,
    });
  };
  const navTo = navToAction;
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
