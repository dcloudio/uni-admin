<template>
  <!-- 对应页面：场景值（小程序）  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <view class="uni-sub-title hide-on-phone">
          小程序平台有效。用户打开小程序时的场景，如通过扫描二维码打开小程序，场景为二维码。注意：部分平台可能获取不到场景值，如支付宝小程序</view
        >
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
      </view>
      <view class="uni-stat--x">
        <uni-stat-tabs label="平台选择" type="boldLine" mode="platform-scene" :all="false" v-model="query.platform_id" @change="changePlatform" />
      </view>
      <view class="uni-stat--x" style="padding: 15px 0">
        <uni-stat-panel :items="panelData" class="uni-stat-panel" />
        <uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
        <view class="uni-charts-box" style="height: 400px">
          <qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp tooltipFormat="tooltipCustom" :errorMessage="errorMessage" />
        </view>
      </view>

      <view class="uni-stat--x p-m">
        <uni-stat-table :data="tableData" :filedsMap="fieldsMap.slice(0, fieldsMap.length - 1)" :loading="loading" />
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
    maxDeltaDay,
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
  const fieldsMapState = ref(fieldsMapSource);
  const fieldsMap = fieldsMapState;
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
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const panelDataState = ref(fieldsMapSource.filter((f) => f.hasOwnProperty('value')));
  const panelData = panelDataState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const chartTabState = ref('new_device_count');
  const chartTab = chartTabState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
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
  const queryStrComputed = computed(() => {
    return stringifyQuery(queryState.value, true);
  });
  const queryStr = queryStrComputed;
  const dimensionComputed = computed(() => {
    if (maxDeltaDay(queryState.value.start_time, 1)) {
      return 'hour';
    } else {
      return 'day';
    }
  });
  const dimension = dimensionComputed;
  const versionQueryComputed = computed(() => {
    const { appid, uni_platform } = queryState.value;
    const query = stringifyQuery({
      appid,
      uni_platform,
      // type: 'native_app'
    });

    return query;
  });
  const versionQuery = versionQueryComputed;
  const useDatetimePickerAction = () => {
    currentDateTabState.value = -1;
  };
  const useDatetimePicker = useDatetimePickerAction;
  const changePlatformAction = (id, index, name, item) => {
    queryState.value.version_id = 0;
    queryState.value.uni_platform = item.code;
  };
  const changePlatform = changePlatformAction;
  const changeTimeRangeAction = (id, index) => {
    currentDateTabState.value = index;
    const start = getTimeOfSomeDayAgo(id),
      end = getTimeOfSomeDayAgo(0) - 1;
    queryState.value.start_time = [start, end];
  };
  const changeTimeRange = changeTimeRangeAction;
  const changePageCurrentAction = (e) => {
    optionsState.value.pageCurrent = e.current;
    getTabelDataAction(queryStrComputed.value);
  };
  const changePageCurrent = changePageCurrentAction;
  const changePageSizeAction = (pageSize) => {
    optionsState.value.pageSize = pageSize;
    optionsState.value.pageCurrent = 1; // 重置分页
    // 重置分页
    getTabelDataAction(queryStrComputed.value);
  };
  const changePageSize = changePageSizeAction;
  const changeChartTabAction = (id, index, name) => {
    getChartDataAction(queryStrComputed.value, id, name);
  };
  const changeChartTab = changeChartTabAction;
  const getAllDataAction = (query) => {
    if (query.indexOf('appid') === -1) {
      errorMessageState.value = '请先选择应用';
      return; // 如果appid为空，则不进行查询
    }

    errorMessageState.value = '';
    getPanelDataAction(query);
    getChartDataAction(query);
    getTabelDataAction(query);
  };
  const getAllData = getAllDataAction;
  const getChartDataAction = (query, field = chartTabState.value) => {
    // this.chartData = {}
    const { pageCurrent } = optionsState.value;
    query = JSON.parse(JSON.stringify(queryState.value));
    query.dimension = 'day';
    let querystr = stringifyQuery(query, false, ['uni_platform']);
    const db = uniCloud.database();
    db.collection('uni-stat-result')
      .where(querystr)
      .field(`${stringifyField(fieldsMapSource, field)},start_time,channel_id`)
      .groupBy('channel_id,start_time')
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
              name: '暂无数据',
              data: [],
            },
          ],
        };
        const xAxis = options.categories;
        if (dimensionComputed.value === 'hour') {
          for (let i = 0; i < 24; ++i) {
            const hour = i < 10 ? '0' + i : i;
            const x = `${hour}:00 ~ ${hour}:59`;
            xAxis.push(x);
          }
        }
        // 将数据中渠道 id 去重
        const hasChannels = [];
        data.forEach((item) => {
          if (hasChannels.indexOf(item.channel_id) < 0) {
            hasChannels.push(item.channel_id);
          }
        });
        // 请求所有渠道数据，与 hasChannels 匹配得出 channel_name
        let allChannels = [];
        getChannelsAction()
          .then((res) => {
            allChannels = res.result.data;
          })
          .finally(() => {
            hasChannels.forEach((channel, index) => {
              const c = allChannels.find((item) => item._id === channel);
              const line = (options.series[index] = {
                name: (c && c.channel_name) || '未知',
                data: [],
              });
              if (dimensionComputed.value === 'hour') {
                for (let i = 0; i < 24; ++i) {
                  line.data[i] = 0;
                }
              }
              let mapper = fieldsMapSource.filter((f) => f.field === field);
              mapper = JSON.parse(JSON.stringify(mapper));
              delete mapper[0].value;
              mapper[0].formatter = '';
              for (const item of data) {
                // 将 item 根据 mapper 计算、格式化
                mapfields(mapper, item, item);
                let date = item.start_time;
                const x = formatDate(date, dimensionComputed.value);
                let y = item[field];
                const dateIndex = xAxis.indexOf(x);
                if (channel === item.channel_id) {
                  if (dateIndex < 0) {
                    xAxis.push(x);
                    line.data.push(y);
                  } else {
                    line.data[dateIndex] = y;
                  }
                }
              }
            });
            chartDataState.value = options;
          });
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
  const getChannelsAction = () => {
    const db = uniCloud.database();
    return db.collection('uni-stat-app-channels').get();
  };
  const getChannels = getChannelsAction;
  const getTabelDataAction = (query) => {
    const { pageCurrent } = optionsState.value;
    loadingState.value = true;
    let querystr = stringifyQuery(queryState.value, false, ['uni_platform']);
    const db = uniCloud.database();
    db.collection('uni-stat-result')
      .where(querystr)
      .field(`${stringifyField(fieldsMapSource)},appid, channel_id`)
      .groupBy('appid, channel_id')
      .groupField(stringifyGroupField(fieldsMapSource))
      .orderBy('new_device_count', 'desc')
      .skip((pageCurrent - 1) * optionsState.value.pageSize)
      .limit(optionsState.value.pageSize)
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        getChannelsAction()
          .then((res) => {
            const channels = res.result.data;
            for (const item of data) {
              channels.forEach((channel) => {
                if (item.channel_id === channel._id) {
                  item.channel_code = channel.channel_code;
                  item.channel_name = channel.channel_name;
                }
              });
            }
          })
          .finally(() => {
            for (const item of data) {
              mapfields(fieldsMapSource, item, item);
            }
            tableDataState.value = [];
            optionsState.value.total = count;
            tableDataState.value = data;
          });
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
    // let cloneQuery = JSON.parse(JSON.stringify(this.query))
    // cloneQuery.dimension = 'day'
    // let query = stringifyQuery(cloneQuery)
    let query = JSON.parse(JSON.stringify(queryState.value));
    query.dimension = 'day';
    let querystr = stringifyQuery(query, false, ['uni_platform']);
    const db = uniCloud.database();
    const subTable = db
      .collection('uni-stat-result')
      .where(querystr)
      .field(stringifyField(fieldsMapSource))
      .groupBy('appid')
      .groupField(stringifyGroupField(fieldsMapSource))
      .orderBy('start_time', 'desc')
      .get()
      .then((res) => {
        const item = res.result.data[0];
        item && (item.total_devices = 0);
        getFieldTotal.call(getFieldTotalContext, query);
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
    getAllDataAction(queryStrComputed.value);
  }, 300);
</script>

<style>
  .uni-stat-panel {
    box-shadow: unset;
    border-bottom: 1px solid #eee;
    padding: 0;
    margin: 0 15px;
  }
</style>
