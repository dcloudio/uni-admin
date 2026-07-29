<template>
  <!-- 对应页面：渠道（app）  -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <view class="uni-sub-title hide-on-phone">
          <uni-link
            href="https://ask.dcloud.net.cn/article/35974"
            text="支持Android App多渠道统计。设置App渠道包的方法，请参考 https://ask.dcloud.net.cn/article/35974。"
          ></uni-link>
        </view>
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
            :storage="false"
            :where="versionQuery"
            class="ml-m"
            field="_id as value, version as text, uni_platform as label, create_date as date"
            format="{label} - {text}"
            orderby="date desc"
            label="版本选择"
            v-model="query.version_id"
          />
        </view>
        <uni-stat-tabs label="平台选择" type="boldLine" mode="platform-channel" :all="false" v-model="query.platform_id" @change="changePlatform" />
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
      <view class="uni-stat--x" style="padding: 15px 0">
        <uni-stat-panel :items="panelData" class="uni-stat-panel" />
        <uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
        <view class="uni-charts-box">
          <qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp tooltipFormat="tooltipCustom" :errorMessage="errorMessage" />
        </view>
      </view>

      <view class="uni-stat--x p-m">
        <view class="mb-m">
          <uni-link color="" href="https://ask.dcloud.net.cn/article/35974" text="如何自定义渠道包?"></uni-link>
        </view>
        <uni-table :loading="loading" border stripe :emptyText="errorMessage || $t('common.empty')">
          <uni-tr>
            <block v-for="(mapper, index) in fieldsMap.slice(0, fieldsMap.length - 1)" :key="index">
              <uni-th v-if="mapper.title" :key="index" align="center">
                {{ mapper.title }}
              </uni-th>
            </block>
          </uni-tr>
          <uni-tr v-for="(item, i) in tableData" :key="i">
            <block v-for="(mapper, index) in fieldsMap.slice(0, fieldsMap.length - 1)" :key="index">
              <uni-td v-if="mapper.title && index === 1" :key="mapper.field" class="uni-stat-edit--x">
                {{ item[mapper.field] ? item[mapper.field] : '-' }}
                <uni-icons type="compose" color="#2979ff" size="25" class="uni-stat-edit--btn" @click="inputDialogToggle(item.channel_code, item.channel_name)" />
              </uni-td>
              <uni-td v-else="mapper.title" :key="mapper.field" align="center">
                {{ item[mapper.field] !== undefined ? item[mapper.field] : '-' }}
              </uni-td>
            </block>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination
            show-icon
            show-page-size
            :page-size="paginationOptions.pageSize"
            :current="paginationOptions.pageCurrent"
            :total="paginationOptions.total"
            @change="changePageCurrent"
            @pageSizeChange="changePageSize"
          />
        </view>
      </view>
    </view>
    <uni-popup ref="inputDialogRef" type="dialog" :maskClick="true">
      <uni-popup-dialog ref="inputClose" mode="input" title="请编辑名称" v-model="updateValue" placeholder="请输入内容" @confirm="editName"></uni-popup-dialog>
    </uni-popup>

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
    // 统计范围 day:按天统计，hour:按小时统计
    dimension: 'day',
    // 应用id
    appid: '',
    // 平台
    uni_platform: 'android',
    // 平台id
    platform_id: '',
    // 版本号
    version_id: '',
    // 开始时间
    start_time: [],
  });
  const query = queryState;
  const paginationOptionsState = ref({
    pageSize: 20,
    pageCurrent: 1,
    // 当前页
    total: 0, // 数据总量
  });
  const paginationOptions = paginationOptionsState;
  const loadingState = ref(false);
  const loading = loadingState;
  const currentDateTabState = ref(1);
  const currentDateTab = currentDateTabState;
  const daysState = ref(0);
  const days = daysState;
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const panelDataState = ref(fieldsMapSource.filter((f) => f.hasOwnProperty('value')));
  const panelData = panelDataState;
  const chartDataState = ref({});
  const chartData = chartDataState;
  const chartTabState = ref('new_device_count');
  const chartTab = chartTabState;
  const queryIdState = ref('');
  const queryId = queryIdState;
  const updateValueState = ref('');
  const updateValue = updateValueState;
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const debounceGetState = ref(undefined);
  const debounceGet = debounceGetState;
  const inputDialogRef = ref(null);
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
      type: 'native_app',
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
    paginationOptionsState.value.pageCurrent = e.current;
    getTableDataAction();
  };
  const changePageCurrent = changePageCurrentAction;
  const changePageSizeAction = (pageSize) => {
    paginationOptionsState.value.pageSize = pageSize;
    paginationOptionsState.value.pageCurrent = 1; // 重置分页
    // 重置分页
    getTableDataAction();
  };
  const changePageSize = changePageSizeAction;
  const changeChartTabAction = (id, index, name) => {
    getChartDataAction(id, name);
  };
  const changeChartTab = changeChartTabAction;
  const getAllDataAction = (query) => {
    if (!queryState.value.appid) {
      errorMessageState.value = '请先选择应用';
      return;
    }
    errorMessageState.value = '';
    getPanelDataAction();
    getChartDataAction();
    getTableDataAction();
  };
  const getAllData = getAllDataAction;
  const getChartDataAction = (field = chartTabState.value) => {
    // this.chartData = {}
    let querystr = stringifyQuery(queryState.value, false, ['uni_platform']);
    const { pageCurrent } = paginationOptionsState.value;
    const db = uniCloud.database();
    db.collection('uni-stat-result')
      .where(querystr)
      .field(`${stringifyField(fieldsMapSource, field)}, start_time, channel_id`)
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
              // TODO 需要做个排序，暂时排序还是有问题的
              // allChannels = allChannels.sort((a,b)=>{ return a.channel_code.localeCompare(b.channel_code)})
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
            options.series = options.series.sort((a, b) => {
              return a.name.localeCompare(b.name);
            });
            chartDataState.value = options;
          });
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
      })
      .finally(() => {});
  };
  const getChartData = getChartDataAction;
  const getChannelsAction = () => {
    const db = uniCloud.database();
    return db
      .collection('uni-stat-app-channels')
      .where(
        stringifyQuery({
          appid: queryState.value.appid,
          platform_id: queryState.value.platform_id,
        })
      )
      .get();
  };
  const getChannels = getChannelsAction;
  const getTableDataAction = () => {
    const query = stringifyQuery(queryState.value, false, ['uni_platform']);
    const { pageCurrent } = paginationOptionsState.value;
    loadingState.value = true;
    const db = uniCloud.database();
    db.collection('uni-stat-result')
      .where(query)
      .field(`${stringifyField(fieldsMapSource)},appid, channel_id`)
      .groupBy('appid, channel_id')
      .groupField(stringifyGroupField(fieldsMapSource))
      .orderBy('new_device_count', 'desc')
      .skip((pageCurrent - 1) * paginationOptionsState.value.pageSize)
      .limit(paginationOptionsState.value.pageSize)
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
              mapfields(fieldsMapSource, item, item, 'total_');
            }
            tableDataState.value = [];
            paginationOptionsState.value.total = count;
            tableDataState.value = data;
            loadingState.value = false;
          });
      })
      .catch((err) => {
        console.error(err);
        // err.message 错误信息
        // err.code 错误码
        loadingState.value = false;
      });
  };
  const getTableData = getTableDataAction;
  const createStrAction = (maps, fn, prefix = 'total_') => {
    const strArr = [];
    maps.forEach((mapper) => {
      if (field.hasOwnProperty('value')) {
        const fieldName = mapper.field;
        strArr.push(`${fn}(${fieldName}) as ${prefix + fieldName}`);
      }
    });
    return strArr.join();
  };
  const createStr = createStrAction;
  const getPanelDataAction = () => {
    let query = JSON.parse(JSON.stringify(queryState.value));
    query.dimension = 'day';
    // let query = stringifyQuery(cloneQuery)
    // let query = stringifyQuery(cloneQuery)
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
  const inputDialogToggleAction = (queryId, updateValue) => {
    queryIdState.value = queryId;
    updateValueState.value = updateValue;
    inputDialogRef.value.open();
  };
  const inputDialogToggle = inputDialogToggleAction;
  const editNameAction = (value) => {
    // 使用 clientDB 提交数据
    const db = uniCloud.database();
    db.collection('uni-stat-app-channels')
      .where({
        channel_code: queryIdState.value,
      })
      .update({
        channel_name: value,
      })
      .then((res) => {
        uni.showToast({
          title: '修改成功',
        });
        getTableDataAction();
      })
      .catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false,
        });
      })
      .finally(() => {
        uni.hideLoading();
      });
  };
  const editName = editNameAction;
  watch(
    () => queryState.value,
    (val) => {
      paginationOptionsState.value.pageCurrent = 1; // 重置分页
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

  .uni-stat-edit--x {
    display: flex;
    justify-content: space-between;
  }

  .uni-stat-edit--btn {
    cursor: pointer;
  }
</style>
