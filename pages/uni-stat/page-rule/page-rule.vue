<template>
  <view>
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
      </view>
    </view>
    <view class="uni-container">
      <view class="uni-stat--x flex p-1015">
        <view class="uni-stat--app-select" style="width: 500px">
          <uni-data-select
            ref="appListRefRef"
            collection="opendb-app-list"
            field="appid as value, name as text"
            orderby="text asc"
            label="应用选择"
            v-model="appid"
            @change="search"
          />
        </view>
      </view>

      <unicloud-db
        ref="udbRef"
        :collection="collectionList"
        field="title,path,page_rules,appid"
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
        <uni-table ref="tableRef" :loading="loading" :emptyText="errorMessage || error.message || '没有更多数据'" border stripe>
          <uni-tr>
            <uni-th align="center">序号</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'title')">页面标题</uni-th>
            <uni-th align="left" filter-type="search" @filter-change="filterChange($event, 'path')">页面URL</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'appid')">appid</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ (pagination.current - 1) * pagination.size + (index + 1) }}</uni-td>
            <uni-td align="center">{{ item.title }}</uni-td>
            <uni-td align="left">{{ item.path }}</uni-td>
            <uni-td align="center">{{ item.appid }}</uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="editRule(item)" class="uni-button" size="mini" type="primary">编辑规则</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>

    <uni-popup ref="editRulePopupRef" type="center">
      <view class="edit-rule-popup">
        <view class="uni-title">页面规则</view>
        <view class="edit-rule-popup-tips">
          <uni-notice-bar :font-size="12" :text="editRulePopup.tips" />
        </view>
        <view class="edit-rule-popup-list">
          <view class="edit-rule-popup-item" v-for="(item1, index1) in pageInfo.page_rules" :key="index1">
            <view class="name"> 规则 {{ pageInfo.page_rules.length - index1 }} </view>
            <view class="tags">
              <view class="tags-item tags-item-text" v-for="(item2, index2) in item1" :key="index2">
                <text class="text">{{ item2 }}</text> <uni-icons class="pointer" type="closeempty" size="12" color="#42b983" @click="deleteParamItem(index1, index2)"></uni-icons>
              </view>
              <view class="tags-item tags-item-add">
                <input
                  class="tags-item-add-input"
                  type="text"
                  v-model.trim="editRulePopup.addParamInfo.value"
                  :focus="editRulePopup.addParamInfo.index1 === index1 && editRulePopup.isAddParam"
                  @blur="confirmAddParamItem(index1)"
                  v-if="editRulePopup.addParamInfo.index1 === index1 && editRulePopup.isAddParam"
                  placeholder="输入参数名"
                />
                <button size="mini" class="tags-item-add-btn" @click="addParamItem(index1)" v-else>+ 添加参数</button>
              </view>
            </view>
            <view class="btn">
              <uni-icons type="plus" size="28" class="pointer" color="#606266" @click="addRulesItem" v-if="index1 === 0 && pageInfo.page_rules.length < 5"></uni-icons>
              <uni-icons type="minus" size="28" class="pointer" color="#606266" @click="deleteRulesItem(index1)" v-else></uni-icons>
            </view>
          </view>
        </view>
        <view class="edit-rule-popup-btn">
          <button class="uni-button btn" type="primary" size="default" :loading="editRulePopup.loading" :disabled="editRulePopup.loading" @click="saveRule">保存</button>
          <button class="uni-button btn" type="default" size="default" @click="closeEditRulePopup">取消</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
  import { enumConverter, filterToWhere } from '../../../js_sdk/validator/uni-stat-pages.js';
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = ''; // 排序字段
  // 排序字段
  const dbSearchFields = ['title', 'path']; // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20;
  const pageCurrent = 1;
  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
  };
  import { nextTick, ref } from 'vue';
  import { onLoad, onReady } from '@dcloudio/uni-app';
  const collectionListState = ref('uni-stat-pages');
  const collectionList = collectionListState;
  const appidState = ref('');
  const appid = appidState;
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
  const errorMessageState = ref('');
  const errorMessage = errorMessageState;
  const optionsState = ref({
    pageSize,
    pageCurrent,
    filterData: {},
    ...enumConverter,
  });
  const options = optionsState;
  const imageStylesState = ref({
    width: 64,
    height: 64,
  });
  const imageStyles = imageStylesState;
  const exportExcelState = ref({
    filename: 'uni-stat-pages.xls',
    type: 'xls',
    fields: {
      title: 'title',
      path: 'path',
    },
  });
  const exportExcel = exportExcelState;
  const exportExcelDataState = ref([]);
  const exportExcelData = exportExcelDataState;
  const pageInfoState = ref({
    _id: '',
    page_rules: [],
  });
  const pageInfo = pageInfoState;
  const editRulePopupState = ref({
    loading: false,
    tips: `页面规则说明：
1. 用于生成内容统计 url 的规则。通过设置页面有效参数，通过带参数的 url 对内容进行标识。例如有一个详情页面的请求有三个参数 page/detail/detail?id=1&type=1&t=1565943419，其中 t 为时间戳或随机数，则 id 和 type 为有效参数，需要在页面规则 page/detail/detail 中添加 id,type 这两个参数。
2. 每条规则可以添加多个参数，进行匹配时，每条规则单独生效。
3. 每个页面可以添加多个规则（最多 5 个规则），进行匹配时，后添加的规则优先级较高
4. 目前的匹配规则只能处理通过 url 显式传递参数，且参数形式为上述示例中的键值对格式。`,
    isAddParam: false,
    addParamInfo: {
      index1: '',
      value: '',
    },
  });
  const editRulePopup = editRulePopupState;
  const _filterState = ref(undefined);
  const _filter = _filterState;
  const appListRefRef = ref(null);
  const udbRef = ref(null);
  const tableRef = ref(null);
  const editRulePopupRef = ref(null);
  const onqueryloadAction = (data) => {
    exportExcelDataState.value = data;
  };
  const onqueryload = onqueryloadAction;
  const getWhereAction = () => {
    const query = queryState.value.trim();
    let queryStr = '';
    if (query) {
      const queryRe = new RegExp(query, 'i');
      queryStr = dbSearchFields.map((name) => queryRe + '.test(' + name + ')').join(' || ');
    }
    if (appidState.value) {
      if (query) {
        queryStr = `appid=='${appidState.value}' && (${queryStr})`;
      } else {
        queryStr = `appid=='${appidState.value}'`;
      }
    }
    return queryStr;
  };
  const getWhere = getWhereAction;
  const searchAction = () => {
    errorMessageState.value = '';
    const newWhere = getWhereAction();
    whereState.value = newWhere;
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
          loadDataAction(clear);
        },
      },
    });
  };
  const navigateTo = navigateToAction;
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
    nextTick(() => {
      udbRef.value.loadData();
    });
  };
  const filterChange = filterChangeAction;
  const editRuleAction = (item) => {
    // 显示弹窗
    editRulePopupRef.value.open();
    // 如果没有规则，则初始化一个空规则
    // 如果没有规则，则初始化一个空规则
    if (!item.page_rules || !item.page_rules.length) {
      item.page_rules = [[]];
    }
    pageInfoState.value = {
      _id: item._id,
      page_rules: JSON.parse(JSON.stringify(item.page_rules)), // 深拷贝，解除引用关系
    };
  };
  const editRule = editRuleAction;
  const addRulesItemAction = () => {
    pageInfoState.value.page_rules.unshift([]);
  };
  const addRulesItem = addRulesItemAction;
  const deleteRulesItemAction = (index1) => {
    pageInfoState.value.page_rules.splice(index1, 1);
  };
  const deleteRulesItem = deleteRulesItemAction;
  const addParamItemAction = (index1) => {
    editRulePopupState.value.isAddParam = true;
    editRulePopupState.value.addParamInfo.value = '';
    editRulePopupState.value.addParamInfo.index1 = index1;
  };
  const addParamItem = addParamItemAction;
  const confirmAddParamItemAction = (index1) => {
    if (editRulePopupState.value.addParamInfo.value) {
      pageInfoState.value.page_rules[index1].push(editRulePopupState.value.addParamInfo.value);
    }
    editRulePopupState.value.isAddParam = false;
  };
  const confirmAddParamItem = confirmAddParamItemAction;
  const deleteParamItemAction = (index1, index2) => {
    pageInfoState.value.page_rules[index1].splice(index2, 1);
  };
  const deleteParamItem = deleteParamItemAction;
  const closeEditRulePopupAction = () => {
    editRulePopupRef.value.close();
  };
  const closeEditRulePopup = closeEditRulePopupAction;
  const saveRuleAction = () => {
    editRulePopupState.value.loading = true;
    // 过滤下空的规则
    // 过滤下空的规则
    let page_rules = JSON.parse(JSON.stringify(pageInfoState.value.page_rules));
    page_rules = page_rules.filter((item) => item.length > 0);
    // 保存到数据库
    // 保存到数据库
    udbRef.value.update(
      pageInfoState.value._id,
      {
        page_rules,
      },
      {
        showToast: false,
        needLoading: false,
        success: () => {
          // 修改本地列表中的数据
          udbRef.value.dataList.forEach((item) => {
            if (item._id === pageInfoState.value._id) {
              item.page_rules = page_rules;
            }
          });
          // 关闭弹窗
          closeEditRulePopupAction();
        },
        complete: () => {
          editRulePopupState.value.loading = false;
        },
      }
    );
  };
  const saveRule = saveRuleAction;
  onLoad(() => {
    _filterState.value = {};
  });
  onReady(() => {
    if (appListRefRef.value) {
      appidState.value = appListRefRef.value.getCache();
      searchAction();
    }
  });
