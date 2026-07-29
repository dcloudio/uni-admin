<template>
  <view> </view>
</template>

<script setup>
  import { ref, watch } from 'vue';
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
  import { fieldsMap } from '../fieldsMap.js';

  const props = defineProps({
    query: {
      type: Object,
      default() {
        return {};
      },
    },
  });

  const tableName = ref('uni-stat-pay-result');
  const options = ref();

  function getChartData(query) {}

  watch(
    () => props.query,
    () => {
      options.value.pageCurrent = 1; // 重置分页
      debounce(() => {
        getChartData(props.query);
      })();
    },
    { deep: true }
  );

  debounce(() => {
    getChartData(props.query);
  })();
</script>

<style lang="scss" scoped></style>
