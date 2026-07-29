<template>
  <!-- 对应页面： js报错 -->
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group hide-on-phone">
        <view class="uni-sub-title">开发者可以在这里快速查询应用最近出现的具体错误内容，了解错误概况信息，以便快速修复问题</view>
      </view>
    </view>
    <view class="uni-container">
      <view class="uni-stat--x flex p-1015">
        <uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc" :defItem="1" label="应用选择" v-model="query.appid" :clear="false" />
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
      <view class="uni-stat--x flex">
        <uni-stat-tabs label="日期选择" :current="currentDateTab" :yesterday="false" mode="date" @change="changeTimeRange" />
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
      <view class="uni-stat--x" style="padding: 15px 0">
        <uni-stat-panel :items="panelData" class="uni-stat-panel" />
        <uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" />
        <view class="uni-charts-box">
          <qiun-data-charts type="area" :chartData="chartData" :eopts="{ notMerge: true }" echartsH5 echartsApp tooltipFormat="tooltipCustom" :errorMessage="errorMessage" />
        </view>
      </view>

      <view class="uni-stat--x p-m">
        <view class="flex-between">
          <view class="uni-stat-card-header">信息列表</view>
          <view class="uni-group">
            <!-- #ifdef H5 -->
            <button v-if="sourceMapEnabled" class="uni-button" type="primary" size="mini" @click="openUploadPopup">上传 sourceMap</button>
            <!-- #endif -->
          </view>
        </view>
        <uni-table :loading="loading" border stripe :emptyText="errorMessage || $t('common.empty')">
          <uni-tr>
            <block v-for="(mapper, index) in fieldsMap" :key="index">
              <uni-th v-if="mapper.title" :key="index" align="center">
                <!-- #ifdef MP -->
                {{ mapper.title }}
                <!-- #endif -->
                <!-- #ifndef MP -->
                <uni-tooltip>
                  {{ mapper.title }}
                  <uni-icons v-if="mapper.tooltip" type="help" color="#666" />
                  <template v-if="mapper.tooltip" v-slot:content>
                    <view class="uni-stat-tooltip-s">
                      {{ mapper.tooltip }}
                    </view>
                  </template>
                </uni-tooltip>
                <!-- #endif -->
              </uni-th>
            </block>
            <uni-th align="center" v-if="sourceMapEnabled">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, i) in tableData" :key="i">
            <block v-for="(mapper, index) in fieldsMap" :key="index">
              <uni-td v-if="mapper.field === 'count'" :key="mapper.field" align="center">
                <text class="link-btn" @click="navTo('detail', item)">
                  {{ item[mapper.field] !== undefined ? item[mapper.field] : '-' }}
                </text>
              </uni-td>
              <uni-td v-else :key="mapper.field" align="center">
                {{ item[mapper.field] !== undefined ? item[mapper.field] : '-' }}
              </uni-td>
            </block>
            <uni-td v-if="sourceMapEnabled">
              <button size="mini" type="primary" style="white-space: nowrap" @click="openErrPopup(item)">详 情</button>
            </uni-td>
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

    <uni-popup ref="errMsgPopup" type="center" :animation="false" :maskClick="true" @change="errMsgPopupChange">
      <view class="modal black-theme">
        <view class="modal-header">错误详情</view>
        <scroll-view scroll-x="true" scroll-y="true">
          <view class="modal-content" style="padding: 20px 30px">
            <view v-if="msgLoading" style="margin: 150px 0; text-align: center; font-size: 14px">
              <uni-load-more class="mb-m" :showText="false" status="loading" />
              <view>正在解析，请稍等...</view>
            </view>
            <text>{{ errMsg }}</text>
          </view>
        </scroll-view>
        <view class="dialog-close" @click="closeErrPopup">
          <view class="dialog-close-plus" data-id="close"></view>
          <view class="dialog-close-plus dialog-close-rotate" data-id="close"></view>
        </view>
      </view>
    </uni-popup>

    <!-- #ifdef H5 -->
    <uni-drawer class="sourcemap-drawser" ref="uploadDrawer" mode="right" :mask-click="true" :width="340">
      <view class="modal" style="max-width: none; min-width: auto; padding: 0 10px">
        <view class="modal-header">上传 sourceMap</view>
        <view class="modal-content" style="height: 300px; padding: 0">
          <view style="margin-top: 10px">
            <uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc" label="应用" v-model="uploadOptions.appid" />
          </view>
          <view style="margin-top: 10px">
            <uni-data-select collection="uni-stat-app-platforms" field="code as value, name as text" orderby="text asc" label="平台" v-model="uploadOptions.uni_platform" />
          </view>
          <view style="margin-top: 10px">
            <uni-data-select
              collection="opendb-app-versions"
              :where="uploadVersionQuery"
              field="version as value, version as text"
              orderby="text desc"
              label="版本"
              v-model="uploadOptions.version"
            />
          </view>
          <view class="flex m-m">
            <view class="label-text">选择文件:</view>
            <button class="uni-button ml-m" type="primary" @click="choosefile">选择文件并上传</button>
          </view>
          <view v-if="!vaildate" class="upload-msg-warning">
            {{ uploadMsg }}
          </view>
        </view>
        <view class="dialog-close" @click="closeUploadPopup">
          <view class="dialog-close-plus" style="background-color: #333" data-id="close"></view>
          <view class="dialog-close-plus dialog-close-rotate" style="background-color: #333" data-id="close"></view>
        </view>
      </view>
      <view class="upload-task-header">
        <text>上传任务：{{ uploadSuccessTasks.length }}/{{ uploadFile.tempFileTasks.length }}</text>
      </view>
      <scroll-view v-if="uploadFile.tempFileTasks.length" style="height: calc(100vh - 362px)" scroll-y="true">
        <view v-if="uploadFile.tempFileTasks.length > uploadSuccessTasks.length">
          <view class="upload-task-header">
            <text>正在上传</text>
          </view>
          <uploadTask :uploadTasks="sortUploadFileTempFileTasks"></uploadTask>
        </view>
        <view v-if="uploadSuccessTasks.length">
          <view class="upload-task-header">
            <text style="color: #42b983">上传成功</text>
          </view>
          <uploadTask :uploadTasks="uploadSuccessTasks" :showProgress="false"></uploadTask>
        </view>
      </scroll-view>
    </uni-drawer>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { computed, markRaw, reactive, ref, toRefs, watch } from 'vue';
  import {
    mapfields,
    stringifyQuery,
    getTimeOfSomeDayAgo,
    division,
    format,
    formatDate,
    parseDateTime,
    debounce,
    getAllDateCN,
    createUniStatQuery,
  } from '@/js_sdk/uni-stat/util.js';
  import { fieldsMap, popupFieldsMap } from './fieldsMap.js';
  import uploadTask from './uploadTask.vue';
  import { createSourceMapUploadState, initUploadSourcemapCloud, useSourceMap } from './sourcemap.js';
  import adminConfig from '@/admin.config.js';

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

  const errMsgPopup = ref(null);
  const uploadDrawer = ref(null);
  const state = reactive({
    uniStat: adminConfig.uniStat,
    query: {
      type: 'js',
      dimension: 'day',
      appid: '',
      platform_id: '',
      uni_platform: '',
      version_id: '',
      start_time: [],
    },
    uploadOptions: createUniStatQuery({
      appid: '',
      uni_platform: '',
    }),
    uploadMsg: '',
    options: {
      pageSize: 20,
      pageCurrent: 1,
      total: 0,
    },
    loading: false,
    popupLoading: false,
    currentDateTab: 0,
    tableData: [],
    popupTableData: [],
    panelData: JSON.parse(JSON.stringify(panelOption)),
    chartData: {},
    chartTab: 'errorCount',
    chartTabs: [
      {
        _id: 'errorCount',
        name: '错误次数',
      },
      {
        _id: 'errorRate',
        name: '错误率',
      },
    ],
    errMsg: '',
    msgLoading: false,
    uploadFile: createSourceMapUploadState(),
    uploadSuccessTaskNames: [],
    errorItem: '',
    errorMessage: '',
    parsedErrors: {},
    uploadSourcemapCloud: null,
  });

  const queryStr = computed(() => stringifyQuery(state.query));
  const versionQuery = computed(() => {
    const { appid, uni_platform } = state.query;
    return stringifyQuery(
      createUniStatQuery({
        appid,
        uni_platform,
      })
    );
  });
  const uploadVersionQuery = computed(() => {
    const { appid, uni_platform } = state.uploadOptions;
    return stringifyQuery(
      createUniStatQuery({
        appid,
        uni_platform,
      })
    );
  });
  const vaildate = computed(() => {
    const allItemHasVaule = !!(state.uploadOptions.appid && state.uploadOptions.uni_platform && state.uploadOptions.version);
    if (allItemHasVaule && state.uploadMsg) {
      state.uploadMsg = '';
    }
    return allItemHasVaule;
  });
  const uploadSuccessTasks = computed(() => state.uploadFile.tempFileTasks.filter((task) => task.state === 1));
  const sortUploadFileTempFileTasks = computed(() => state.uploadFile.tempFileTasks.filter((task) => task.state !== 1).sort((a, b) => a.state - b.state));
  const sourceMapEnabled = computed(() => true);
  const channelQuery = computed(() =>
    stringifyQuery({
      platform_id: state.query.platform_id,
    })
  );

  const sourceMapContext = new Proxy(
    {},
    {
      get(target, key) {
        if (key === '$refs') {
          return {
            errMsg: errMsgPopup.value,
            upload: uploadDrawer.value,
          };
        }
        if (key === 'vaildate') return vaildate.value;
        return state[key];
      },
      set(target, key, value) {
        state[key] = value;
        return true;
      },
    }
  );
  const { closeErrPopup, errMsgPopupChange, openUploadPopup, closeUploadPopup, choosefile, openErrPopup } = useSourceMap(sourceMapContext);

  function useDatetimePicker(res) {
    state.currentDateTab = -1;
  }

  function changePlatform(id, index, name, item) {
    state.query.version_id = 0;
    state.uploadOptions.uni_platform = item.code;
    state.query.uni_platform = item.code;
  }

  function changeTimeRange(id, index) {
    state.currentDateTab = index;
    const start = getTimeOfSomeDayAgo(id);
    const end = getTimeOfSomeDayAgo(0) - 1;
    state.query.start_time = [start, end];
  }

  function changePageCurrent(event) {
    state.options.pageCurrent = event.current;
    getTableData(queryStr.value);
  }

  function changePageSize(pageSize) {
    state.options.pageSize = pageSize;
    state.options.pageCurrent = 1;
    getTableData(queryStr.value);
  }

  function getAllData(query) {
    if (query.indexOf('appid') === -1) {
      state.errorMessage = '请先选择应用';
      return;
    }
    state.errorMessage = '';
    getChartData(query);
    getTableData(query);
  }

  function getChartData(query, field = 'day_count') {
    const querystr = stringifyQuery(state.query, false, ['uni_platform']);
    state.chartData = {};
    const { pageCurrent } = state.options;
    const db = uniCloud.database();
    const [start_time, end_tiem] = state.query.start_time;
    const timeAll = getAllDateCN(new Date(start_time), new Date(end_tiem));
    db.collection('uni-stat-error-result')
      .where(querystr)
      .groupBy('start_time')
      .groupField('sum(count) as total_day_count')
      .orderBy('start_time', 'desc')
      .get({
        getCount: true,
      })
      .then(async (res) => {
        const count = res.result.count;
        const resData = res.result.data;
        const data = [];

        timeAll.forEach((value) => {
          const item = resData.find((currentItem) => currentItem.start_time === value);
          if (item) {
            data.push(item);
          } else {
            data.push({
              start_time: value,
              total_day_count: 0,
            });
          }
        });

        const options = {
          categories: [],
          series: [
            {
              name: '暂无数据',
              data: [],
            },
          ],
        };
        if (state.chartTab === 'errorCount') {
          const countLine = (options.series[0] = {
            name: '错误次数',
            data: [],
          });
          const xAxis = options.categories;
          for (const item of data) {
            const date = item.start_time;
            const x = formatDate(date, 'day');
            const countY = item[`total_${field}`];
            xAxis.push(x);
            countLine.data.push(countY);
          }
          state.chartData = options;
        } else {
          const dayAppLaunchs = await getDayLaunch(querystr);
          const rateLine = (options.series[0] = {
            name: '错误率(%)',
            data: [],
            lineStyle: {
              color: '#EE6666',
              width: 1,
            },
            itemStyle: {
              borderWidth: 1,
              borderColor: '#EE6666',
              color: '#EE6666',
            },
            areaStyle: {
              color: {
                colorStops: [
                  {
                    offset: 0,
                    color: '#EE6666',
                  },
                  {
                    offset: 1,
                    color: '#FFFFFF',
                  },
                ],
              },
            },
          });
          const xAxis = options.categories;
          for (const item of data) {
            const date = item.start_time;
            const x = formatDate(date, 'day');
            const countY = item[`total_${field}`];
            xAxis.push(x);
            if (dayAppLaunchs.length) {
              const day = dayAppLaunchs.find((currentDay) => currentDay.start_time === item.start_time);
              const dataIndex = xAxis.indexOf(x);
              if (day) {
                let rateY = (countY * 100) / day.day_app_launch_count;
                rateY = rateY.toFixed(2);
                rateLine.data[dataIndex] = rateY;
              } else {
                rateLine.data[dataIndex] = 0;
              }
            }
          }
          state.chartData = options;
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  }

  function getTotalCount(query) {
    const db = uniCloud.database();
    return db.collection('uni-stat-error-result').where(query).groupBy('appid').groupField('sum(count) as total_count').get();
  }

  function getTotalLaunch(query) {
    const db = uniCloud.database();
    return db.collection('uni-stat-result').where(query).groupBy('appid').groupField('sum(app_launch_count) as total_app_launch_count').get();
  }

  async function getDayLaunch(query) {
    const db = uniCloud.database();
    const res = await db
      .collection('uni-stat-result')
      .where(query)
      .groupBy('start_time')
      .groupField('sum(app_launch_count) as day_app_launch_count')
      .orderBy('start_time', 'asc')
      .get();
    return res.result.data || [];
  }

  function getTableData(query = stringifyQuery(state.query)) {
    const querystr = stringifyQuery(state.query, false, ['uni_platform']);
    const { pageCurrent } = state.options;
    state.loading = true;
    const db = uniCloud.database();
    const filterAppid = stringifyQuery(
      createUniStatQuery({
        appid: state.query.appid,
      })
    );
    const mainTableTemp = db.collection('uni-stat-error-result').where(querystr).getTemp();
    const versions = db.collection('opendb-app-versions').where(filterAppid).getTemp();
    const platforms = db.collection('uni-stat-app-platforms').getTemp();

    db.collection(mainTableTemp, versions, platforms)
      .orderBy('count', 'desc')
      .skip((pageCurrent - 1) * state.options.pageSize)
      .limit(state.options.pageSize)
      .get({
        getCount: true,
      })
      .then((res) => {
        const { count, data } = res.result;
        const tempData = [];
        state.panelData = JSON.parse(JSON.stringify(panelOption));
        for (const item of data) {
          item.last_time = parseDateTime(item.last_time, 'dateTime');
          item.msgTooltip = item.msg;
          item.msg = !item.msg ? '' : item.msg.substring(0, 100) + '...';
          const version = item.version_id[0];
          const platform = item.platform_id[0];
          item.version = version && version.version;
          item.platform = platform && platform.name;
          item.platform_code = platform && platform.code;
          tempData.push(item);
        }
        getTotalCount(querystr)
          .then((totalCountRes) => {
            const total = totalCountRes.result.data[0];
            const totalCount = total && total.total_count;
            if (totalCount) {
              tempData.forEach((item) => (item.total_count = Number(totalCount)));
              state.panelData[0].value = totalCount;
            }
            let launchCount = '';
            getTotalLaunch(querystr).then((totalLaunchRes) => {
              const launchTotal = totalLaunchRes.result.data[0];
              launchCount = launchTotal && launchTotal.total_app_launch_count;
              if (totalCount && launchCount) {
                let errorRate = totalCount / launchCount;
                errorRate = (errorRate * 100).toFixed(2) + '%';
                state.panelData[1].value = errorRate;
              }
            });
          })
          .finally(() => {
            state.tableData = [];
            state.options.total = count;
            tempData.forEach((item) => mapfields(fieldsMap, item, item));
            state.tableData = tempData;
          });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        state.loading = false;
      });
  }

  function navTo(url, item) {
    if (url.indexOf('http') > -1) {
      window.open(url);
    } else {
      if (item) {
        url = `${url}?error_hash=${item.hash}&create_time=${item.start_time}`;
      }
      uni.navigateTo({ url });
    }
  }

  function createStr(maps, fn, prefix = 'total_') {
    const strArr = [];
    maps.forEach((mapper) => {
      if (field.hasOwnProperty('value')) {
        const fieldName = mapper.field;
        strArr.push(`${fn}(${fieldName}) as ${prefix + fieldName}`);
      }
    });
    return strArr.join();
  }

  state.uploadSourcemapCloud = sourceMapEnabled.value ? markRaw(initUploadSourcemapCloud(state.uniStat)) : null;
  const getCloudDataDebounce = debounce(() => {
    getAllData(queryStr.value);
  }, 300);

  watch(
    () => state.query,
    () => {
      state.options.pageCurrent = 1;
      getCloudDataDebounce();
    },
    { deep: true }
  );
  watch(
    () => state.chartTab,
    () => {
      getChartData(queryStr.value);
    }
  );

  const {
    query,
    uploadOptions,
    uploadMsg,
    options,
    loading,
    popupLoading,
    currentDateTab,
    tableData,
    popupTableData,
    panelData,
    chartData,
    chartTab,
    chartTabs,
    errMsg,
    msgLoading,
    uploadFile,
    errorMessage,
  } = toRefs(state);

  getCloudDataDebounce();
</script>

<style>
  .flex-between {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .uni-stat-panel {
    box-shadow: unset;
    border-bottom: 1px solid #eee;
    padding: 0;
    margin: 0 15px;
  }

  .uni-stat-tooltip-s {
    width: 160px;
    white-space: normal;
  }

  .black-theme {
    background-color: #333;
    color: #fff;
  }

  .dialog-close {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
    align-items: center;
    padding: 20px;
    margin-top: 10px;
  }

  .dialog-close-plus {
    width: 20px;
    height: 2px;
    background-color: #fff;
    border-radius: 2px;
    transform: rotate(45deg);
  }

  .dialog-close-rotate {
    position: absolute;
    transform: rotate(-45deg);
  }

  .upload-msg-warning {
    padding: 0px 15px;
    color: red;
    font-size: 14px;
  }

  ::v-deep .sourcemap-drawser .uni-select {
    flex: 1;
  }

  ::v-deep .sourcemap-drawser .uni-select .uni-select__input-text {
    width: 100%;
  }

  .upload-task-header {
    font-size: 14px;
    color: #666;
    padding: 15rpx 25rpx;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }
</style>
