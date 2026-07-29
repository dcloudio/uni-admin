<template>
  <view class="uni-stat--x p-m">
    <view class="uni-stat-card-header">漏斗分析</view>
    <!-- 时间纬度 -->
    <view class="flex">
      <uni-stat-tabs type="box" :current="dateTabs.index" :tabs="dateTabs.list" @change="dateTabsChange" />
      <uni-datetime-picker
        type="date"
        v-model="dateTabs.time"
        :end="Date.now()"
        return-type="timestamp"
        :clear-icon="false"
        class="uni-stat-datetime-picker"
        @change="datePickerChange"
      />
      <view class="uni-stat--tips" v-if="dateTabs.timeStr">当前时间范围：{{ dateTabs.timeStr }}</view>
    </view>
    <!-- 漏斗 -->
    <view class="uni-charts-box" v-if="!notData">
      <qiun-data-charts type="funnel" :chartData="chartData" :opts="opts" :errorMessage="errorMessage" />
    </view>
    <view class="uni-charts-box flex center" v-else>
      <view>暂无数据</view>
    </view>
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
  import timeUtil from '@/js_sdk/uni-stat/timeUtil.js';
  import { fieldsMap as fieldsMapSource } from '../fieldsMap.js';
  import { ref, watch } from 'vue';
  const props = defineProps({
    // 组件外部查询条件，一般包含 appid version_id platform_id
    query: {
      type: [Object],
      default: function () {
        return {};
      },
    },
  });
  const tableNameState = ref('uni-stat-pay-result');
  const tableName = tableNameState;
  const fieldsMapState = ref(fieldsMapSource);
  const fieldsMap = fieldsMapState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const notDataState = ref(false);
  const notData = notDataState;
  const optsState = ref({
    color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc'],
    padding: [15, 15, 0, 15],
    extra: {
      funnel: {
        activeOpacity: 0.3,
        activeWidth: 10,
        border: true,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        fillOpacity: 1,
        labelAlign: 'right',
        linearType: 'custom',
        minSize: 20,
      },
    },
  });
  const opts = optsState;
  const dateTabsState = ref({
    time: Date.now(),
    timeStr: '',
    index: 0,
    list: [
      {
        _id: 'day',
        name: '日维度',
      },
      {
        _id: 'week',
        name: '周维度',
      },
      {
        _id: 'month',
        name: '月维度',
      },
    ],
  });
  const dateTabs = dateTabsState;
  const getCloudDataDebounceState = ref(undefined);
  const getCloudDataDebounce = getCloudDataDebounceState;
  const calcPercentageAction = (v1, v2) => {
    return v2 > 0 ? parseFloat(((v1 / v2) * 100).toFixed(2)) : 0;
  };
  const calcPercentage = calcPercentageAction;
  const getCloudDataAction = () => {
    let query = props.query;
    if (!query.appid) {
      errorMessageState.value = '请先选择应用';
      return;
    }
    errorMessageState.value = '';
    let insideQuery = getWhereAction();
    let where = {
      ...query,
      ...insideQuery,
    };
    const day = 24 * 60 * 60 * 1000;
    let start_time;
    where = stringifyQuery(where, false, ['uni_platform']);
    //console.log('where: ', where);
    //console.log('where: ', where);
    const db = uniCloud.database();
    const subTable = db
      .collection(tableNameState.value)
      .where(where)
      .field(`${stringifyField(fieldsMapSource)}, dimension, stat_date.date_str as stat_time, start_time`)
      .groupBy(`null`)
      .groupField(stringifyGroupField(fieldsMapSource))
      .get()
      .then((res) => {
        let data = res.result.data;
        if (!data.length) {
          errorMessageState.value = '暂无数据';
          return;
        }
        errorMessageState.value = '';
        //console.log('data: ', data);
        data.map((item) => {
          for (let key in item) {
            if (key.indexOf('_amount') > 1) {
              item[key] = Number((item[key] / 100).toFixed(2));
            }
          }
        });
        let { activity_device_count = 0, activity_user_count = 0, pay_user_count = 0 } = data[0] || {};
        notDataState.value = !activity_device_count && !activity_user_count && !pay_user_count ? true : false;
        let chartData = {
          series: [
            {
              data: [
                {
                  name: '活跃设备数量',
                  value: activity_device_count,
                  centerText: `${activity_device_count}`,
                  labelText: `活跃设备数`,
                },
                {
                  name: '活跃用户数量',
                  value: activity_user_count,
                  centerText: `${activity_user_count}`,
                  labelText: `活跃用户数（用户转化率：${calcPercentageAction(activity_user_count, activity_device_count)}%）`,
                },
                {
                  name: '支付用户数量',
                  value: pay_user_count,
                  centerText: `${pay_user_count}`,
                  labelText: `支付用户数（支付转化率：${calcPercentageAction(pay_user_count, activity_user_count)}%）`,
                },
              ],
            },
          ],
        };
        chartDataState.value = chartData;
      });
  };
  const getCloudData = getCloudDataAction;
  const dateTabsChangeAction = (id, index) => {
    dateTabsState.value.index = index;
    getCloudDataAction();
  };
  const dateTabsChange = dateTabsChangeAction;
  const datePickerChangeAction = (time) => {
    dateTabsState.value.time = time;
    getCloudDataAction();
  };
  const datePickerChange = datePickerChangeAction;
  const getWhereAction = () => {
    let time = dateTabsState.value.time; // 当前选择的时间
    // 当前选择的时间
    let dimension = dateTabsState.value.list[dateTabsState.value.index]._id || 'day'; // 获取时间纬度
    // 获取时间纬度
    let start_time = [];
    if (dimension === 'day') {
      let { startTime, endTime } = timeUtil.getOffsetStartAndEnd('day', 0, time);
      start_time = [startTime, endTime];
    } else if (dimension === 'week') {
      let { startTime, endTime } = timeUtil.getOffsetStartAndEnd('week', 0, time);
      start_time = [startTime, endTime];
    } else if (dimension === 'month') {
      let { startTime, endTime } = timeUtil.getOffsetStartAndEnd('month', 0, time);
      start_time = [startTime, endTime];
    }
    dateTabsState.value.timeStr = `${timeUtil.timeFormat(start_time[0])} ~ ${timeUtil.timeFormat(start_time[1])}`;
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
  }, 400);
  getCloudDataDebounceState.value();
</script>

<style lang="scss" scoped>
  .flex.center {
    justify-content: center;
    align-items: center;
    color: #666;
  }
</style>
