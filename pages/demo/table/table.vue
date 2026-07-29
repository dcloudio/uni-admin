<template>
  <view>
    <view class="uni-header">
      <view class="uni-group hide-on-phone">
        <view class="uni-title">{{ $t('demo.table.title') }}</view>
      </view>
      <view class="uni-group">
        <!-- 输入框 -->
        <input class="uni-search" type="text" v-model="searchVal" @confirm="search" :placeholder="$t('common.placeholder.query')" />
        <!-- 搜索按钮 -->
        <button class="uni-button" type="default" size="mini" @click="search">{{ $t('common.button.search') }}</button>
        <!-- 添加按钮 -->
        <button class="uni-button" type="primary" size="mini">{{ $t('common.button.add') }}</button>
        <!-- 批量删除按钮 -->
        <button class="uni-button" type="warn" size="mini" @click="delTable">{{ $t('common.button.batchDelete') }}</button>
      </view>
    </view>
    <view class="uni-container">
      <!-- 表格组件 -->
      <uni-table :loading="loading" border stripe type="selection" :emptyText="$t('common.empty')" @selection-change="selectionChange">
        <uni-tr>
          <!-- 表头列 -->
          <uni-th width="150" align="center">日期</uni-th>
          <uni-th width="150" align="center">姓名</uni-th>
          <uni-th align="center">地址</uni-th>
          <uni-th width="204" align="center">设置</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, index) in tableData" :key="index">
          <!-- 表格数据列 -->
          <uni-td>{{ item.date }}</uni-td>
          <uni-td>
            <view class="name">{{ item.name }}</view>
          </uni-td>
          <uni-td>{{ item.address }}</uni-td>
          <uni-td>
            <view class="uni-group">
              <!-- 编辑按钮 -->
              <button class="uni-button" size="mini" type="primary">{{ $t('common.button.edit') }}</button>
              <!-- 删除按钮 -->
              <button class="uni-button" size="mini" type="warn">{{ $t('common.button.delete') }}</button>
            </view>
          </uni-td>
        </uni-tr>
      </uni-table>
      <view class="uni-pagination-box">
        <!-- 分页组件 -->
        <uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total" @change="change" />
      </view>
    </view>
    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  // 导入名为 "tableData" 的模块，路径为 './tableData.js'
  import tableDataSource from './tableData.js';

  // 导出默认模块
  import { ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  const searchValState = ref('');
  const searchVal = searchValState;
  const tableDataState = ref([]);
  const tableData = tableDataState;
  const pageSizeState = ref(10);
  const pageSize = pageSizeState;
  const pageCurrentState = ref(1);
  const pageCurrent = pageCurrentState;
  const totalState = ref(0);
  const total = totalState;
  const loadingState = ref(false);
  const loading = loadingState;
  const selectedIndexsState = ref(undefined);
  const selectedIndexs = selectedIndexsState;
  const selectedItemsAction = () => {
    return selectedIndexsState.value.map((i) => tableDataState.value[i]);
  };
  const selectedItems = selectedItemsAction;
  const selectionChangeAction = (e) => {
    selectedIndexsState.value = e.detail.index;
  };
  const selectionChange = selectionChangeAction;
  const delTableAction = () => {
    selectedItemsAction();
  };
  const delTable = delTableAction;
  const changeAction = (e) => {
    getDataAction(e.current);
  };
  const change = changeAction;
  const searchAction = () => {
    getDataAction(1, searchValState.value);
  };
  const search = searchAction;
  const getDataAction = (pageCurrent, value = '') => {
    loadingState.value = true;
    pageCurrentState.value = pageCurrent;
    requestAction({
      pageSize: pageSizeState.value,
      pageCurrent: pageCurrent,
      value: value,
      success: (res) => {
        tableDataState.value = res.data;
        totalState.value = res.total;
        loadingState.value = false;
      },
    });
  };
  const getData = getDataAction;
  const requestAction = (options) => {
    const { pageSize, pageCurrent, success, value } = options;
    let total = tableDataSource.length;
    let data = tableDataSource.filter((item, index) => {
      const idx = index - (pageCurrent - 1) * pageSize;
      return idx < pageSize && idx >= 0;
    });
    if (value) {
      data = [];
      tableDataSource.forEach((item) => {
        if (item.name.indexOf(value) !== -1) {
          data.push(item);
        }
      });
      total = data.length;
    }
    setTimeout(() => {
      typeof success === 'function' &&
        success({
          data: data,
          total: total,
        });
    }, 500);
  };
  const request = requestAction;
  onLoad(() => {
    // 重置选中项数组
    selectedIndexsState.value = [];
    // 获取第一页数据
    // 获取第一页数据
    getDataAction(1);
  });
</script>

<style>
  /* #ifndef H5 */
  page {
    padding-top: 85px;
  }

  /* #endif */
</style>
