<template>
  <!-- 对应页面：注册用户统计-概况  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
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
        <uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" :today="true" @change="changeTimeRange" />
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
      <uni-stat-panel :items="panelData" :contrast="true" />
      <view class="uni-stat--x p-m">
        <view class="uni-stat-card-header"> 趋势图 </view>
        <uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
        <view class="uni-charts-box">
          <qiun-data-charts type="area" :chartData="chartData" :eopts="eopts" echartsH5 echartsApp tooltipFormat="tooltipCustom" :errorMessage="errorMessage" />
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
    parseDateTime,
    getFieldTotal,
    debounce,
  } from '@/js_sdk/uni-stat/util.js';
  import { fieldsMap as fieldsMapSource, resFieldsMap as resFieldsMapSource, entFieldsMap as entFieldsMapSource } from './fieldsMap.js';
  const panelOption = fieldsMapSource.filter((f) => f.hasOwnProperty('value'));
  import { computed, ref, watch } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  const getFieldTotalContext = {
    get panelData() {
      return panelDataState.value;
    },
  };
  const tableNameState = ref('uni-stat-result');
  const tableName = tableNameState;
  const fieldsMapState = ref(fieldsMapSource);
  const fieldsMap = fieldsMapState;
  const resFieldsMapState = ref(resFieldsMapSource);
  const resFieldsMap = resFieldsMapState;
  const entFieldsMapState = ref(entFieldsMapSource);
  const entFieldsMap = entFieldsMapState;
  const queryState = ref({
    dimension: 'hour',
    appid: '',
    platform_id: '',
    uni_platform: '',
    version_id: '',
    start_time: [],
  });
  const query = queryState;
  const optionsState = ref({
    pageCurrent: 1,
    // 当前页
    total: 0,
    // 数据总量
    pageSizeIndex: 0,
    // 与 pageSizeRange 一起计算得出 pageSize
    pageSizeRange: [10, 20, 50, 100],
  });
  const options = optionsState;
  const loadingState = ref(false);
  const loading = loadingState;
  const currentDateTabState = ref(2);
  const currentDateTab = currentDateTabState;
  const chartTabState = ref('new_user_count');
  const chartTab = chartTabState;
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const resTableDataState = ref([]);
  const resTableData = resTableDataState;
  const entTableDataState = ref([]);
  const entTableData = entTableDataState;
  const panelDataState = ref(panelOption);
  const panelData = panelDataState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const eoptsState = ref({
    seriesTemplate: [
      {
        itemStyle: {
          borderWidth: 2,
          borderColor: '#1890FF',
          color: '#1890FF',
        },
        areaStyle: {
          color: {
            colorStops: [
              {
                offset: 0,
                color: '#1890FF', // 0% 处的颜色
              },
              {
                offset: 1,
                color: '#FFFFFF', // 100% 处的颜色
              },
            ],
          },
        },
      },
      {
        // smooth: false,
        lineStyle: {
          color: '#ea7ccc',
          width: 2,
          type: 'dashed',
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#ea7ccc',
          color: '#ea7ccc',
        },
        areaStyle: null,
      },
    ],
  });
  const eopts = eoptsState;
  const tabIndexState = ref(0);
  const tabIndex = tabIndexState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const debounceGetState = ref(undefined);
  const debounceGet = debounceGetState;
  const pageSizeComputed = computed(() => {
    const { pageSizeRange, pageSizeIndex } = optionsState.value;
    return pageSizeRange[pageSizeIndex];
  });
  const pageSize = pageSizeComputed;
  const chartTabsComputed = computed(() => {
    const tabs = [];
    fieldsMapSource.forEach((item) => {
      const _id = item.field;
      const name = item.title;
      if (_id && name) {
        tabs.push({
          _id,
          name,
        });
      }
    });
    return tabs;
  });
  const chartTabs = chartTabsComputed;
  const versionQueryComputed = computed(() => {
    const { appid, uni_platform } = queryState.value;
    const query = stringifyQuery({
      appid,
      uni_platform,
    });
    return query;
  });
  const versionQuery = versionQueryComputed;
  const channelQueryComputed = computed(() => {
    const { appid, platform_id } = queryState.value;
    const query = stringifyQuery({
      appid,
      platform_id,
    });
    return query;
  });
  const channelQuery = channelQueryComputed;
  const useDatetimePickerAction = () => {
    currentDateTabState.value = null;
  };
  const useDatetimePicker = useDatetimePickerAction;
  const changePlatformAction = (id, index, name, item) => {
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
    getChartDataAction(queryState.value);
  };
  const changePageCurrent = changePageCurrentAction;
  const changePageSizeAction = (e) => {
    const { value } = e.detail;
    optionsState.value.pageCurrent = 1; // 重置分页
    // 重置分页
    optionsState.value.pageSizeIndex = value;
    getChartDataAction(queryState.value);
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
  };
  const getAllData = getAllDataAction;
  const getDaysAction = () => {
    if (!queryState.value.start_time.length) return true;
    const day = 24 * 60 * 60 * 1000;
    const [start, end] = queryState.value.start_time;
    const lessTwoDay = end - start >= day;
    return lessTwoDay;
  };
  const getDays = getDaysAction;
  const getPanelDataAction = () => {
    const { appid, platform_id, version_id } = queryState.value;
    const query = stringifyQuery({
      appid,
      platform_id,
      version_id,
      start_time: [getTimeOfSomeDayAgo(1), new Date().getTime()],
    });
    const db = uniCloud.database();
    const subTable = db
      .collection(tableNameState.value)
      .where(query)
      .field(`${stringifyField(fieldsMapSource)},dimension,stat_date`)
      .groupBy(`stat_date, dimension`)
      .groupField(stringifyGroupField(fieldsMapSource))
      .orderBy('stat_date', 'desc')
      .get()
      .then((res) => {
        const data = res.result.data;
        const today = data.find((item) => item.stat_date === parseDateTime(getTimeOfSomeDayAgo(0), '', '')) || {};
        today.total_users = 0;
        const yesterday = data.find((item) => item.dimension === 'day' && item.stat_date === parseDateTime(getTimeOfSomeDayAgo(1), '', ''));
        panelDataState.value = [];
        panelDataState.value = mapfields(fieldsMapSource, today);
        panelDataState.value.map((item) => {
          mapfields(fieldsMapSource, yesterday, item, '', 'contrast');
        });
        getFieldTotal.call(getFieldTotalContext, query, 'total_users');
      });
  };
  const getPanelData = getPanelDataAction;
  const getChartDataAction = (query, field = chartTabsComputed.value[tabIndexState.value]._id, name = chartTabsComputed.value[tabIndexState.value].name) => {
    // this.chartData = {}
    const { pageCurrent } = optionsState.value;
    const days = currentDateTabState.value;
    const date = getTimeOfSomeDayAgo(days);
    const day = 24 * 60 * 60 * 1000;
    let start_time;
    // 范围小于一天的日期（今日、昨日）做增大一天处理，目的是对比当前日期和前一天（今日和昨日、昨日和上前日）
    // 范围小于一天的日期（今日、昨日）做增大一天处理，目的是对比当前日期和前一天（今日和昨日、昨日和上前日）
    if (!getDaysAction()) {
      const start = date - day;
      const end = date + day - 1;
      query = JSON.parse(JSON.stringify(query));
      start_time = query.start_time = [start, end];
    }
    query = stringifyQuery(query, true, ['uni_platform']);
    const db = uniCloud.database();
    db.collection(tableNameState.value)
      .where(query)
      .field(`${stringifyField(fieldsMapSource, field)}, start_time`)
      .groupBy(`start_time`)
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
        if (!getDaysAction()) {
          const [start, end] = start_time;
          const line = (options.series[1] = {
            name: formatDate(start),
            data: [],
          });
          const cont = (options.series[0] = {
            name: formatDate(end),
            data: [],
          });
          for (let i = 0; i < 24; ++i) {
            const hour = i < 10 ? '0' + i : i;
            const x = `${hour}:00 ~ ${hour}:59`;
            options.categories.push(x);
            line.data[i] = 0;
            cont.data[i] = 0;
            data.forEach((item) => {
              mapfields(mapper, item, item);
              let val = Number(item[field]);
              const d = new Date(item.start_time);
              if (item.start_time < date) {
                if (d.getHours() === i) {
                  line.data[i] = val;
                }
              } else {
                if (d.getHours() === i) {
                  cont.data[i] = val;
                }
              }
            });
          }
        } else {
          for (const item of data) {
            mapfields(mapper, item, item);
            const x = formatDate(item.start_time, 'day');
            let y = Number(item[field]);
            options.series[0].data.push(y);
            options.categories.push(x);
          }
        }
        chartDataState.value = options;
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
      })
      .finally(() => {});
  };
  const getChartData = getChartDataAction;
  const getAppAccessTimesAction = (query) => {
    const db = uniCloud.database();
    return db.collection(tableNameState.value).where(query).groupBy('appid').groupField(`sum(page_visit_count) as total_app_access`).get();
  };
  const getAppAccessTimes = getAppAccessTimesAction;
  const navToAction = (url) => {
    if (!url) return;
    uni.navigateTo({
      url,
    });
  };
  const navTo = navToAction;
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
  onLoad((option) => {
    const { appid } = option;
    if (appid) {
      queryState.value.appid = appid;
    }
  });
  debounceGetState.value = debounce(() => {
    getAllDataAction(queryState.value);
  }, 300);
</script>

<style>
  .uni-stat-card-header {
    display: flex;
    justify-content: space-between;
    color: #555;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 0;
    margin-bottom: 15px;
  }

  .uni-stat-card-header-link {
    cursor: pointer;
  }
</style>