</script>

<style lang="scss" scoped>
  .edit-rule-popup {
    padding: 20px;
    background-color: #fff;
    width: 900px;
    max-width: 90vw;

    .edit-rule-popup-tips {
      margin-top: 20px;
    }

    .edit-rule-popup-list {
      margin-top: 20px;

      .edit-rule-popup-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        color: #606266;
        font-size: 14px;
        word-break: break-all;

        &:first-child {
          margin-top: 0;
        }

        .name {
          width: 80px;
        }

        .tags {
          flex: 1;
          border: 1px solid #eee;
          padding: 5px 10px;
          display: flex;
          flex-wrap: wrap;

          .tags-item {
            display: inline-block;
            height: 32px;
            line-height: 30px;
            font-size: 12px;
            box-sizing: border-box;
            white-space: nowrap;
            margin: 5px;

            .text {
              margin-right: 8px;
            }

            &.tags-item-text {
              background-color: #ecf8f3;
              border-color: #d9f1e6;
              padding: 0 10px;
              color: #42b983;
              border-width: 1px;
              border-style: solid;
              border-radius: 4px;
            }

            &.tags-item-add {
              .tags-item-add-input {
                width: 100px;
                height: 32px;
                line-height: 32px;
                padding: 0 10px;
                box-sizing: border-box;
                border-radius: 4px;
                border: 1px solid #dcdfe6;
                font-size: 12px;
                color: #606266;
                outline: none;

                &:focus {
                  border-color: #409eff;
                }
              }

              .tags-item-add-btn {
                height: 32px;
                line-height: 32px;
              }
            }
          }
        }

        .btn {
          width: 80px;
          text-align: center;
        }
      }
    }

    .edit-rule-popup-btn {
      /* 按钮显示在右边 */
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;

      .btn {
        margin-left: 10px;
      }
    }

    .pointer {
      cursor: pointer;
    }
  }
</style>
