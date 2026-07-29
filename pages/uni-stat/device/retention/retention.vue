<template>
  <!-- 对应页面：设备统计-留存  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <view class="uni-sub-title hide-on-phone">设备留存趋势分析</view>
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
      <view class="uni-stat--x mb-m" style="padding-top: 0">
        <view class="mb-m line-bottom">
          <uni-stat-tabs type="boldLine" :tabs="fields" v-model="field" tooltip style="line-height: 40px; margin-bottom: -17px" />
        </view>
        <uni-stat-tabs type="box" :tabs="keys" v-model="key" class="mb-l" />
        <view class="p-m">
          <view class="uni-charts-box">
            <qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp tooltipFormat="tooltipCustom" :errorMessage="errorMessage" />
          </view>
        </view>
      </view>
      <view class="uni-stat--x p-m">
        <view class="uni-tips mb-s flex">
          <uni-icons type="info"></uni-icons>
          表格中显示为空，表示留存为 0 或无数据
        </view>
        <uni-table :loading="loading" stripe :emptyText="errorMessage || $t('common.empty')">
          <uni-tr style="background-color: #eee">
            <block v-for="(mapper, index) in fieldsMap" :key="index">
              <uni-th v-if="mapper.title" :key="index" align="center">{{ mapper.title }}</uni-th>
            </block>
          </uni-tr>
          <uni-tr v-for="(item, i) in tableData" :key="i">
            <block v-for="(mapper, index) in fieldsMap" :key="index">
              <uni-td v-if="mapper.title" :key="index" align="center" :class="/[d|w|m]_\d/.test(mapper.field) && [item[mapper.field] ? 'uni-stat-table-bg' : '']">
                {{ item[mapper.field] ? item[mapper.field] : '' }}
              </uni-td>
            </block>
          </uni-tr>
        </uni-table>
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
    stringifyField as stringifyFieldSource,
    stringifyGroupField,
    getTimeOfSomeDayAgo,
    division,
    format,
    formatDate,
    debounce,
  } from '@/js_sdk/uni-stat/util.js';
  import fieldsFactory from './fieldsMap.js';
  import { computed, ref, watch } from 'vue';
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
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const fieldState = ref('new_device');
  const field = fieldState;
  const fieldsState = ref([
    {
      _id: 'new_device',
      name: '新增留存',
      tooltip: '指定时间新增（即首次访问应用）用户，在之后的第N天，再次访问应用的用户数占比',
    },
    {
      _id: 'active_device',
      name: '活跃留存',
      tooltip: '指定时间活跃（即访问应用）用户，在之后的第N天，再次访问应用的用户数占比',
    },
  ]);
  const fields = fieldsState;
  const keyState = ref(1);
  const key = keyState;
  const channelDataState = ref([]);
  const channelData = channelDataState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const debounceGetState = ref(undefined);
  const debounceGet = debounceGetState;
  const fieldsMapComputed = computed(() => {
    const title = fieldState.value === 'active_device' ? '活跃用户' : '新增用户';
    const maps = [
      {
        title,
        field: `${fieldState.value}_count`,
        stat: 0,
      },
    ];
    return fieldsFactory(maps);
  });
  const fieldsMap = fieldsMapComputed;
  const fieldNameComputed = computed(() => {
    let name = '';
    fieldsState.value.forEach((item) => {
      if (item._id === fieldState.value) {
        name = item.name;
      }
    });
    return name;
  });
  const fieldName = fieldNameComputed;
  const keyNameComputed = computed(() => {
    return keysComputed.value.forEach((item) => {
      if (item._id === keyState.value) {
        return item.name;
      }
    });
  });
  const keyName = keyNameComputed;
  const keysComputed = computed(() => {
    const values = [1, 2, 3, 4, 5, 6, 7, 14, 30];
    return values.map((val) => {
      return {
        _id: val,
        name: `${val}天后`,
      };
    });
  });
  const keys = keysComputed;
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
    const start = getTimeOfSomeDayAgo(id),
      end = getTimeOfSomeDayAgo(0) - 1;
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
  const stringifyFieldAction = (mapping, goal, prop) => {
    if (goal) {
      mapping = mapping.filter((f) => f.field === goal);
    }
    if (prop) {
      mapping = mapping.filter((f) => f.field && f.hasOwnProperty(prop));
    }
    const fields = mapping
      .map((f) => {
        if (f.stat === -1) {
          return f.field;
        } else if (f.stat === 0) {
          return `${f.field} as ${'temp_' + f.field}`;
        } else {
          return `retention.${fieldState.value}.${f.field}.device_count as ${'temp_' + f.field}`;
        }
      })
      .join();
    return fields;
  };
  const stringifyField = stringifyFieldAction;
  const createStrAction = (type = 'device_count', vals, fields, tail) => {
    const value = vals || [1, 2, 3, 4, 5, 6, 7, 14, 30];
    const p = 'd';
    const f = fieldsState.value.map((item) => item._id);
    fields = fields || f;
    const strArr = value.map((item) => {
      return fields.map((field) => {
        return `retention.${field}.${p + '_' + item}.${type} as ${p + '_' + item}`;
      });
    });
    if (tail) {
      strArr.push(tail);
    }
    const str = strArr.join();
    return str;
  };
  const createStr = createStrAction;
  const getAllDataAction = (query) => {
    if (!queryState.value.appid) {
      errorMessageState.value = '请先选择应用';
      return;
    }
    errorMessageState.value = '';
    getChartDataAction(query, keyState.value, keyNameComputed.value);
    getTabelDataAction(query);
  };
  const getAllData = getAllDataAction;
  const getChartDataAction = (query, key = keyState.value, name = '访问人数') => {
    // this.chartData = {}
    const { pageCurrent } = optionsState.value;
    query = stringifyQuery(query, null, ['uni_platform']);
    const groupField = createStrAction('device_count', [key], [fieldState.value]);
    const db = uniCloud.database();
    db.collection('uni-stat-result')
      .where(query)
      .field(`${stringifyFieldAction(fieldsMapComputed.value, `d_${key}`)}, start_time`)
      .groupBy('start_time')
      .groupField(stringifyGroupField(fieldsMapComputed.value, `d_${key}`))
      .orderBy('start_time', 'asc')
      .get({
        getCount: true,
      })
      .then((res) => {
        let { count, data } = res.result;
        const options = {
          categories: [],
          series: [
            {
              name: `${key}天后${fieldNameComputed.value}`,
              data: [],
            },
          ],
        };
        for (const item of data) {
          const x = formatDate(item.start_time, 'day');
          const y = item[`d_${key}`];
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
    query = stringifyQuery(query, null, ['uni_platform']);
    const tail = fieldState.value + '_count';
    const groupField = createStrAction('user_rate', '', [fieldState.value], tail);
    loadingState.value = true;
    const db = uniCloud.database();
    db.collection('uni-stat-result')
      .where(query)
      .field(stringifyFieldAction(fieldsMapComputed.value))
      .groupBy('start_time')
      .groupField(stringifyGroupField(fieldsMapComputed.value))
      .orderBy('start_time', 'desc')
      .skip((pageCurrent - 1) * optionsState.value.pageSize)
      .limit(optionsState.value.pageSize)
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        for (const item of data) {
          mapfields(fieldsMapComputed.value, item, item);
        }
        optionsState.value.total = count;
        tableDataState.value = [];
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
  watch(
    () => keyState.value,
    () => {
      debounceGetState.value();
    }
  );
  watch(
    () => fieldState.value,
    () => {
      debounceGetState.value();
    }
  );
  debounceGetState.value = debounce(() => {
    getAllDataAction(queryState.value);
  }, 300);
  getChannelDataAction();
</script>

<style lang="scss">
  .flex {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .label-text {
    font-size: 14px;
    color: #666;
    margin: auto 0;
    margin-right: 5px;
  }

  .line-bottom {
    border-bottom: 2px solid #eee;
  }

  .uni-stat-table-bg {
    background-color: #4e82d9;
    color: #fff;
  }
</style>
