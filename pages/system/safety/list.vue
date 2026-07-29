<template>
  <view>
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" :placeholder="$t('common.placeholder.query')" />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">{{ $t('common.button.search') }}</button>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db
        ref="udbRef"
        :collection="collectionList"
        :options="options"
        :where="where"
        page-data="replace"
        :orderby="orderby"
        :getcount="true"
        :page-size="options.pageSize"
        :page-current="options.pageCurrent"
        v-slot:default="{ data, pagination, loading, error }"
      >
        <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
          <uni-tr>
            <uni-th align="center">序号</uni-th>
            <uni-th align="center">用户名</uni-th>
            <uni-th align="center">昵称</uni-th>
            <uni-th align="center">内容</uni-th>
            <uni-th align="center">IP</uni-th>
            <uni-th align="center">时间</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ (pagination.current - 1) * pagination.size + (index + 1) }}</uni-td>
            <uni-td align="center">{{ (item.user_id[0] && item.user_id[0].username) || '-' }}</uni-td>
            <uni-td align="center">{{ (item.user_id[0] && item.user_id[0].nickname) || '-' }}</uni-td>
            <uni-td align="center">{{ item.type }}</uni-td>
            <uni-td align="center">{{ item.ip }}</uni-td>
            <uni-td align="center">
              <uni-dateformat :date="item.create_date" :threshold="[0, 0]" />
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>
  </view>
</template>

<script setup>
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = 'create_date desc'; // 排序字段
  // 排序字段
  const dbSearchFields = ['user_id.username', 'user_id.nickname', 'type', 'ip']; // 支持模糊搜索的字段列表
  // 分页配置
  // 支持模糊搜索的字段列表
  // 分页配置
  const pageSize = 20;
  const pageCurrent = 1;
  import { ref } from 'vue';
  const collectionListState = ref([
    db.collection('uni-id-log').field('type, ip, create_date, user_id').getTemp(),
    db.collection('uni-id-users').field('_id, username,nickname').getTemp(),
  ]);
  const collectionList = collectionListState;
  const queryState = ref('');
  const query = queryState;
  const whereState = ref('');
  const where = whereState;
  const orderbyState = ref(dbOrderBy);
  const orderby = orderbyState;
  const optionsState = ref({
    pageSize,
    pageCurrent,
  });
  const options = optionsState;
  const selectedIndexsState = ref(undefined);
  const selectedIndexs = selectedIndexsState;
  const udbRef = ref(null);
  const getWhereAction = () => {
    const query = queryState.value.trim();
    if (!query) {
      return '';
    }
    let queryRe;
    try {
      queryRe = new RegExp(query, 'i');
    } catch (err) {
      uni.showToast({
        title: '请勿输入\等不满足正则格式的符号',
        icon: 'none',
      });
      return;
    }
    return dbSearchFields.map((name) => queryRe + '.test(' + name + ')').join(' || ');
  };
  const getWhere = getWhereAction;
  const searchAction = () => {
    const newWhere = getWhereAction();
    const isSameWhere = newWhere === whereState.value;
    whereState.value = newWhere;
    if (isSameWhere) {
      // 相同条件时，手动强制刷新
      loadDataAction();
    }
  };
  const search = searchAction;
  const loadDataAction = (clear = true) => {
    udbRef.value.loadData({
      clear,
    });
  };
  const loadData = loadDataAction;
  const onPageChangedAction = (e) => {
    udbRef.value.loadData({
      current: e.current,
    });
  };
  const onPageChanged = onPageChangedAction;
  const navigateToAction = (url) => {
    uni.navigateTo({
      url,
      events: {
        refreshData: () => {
          loadDataAction();
        },
      },
    });
  };
  const navigateTo = navigateToAction;
  const selectedItemsAction = () => {
    let dataList = udbRef.value.dataList;
    return selectedIndexsState.value.map((i) => dataList[i]._id);
  };
  const selectedItems = selectedItemsAction;
  const delTableAction = () => {
    udbRef.value.remove(selectedItemsAction());
  };
  const delTable = delTableAction;
  const selectionChangeAction = (e) => {
    selectedIndexsState.value = e.detail.index;
  };
  const selectionChange = selectionChangeAction;
  const confirmDeleteAction = (id) => {
    udbRef.value.remove(id);
  };
  const confirmDelete = confirmDeleteAction;
</script>
<style></style>
