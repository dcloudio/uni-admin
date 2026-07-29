<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" :placeholder="$t('common.placeholder.query')" />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">{{ $t('common.button.search') }}</button>
        <button class="uni-button" type="primary" size="mini" @click="navigateTo('./add')">{{ $t('common.button.add') }}</button>
        <button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">{{ $t('common.button.batchDelete') }}</button>
        <button class="uni-button" type="primary" size="mini" :disabled="!selectedIndexs.length" @click="openTagsPopup">{{ $t('common.button.tagManager') }}</button>
        <!-- #ifdef H5 -->
        <button class="uni-button" type="primary" size="mini" @click="batchSmsRef.open()">{{ $t('common.button.sendSMS') }}</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">{{ $t('common.button.exportExcel') }}</button>
        </download-excel>
        <!-- #endif -->
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db
        ref="udbRef"
        :collection="collectionList"
        :where="where"
        page-data="replace"
        :orderby="orderby"
        :getcount="true"
        :page-size="options.pageSize"
        :page-current="options.pageCurrent"
        v-slot:default="{ data, pagination, loading, error, options }"
        :options="options"
        loadtime="manual"
        @load="onqueryload"
      >
        <uni-table ref="tableRef" :loading="loading" :emptyText="error.message || $t('common.empty')" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'username')" sortable @sort-change="sortChange($event, 'username')">用户名</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'nickname')" sortable @sort-change="sortChange($event, 'nickname')">用户昵称</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'mobile')" sortable @sort-change="sortChange($event, 'mobile')">手机号码</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.status_localdata" @filter-change="filterChange($event, 'status')">用户状态</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'email')" sortable @sort-change="sortChange($event, 'email')">邮箱</uni-th>
            <uni-th align="center">角色</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="tagsData" @filter-change="filterChange($event, 'tags')">用户标签</uni-th>
            <uni-th align="center">可登录应用</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'last_login_date')" sortable @sort-change="sortChange($event, 'last_login_date')"
              >最后登录时间</uni-th
            >
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ item.username }}</uni-td>
            <uni-td align="center">{{ item.nickname }}</uni-td>
            <uni-td align="center">{{ item.mobile }}</uni-td>
            <uni-td align="center">{{ options.status_valuetotext[item.status] }}</uni-td>
            <uni-td align="center">
              <uni-link :href="'mailto:' + item.email" :text="item.email"></uni-link>
            </uni-td>
            <uni-td align="center"> {{ item.role }}</uni-td>
            <uni-td align="center">
              <block v-for="(tag, tagIndex) in item.tags" :key="tagIndex">
                <uni-tag type="primary" inverted size="small" :text="tag" v-if="item.tags" style="margin: 0 5px"></uni-tag>
              </block>
            </uni-td>
            <uni-td align="center">
              <uni-link v-if="item.dcloud_appid === undefined" :href="noAppidWhatShouldIDoLink"> 未绑定可登录应用<view class="uni-icons-help"></view> </uni-link>
              {{ item.dcloud_appid }}
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.last_login_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id=' + item._id, false)" class="uni-button" size="mini" type="primary">{{ $t('common.button.edit') }}</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">{{ $t('common.button.delete') }}</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination
            show-iconn
            show-page-size
            :page-size="pagination.size"
            v-model="pagination.current"
            :total="pagination.count"
            @change="onPageChanged"
            @pageSizeChange="changeSize"
          />
        </view>
      </unicloud-db>
    </view>
    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
    <uni-popup ref="tagsPopupRef" type="center">
      <view class="tags-manager--x">
        <view class="tags-manager--header mb">管理标签</view>
        <uni-data-checkbox ref="checkbox" v-model="managerTags" class="mb ml" :multiple="true" collection="uni-id-tag" field="tagid as value, name as text"></uni-data-checkbox>
        <view class="uni-group">
          <button @click="managerMultiTag" class="uni-button" type="primary" style="margin-right: 75px">保存</button>
        </view>
      </view>
    </uni-popup>
    <!-- #ifdef H5 -->
    <batch-sms ref="batchSmsRef" toType="user" :receiver="smsReceiver" :condition="smsCondition"></batch-sms>
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { enumConverter, filterToWhere } from '../../../js_sdk/validator/uni-id-users.js';
  import UniForms from '@/uni_modules/uni-forms/components/uni-forms/uni-forms';
  import UniFormsItem from '@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item';
  import UniEasyinput from '@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput';
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = 'last_login_date desc'; // 排序字段
  // 排序字段
  const dbSearchFields = ['username', 'role.role_name', 'mobile', 'email']; // 支持模糊搜索的字段列表
  // 分页配置
  // 支持模糊搜索的字段列表
  // 分页配置
  const pageSize = 20;
  const pageCurrent = 1;
  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
  };
  import { computed, getCurrentInstance, nextTick, ref } from 'vue';
  import { onLoad, onReady } from '@dcloudio/uni-app';
  const { proxy } = getCurrentInstance();
  const collectionListState = ref([
    db
      .collection('uni-id-users')
      .field(
        'ali_openid,apple_openid,avatar,avatar_file,comment,dcloud_appid,department_id,email,email_confirmed,gender,invite_time,inviter_uid,last_login_date,last_login_ip,mobile,mobile_confirmed,my_invite_code,nickname,role,score,status,username,wx_unionid,qq_unionid,tags'
      )
      .getTemp(),
    db.collection('uni-id-roles').field('role_id, role_name').getTemp(),
  ]);
  const collectionList = collectionListState;
  const queryState = ref('');
  const query = queryState;
  const whereState = ref('');
  const where = whereState;
  const orderbyState = ref(dbOrderBy);
  const orderby = orderbyState;
  const orderByFieldNameState = ref('');
  const orderByFieldName = orderByFieldNameState;
  const selectedIndexsState = ref([]);
  const selectedIndexs = selectedIndexsState;
  const pageSizeIndexState = ref(0);
  const pageSizeIndex = pageSizeIndexState;
  const pageSizeOptionState = ref([20, 50, 100, 500]);
  const pageSizeOption = pageSizeOptionState;
  const tagsState = ref({});
  const tags = tagsState;
  const managerTagsState = ref([]);
  const managerTags = managerTagsState;
  const queryTagidState = ref('');
  const queryTagid = queryTagidState;
  const queryUserIdState = ref('');
  const queryUserId = queryUserIdState;
  const optionsState = ref({
    pageSize,
    pageCurrent,
    filterData: {
      status_localdata: [
        {
          text: '正常',
          value: 0,
          checked: true,
        },
        {
          text: '禁用',
          value: 1,
        },
        {
          text: '审核中',
          value: 2,
        },
        {
          text: '审核拒绝',
          value: 3,
        },
      ],
    },
    ...enumConverter,
  });
  const options = optionsState;
  const imageStylesState = ref({
    width: 64,
    height: 64,
  });
  const imageStyles = imageStylesState;
  const exportExcelState = ref({
    filename: 'uni-id-users.xls',
    type: 'xls',
    fields: {
      用户名: 'username',
      手机号码: 'mobile',
      用户状态: 'status',
      邮箱: 'email',
      角色: 'role',
      last_login_date: 'last_login_date',
    },
  });
  const exportExcel = exportExcelState;
  const exportExcelDataState = ref([]);
  const exportExcelData = exportExcelDataState;
  const noAppidWhatShouldIDoLinkState = ref('https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=makeup-dcloud-appid');
  const noAppidWhatShouldIDoLink = noAppidWhatShouldIDoLinkState;
  const smsConditionState = ref({});
  const smsCondition = smsConditionState;
  const _filterState = ref(undefined);
  const _filter = _filterState;
  const udbRef = ref(null);
  const tagsPopupRef = ref(null);
  const tableRef = ref(null);
  const batchSmsRef = ref(null);
  const tagsDataComputed = computed(() => {
    const dynamic_data = [];
    for (const key in tagsState.value) {
      const tag = {
        value: key,
        text: tagsState.value[key],
      };
      if (key === queryTagidState.value) {
        tag.checked = true;
      }
      dynamic_data.push(tag);
    }
    return dynamic_data;
  });
  const tagsData = tagsDataComputed;
  const smsReceiverComputed = computed(() => {
    if (selectedIndexsState.value.length) {
      let dataList = udbRef.value.dataList;
      return selectedIndexsState.value.map((i) => dataList[i]._id);
    } else {
      return undefined;
    }
  });
  const smsReceiver = smsReceiverComputed;
  const onqueryloadAction = (data) => {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      const roleArr = item.role.map((item) => item.role_name);
      item.role = roleArr.join('、');
      const tagsArr = item.tags && item.tags.map((item) => tagsState.value[item]);
      item.tags = tagsArr;
      if (Array.isArray(item.dcloud_appid)) {
        item.dcloud_appid = item.dcloud_appid.join('、');
      }
      item.last_login_date = proxy.$formatDate(item.last_login_date);
    }
    exportExcelDataState.value = data;
  };
  const onqueryload = onqueryloadAction;
  const changeSizeAction = (pageSize) => {
    optionsState.value.pageSize = pageSize;
    optionsState.value.pageCurrent = 1;
    nextTick(() => {
      loadDataAction();
    });
  };
  const changeSize = changeSizeAction;
  const openTagsPopupAction = () => {
    tagsPopupRef.value.open();
  };
  const openTagsPopup = openTagsPopupAction;
  const closeTagsPopupAction = () => {
    tagsPopupRef.value.close();
  };
  const closeTagsPopup = closeTagsPopupAction;
  const getWhereAction = () => {
    const query = queryState.value.trim();
    if (!query) {
      return '';
    }
    const queryRe = new RegExp(query, 'i');
    console.log(
      JSON.stringify(
        db.command.or(
          dbSearchFields.map((name) => {
            return {
              [name]: queryRe,
            };
          })
        )
      )
    );
    return db.command.or(
      dbSearchFields.map((name) => {
        return {
          [name]: queryRe,
        };
      })
    );
    return dbSearchFields.map((name) => queryRe + '.test(' + name + ')').join(' || ');
  };
  const getWhere = getWhereAction;
  const searchAction = () => {
    const newWhere = getWhereAction();
    whereState.value = newWhere;
    // 下一帧拿到查询条件
    // 下一帧拿到查询条件
    nextTick(() => {
      loadDataAction();
    });
  };
  const search = searchAction;
  const loadDataAction = (clear = true) => {
    udbRef.value.loadData({
      clear,
    });
  };
  const loadData = loadDataAction;
  const onPageChangedAction = (e) => {
    selectedIndexsState.value.length = 0;
    tableRef.value.clearSelection();
    udbRef.value.loadData({
      current: e.current,
    });
  };
  const onPageChanged = onPageChangedAction;
  const navigateToAction = (url, clear) => {
    // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
    uni.navigateTo({
      url,
      events: {
        refreshData: () => {
          loadTagsAction();
          loadDataAction(clear);
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
    udbRef.value.remove(selectedItemsAction(), {
      success: (res) => {
        tableRef.value.clearSelection();
      },
    });
  };
  const delTable = delTableAction;
  const selectionChangeAction = (e) => {
    selectedIndexsState.value = e.detail.index;
  };
  const selectionChange = selectionChangeAction;
  const confirmDeleteAction = (id) => {
    udbRef.value.remove(id, {
      success: (res) => {
        tableRef.value.clearSelection();
      },
    });
  };
  const confirmDelete = confirmDeleteAction;
  const sortChangeAction = (e, name) => {
    orderByFieldNameState.value = name;
    if (e.order) {
      orderbyState.value = name + ' ' + orderByMapping[e.order];
    } else {
      orderbyState.value = '';
    }
    tableRef.value.clearSelection();
    nextTick(() => {
      udbRef.value.loadData();
    });
  };
  const sortChange = sortChangeAction;
  const filterChangeAction = (e, name) => {
    _filterState.value[name] = {
      type: e.filterType,
      value: e.filter,
    };
    let newWhere = filterToWhere(_filterState.value, db.command);
    if (Object.keys(newWhere).length) {
      whereState.value = newWhere;
    } else {
      whereState.value = '';
    }

    // uni-sms-co
    // uni-sms-co
    if (Object.keys(_filterState.value).length) {
      smsConditionState.value = _filterState.value;
    } else {
      smsConditionState.value = {};
    }
    nextTick(() => {
      udbRef.value.loadData();
    });
  };
  const filterChange = filterChangeAction;
  const loadTagsAction = () => {
    db.collection('uni-id-tag')
      .limit(500)
      .get()
      .then((res) => {
        res.result.data.map((item) => {
          tagsState.value[item.tagid] = item.name;
        });
      })
      .catch((err) => {
        uni.showModal({
          title: '提示',
          content: err.message,
          showCancel: false,
        });
      });
  };
  const loadTags = loadTagsAction;
  const managerMultiTagAction = () => {
    const ids = selectedItemsAction();
    db.collection('uni-id-users')
      .where({
        _id: db.command.in(ids),
      })
      .update({
        tags: managerTagsState.value,
      })
      .then(() => {
        uni.showToast({
          title: '修改标签成功',
          duration: 2000,
        });
        tableRef.value.clearSelection();
        managerTagsState.value = [];
        loadDataAction();
        closeTagsPopupAction();
      })
      .catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false,
        });
      })
      .finally((err) => {
        uni.hideLoading();
      });
  };
  const managerMultiTag = managerMultiTagAction;
  onLoad((e) => {
    _filterState.value = {};
    const tagid = e.tagid;
    const userId = e.id;
    if (tagid) {
      queryTagidState.value = tagid;
      const options = {
        filterType: 'select',
        filter: [tagid],
      };
      filterChangeAction(options, 'tags');
    }
    if (userId) {
      queryUserIdState.value = userId;
      const options = {
        filterType: 'select',
        filter: [userId],
      };
      filterChangeAction(options, '_id');
    }
  });
  onReady(() => {
    loadTagsAction();
    if (!queryTagidState.value && !queryUserIdState.value) {
      udbRef.value.loadData();
    }
  });
</script>

<style lang="scss">
  .tags-manager {
    &--x {
      width: 400px;
      padding: 40px 30px;
      border-radius: 5px;
      background-color: #fff;
    }

    &--header {
      font-size: 22px;
      color: #333;
      text-align: center;
    }
  }

  .mb {
    margin-bottom: 80px;
  }

  .ml {
    margin-left: 30px;
  }
</style>
