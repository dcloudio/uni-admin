<template>
  <!-- 对应页面：注册用户统计-粘性  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <view class="uni-sub-title hide-on-phone">用户忠诚度用户对您应用的访问深度及访问频次情况。助您了解用户对应用的粘度，尤其在对内容改进后，效果是否有所提升</view>
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
      <view class="uni-stat--x mb-l" style="padding-top: 0">
        <view class="mb-m line-bottom">
          <uni-stat-tabs type="boldLine" :tabs="types" v-model="type" style="line-height: 40px; margin-bottom: -17px" />
        </view>
        <view class="p-m">
          <view class="uni-charts-box">
            <qiun-data-charts type="pie" :chartData="chartData" echartsH5 echartsApp :errorMessage="errorMessage" />
          </view>
        </view>
      </view>
      <view class="uni-stat--x p-m">
        <uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" />
      </view>
    </view>

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { mapfields, stringifyQuery, getTimeOfSomeDayAgo, division, format, debounce } from '@/js_sdk/uni-stat/util.js';
  import fieldsMapSource from './fieldsMap.js';
  import { computed, ref, watch } from 'vue';
  const fieldsMapState = ref(fieldsMapSource);
  const fieldsMap = fieldsMapState;
  const queryState = ref({
    // dimension: "hour",
    appid: '',
    platform_id: '',
    uni_platform: '',
    version_id: '',
    channel_id: '',
    start_time: [],
  });
  const query = queryState;
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
  const typeState = ref('visit_depth_data');
  const type = typeState;
  const typesState = ref([
    {
      _id: 'visit_depth_data',
      name: '访问页数',
    },
    {
      _id: 'duration_data',
      name: '访问时长',
    },
  ]);
  const types = typesState;
  const fieldState = ref('visit_users');
  const field = fieldState;
  const fieldsState = ref([
    {
      _id: 'visit_users',
      name: '访问人数',
    },
    {
      _id: 'visit_times',
      name: '访问次数',
    },
  ]);
  const fields = fieldsState;
  const optionsState = ref({
    visit_depth_data: {
      prefix: 'p',
      title: '页',
      value: [1, 2, 3, 4, 5, 10],
    },
    duration_data: {
      prefix: 's',
      title: '秒',
      value: [0, 3, 6, 11, 21, 31, 51, 100],
    },
  });
  const options = optionsState;
  const channelDataState = ref([]);
  const channelData = channelDataState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const debounceGetState = ref(undefined);
  const debounceGet = debounceGetState;
  const fieldNameComputed = computed(() => {
    return fieldsState.value.forEach((item) => {
      if (item._id === fieldState.value) {
        return item.name;
      }
    });
  });
  const fieldName = fieldNameComputed;
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
  const createStrAction = (fields, type = 'visit_depth_data') => {
    const l = fields.length;
    const p = optionsState.value[type].prefix;
    const value = optionsState.value[type].value;
    const strArr = value.map((item) => {
      return fields.map((field) => {
        return `sum(${type}.${field}.${p + '_' + item}) as ${l > 1 ? field + '_' + p + '_' + item : p + '_' + item}`;
      });
    });
    const str = strArr.join();
    return str;
  };
  const createStr = createStrAction;
  const parseCharsAction = (str) => {
    str = str.split('_');
    const option = optionsState.value[typeState.value];
    let chars = option.title;
    const strArr = option.value.forEach((val, i) => {
      const next = option.value[i + 1];
      if (val === Number(str[str.length - 1])) {
        if (!next) {
          chars = val + '+' + chars;
        } else if (val + 1 === next) {
          chars = val + chars;
        } else {
          chars = val + '-' + (next - 1) + chars;
        }
      }
    });
    return chars;
  };
  const parseChars = parseCharsAction;
  const getAllDataAction = (query) => {
    if (!query.appid) {
      errorMessageState.value = '请先选择应用';
      return; // 如果appid为空，则不进行查询
    }

    errorMessageState.value = '';
    getChartDataAction(query, fieldState.value, fieldNameComputed.value);
    getTabelDataAction(query);
  };
  const getAllData = getAllDataAction;
  const getChartDataAction = (query, field = fieldState.value, name = fieldsState.value.find((f) => f._id === fieldState.value).name) => {
    // this.chartData = {}
    query = stringifyQuery(query, null, ['uni_platform']);
    const groupField = createStrAction([field], typeState.value);
    const db = uniCloud.database();
    db.collection('uni-stat-loyalty-result')
      .where(query)
      .groupBy('appid')
      .groupField(groupField)
      .orderBy('start_time', 'asc')
      .get({
        getCount: true,
      })
      .then((res) => {
        let { count, data } = res.result;
        data = data[0];
        const options = {
          series: [
            {
              data: [],
            },
          ],
        };
        for (const key in data) {
          if (key !== 'appid') {
            const x = parseCharsAction(key);
            const y = data[key];
            options.series[0].data.push({
              name: x,
              value: y,
            });
          }
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
    query = stringifyQuery(query, null, ['uni_platform']);
    const groupField = createStrAction(['visit_users', 'visit_times'], typeState.value);
    fieldsMapState.value[0].title = typesState.value.find((t) => t._id === typeState.value).name;
    loadingState.value = true;
    const db = uniCloud.database();
    db.collection('uni-stat-loyalty-result')
      .where(query)
      .groupBy('appid')
      .groupField(groupField)
      .orderBy('start_time', 'asc')
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        const type = typeState.value;
        const rows = [];
        let splitor = optionsState.value[type].prefix;
        splitor = `_${splitor}_`;
        for (const item of data) {
          for (const key in item) {
            if (key !== 'appid') {
              const row = {};
              const keys = key.split(splitor);
              row.name = keys[1];
              row[keys[0]] = item[key];
              rows.push(row);
            }
          }
        }
        const tableData = [];
        const total = {};
        // 归并得出访问人数 users、访问次数 times 的总和，用于计算占比
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        let users = rows.filter((row) => row.visit_users).map((row) => row.visit_users);
        users = users.length ? users.reduce(reducer) : 0;
        let times = rows.filter((row) => row.visit_times).map((row) => row.visit_times);
        times = times.length ? times.reduce(reducer) : 0;
        total.visit_times = times;
        total.visit_users = users;
        optionsState.value[type].value.forEach((val) => {
          const item = {};
          item.name = val + 'p';
          rows.forEach((row) => {
            if (Number(row.name) === val) {
              for (const key in row) {
                if (key !== name) {
                  item[key] = row[key];
                  item['total_' + key] = total[key];
                }
              }
            }
          });
          item.name = parseCharsAction(String(val));
          tableData.push(item);
        });
        for (const item of tableData) {
          mapfields(fieldsMapSource, item, item);
        }
        // this.options.total = count
        tableDataState.value = [];
        tableDataState.value = tableData;
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
      debounceGetState.value();
    },
    {
      deep: true,
    }
  );
  watch(
    () => typeState.value,
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

  .uni-stat-panel {
    box-shadow: unset;
    border-bottom: 1px solid #eee;
    padding: 0;
    margin: 0 15px;
  }
</style>
