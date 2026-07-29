<template>
  <!-- 对应页面：支付统计-概况  -->
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
      <view class="uni-stat--x">
        <uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" @change="platformChange" />
        <uni-data-select
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
      <!-- 下面2个组件用到了uni-table，而uni-table在VUE3模式下部分情况会有问题，目前原因不明，后续修复-->
      <!-- 历史数据统计面板（最近7天，本月，本季度，本月，总和 -->
      <statPanelTotal :query="query"></statPanelTotal>
      <!-- 今日数据统计面板 -->
      <statPanelToday :query="query"></statPanelToday>
      <!-- 趋势图 -->
      <trendChart :query="query"></trendChart>
    </view>
    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { stringifyQuery } from '@/js_sdk/uni-stat/util.js';
  import statPanelTotal from './components/statPanelTotal';
  import statPanelToday from './components/statPanelToday';
  import trendChart from './components/trendChart';
  import { computed, ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  const queryState = ref({
    appid: '',
    platform_id: '',
    uni_platform: '',
    version_id: '',
    channel_id: '',
  });
  const query = queryState;
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
  const platformChangeAction = (id, index, name, item) => {
    queryState.value.version_id = 0;
    queryState.value.uni_platform = item.code;
  };
  const platformChange = platformChangeAction;
  onLoad((option) => {
    const { appid } = option;
    if (appid) {
      queryState.value.appid = appid;
    }
  });
</script>

<style></style>
