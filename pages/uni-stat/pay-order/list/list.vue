<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <uni-stat-breadcrumb />
      </view>
      <view class="uni-group">
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
      </view>
    </view>
    <view class="uni-container">
      <view class="uni-stat--x">
        <uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform" @change="platformChange" />
      </view>
      <!-- #ifdef WEB -->
      <uni-notice-bar
        showGetMore
        showIcon
        class="mb-m pointer"
        text="若用户昵称均为匿名用户，代表用户在发起支付前没有使用uni-id进行登录，建议接入uni-id，点击查看详情"
        @click="toUniIdDoc"
      />
      <!-- #endif -->

      <unicloud-db
        ref="udbRef"
        :collection="collectionList"
        field="user_id,nickname,provider,provider_pay_type,uni_platform,status,type,order_no,out_trade_no,transaction_id,device_id,client_ip,openid,description,err_msg,total_fee,refund_fee,refund_count,refund_list,provider_appid,appid,user_order_success,create_date,pay_date,notify_date,cancel_date"
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
        <uni-table
          ref="tableRef"
          :loading="loading"
          :emptyText="error.message || loading ? '请求中...' : '没有更多数据'"
          border
          stripe
          type=""
          @selection-change="selectionChange"
          style="min-height: 900px"
        >
          <uni-tr>
            <uni-th align="center">序号</uni-th>
            <uni-th
              ref="user_id"
              align="center"
              :filterDefaultValue="filterDefaultValueUserId"
              filter-type="search"
              @filter-change="filterChange($event, 'user_id')"
              sortable
              @sort-change="sortChange($event, 'user_id')"
              >用户</uni-th
            >
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.provider_localdata" @filter-change="filterChange($event, 'provider')">支付供应商</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'provider_pay_type')" sortable @sort-change="sortChange($event, 'provider_pay_type')"
              >支付方式</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'uni_platform')" sortable @sort-change="sortChange($event, 'uni_platform')"
              >应用平台</uni-th
            >
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.status_localdata" @filter-change="filterChange($event, 'status')">订单状态</uni-th>

            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'type')" sortable @sort-change="sortChange($event, 'type')">订单类型</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'order_no')" sortable @sort-change="sortChange($event, 'order_no')"
              >业务系统订单号</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'out_trade_no')" sortable @sort-change="sortChange($event, 'out_trade_no')"
              >支付插件订单号</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'transaction_id')" sortable @sort-change="sortChange($event, 'transaction_id')"
              >交易单号</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'description')" sortable @sort-change="sortChange($event, 'description')"
              >支付描述</uni-th
            >
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'total_fee', 0.01)" sortable @sort-change="sortChange($event, 'total_fee')"
              >订单支付金额</uni-th
            >
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'refund_fee', 0.01)" sortable @sort-change="sortChange($event, 'refund_fee')"
              >订单退款金额</uni-th
            >
            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'refund_count')" sortable @sort-change="sortChange($event, 'refund_count')"
              >当前退款笔数</uni-th
            >
            <uni-th align="center" sortable @sort-change="sortChange($event, 'user_order_success')">回调状态</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')" sortable @sort-change="sortChange($event, 'create_date')"
              >创建时间</uni-th
            >
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'pay_date')" sortable @sort-change="sortChange($event, 'pay_date')"
              >支付时间</uni-th
            >
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'cancel_date')" sortable @sort-change="sortChange($event, 'cancel_date')"
              >取消时间</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'provider_appid')" sortable @sort-change="sortChange($event, 'provider_appid')"
              >开放平台appid</uni-th
            >
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'appid')" sortable @sort-change="sortChange($event, 'appid')">DCloud AppId</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'device_id')" sortable @sort-change="sortChange($event, 'device_id')">设备ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'client_ip')" sortable @sort-change="sortChange($event, 'client_ip')">客户端IP</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'openid')" sortable @sort-change="sortChange($event, 'openid')">openid</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ parseInt(index + 1 + (pagination.current - 1) * pagination.size) }} </uni-td>
            <uni-td align="center"
              ><text class="text-btn" @click="pageToUser(item)">{{ nameFormat(item) }}</text>
            </uni-td>
            <uni-td align="center">{{ options.provider_valuetotext[item.provider] }}</uni-td>
            <uni-td align="center">{{ item.provider_pay_type }}</uni-td>
            <uni-td align="center">{{ item.uni_platform }}</uni-td>
            <uni-td align="center">{{ options.status_valuetotext[item.status] }}</uni-td>
            <uni-td align="center">{{ item.type }}</uni-td>
            <uni-td align="center">{{ item.order_no }}</uni-td>
            <uni-td align="center">{{ item.out_trade_no }}</uni-td>
            <uni-td align="center">{{ item.transaction_id }}</uni-td>
            <uni-td align="center">{{ item.description }}</uni-td>
            <uni-td align="center">{{ (item.total_fee * 0.01).toFixed(2) }}</uni-td>
            <uni-td align="center">{{ (item.refund_fee * 0.01).toFixed(2) }}</uni-td>
            <uni-td align="center">{{ item.refund_count }}</uni-td>
            <uni-td align="center">
              <view v-if="item.user_order_success === true" style="color: #18bc37">✔正常</view>
              <view v-else-if="[-1, 0].indexOf(item.status) > -1">-</view>
              <view v-else style="color: #e43d33">●异常</view>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.pay_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.cancel_date"></uni-dateformat>
            </uni-td>
            <uni-td align="center">{{ item.provider_appid }}</uni-td>
            <uni-td align="center">{{ item.appid }}</uni-td>
            <uni-td align="center">{{ item.device_id }}</uni-td>
            <uni-td align="center">{{ item.client_ip }}</uni-td>
            <uni-td align="center">{{ item.openid }}</uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>

    <uni-popup ref="popupRef" type="center" :animation="false">
      <view style="padding: 30px; background-color: #ffffff; width: 500px">
        <view style="margin-bottom: 20px; text-align: center; font-size: 20px; font-weight: bold">退款确认</view>
        <uni-forms ref="refundFormRef" :modelValue="refundFormData" label-position="left" labelWidth="100px" :rules="refundFormRules">
          <uni-forms-item label="退款金额" name="refund_fee">
            <uni-easyinput type="text" v-model.number="refundFormData.refund_fee" placeholder="请输入退款金额" :clearable="false"></uni-easyinput>
            <view style="color: #666; margin-top: 5px; font-size: 12px">最大可退：{{ refundFormData.max_refund_fee }}</view>
          </uni-forms-item>
          <uni-forms-item label="退款原因" name="refund_desc">
            <uni-easyinput type="textarea" v-model="refundFormData.refund_desc" placeholder="请输入退款原因" :clearable="false" />
          </uni-forms-item>
          <button type="warn" style="width: 100px; height: 40px; font-size: 16px" @click="confirmRefund(refundFormData)">确定</button>
        </uni-forms>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
  import { enumConverter, filterToWhere } from '../../../../js_sdk/validator/uni-pay-orders.js';
  // 引入支付云对象
  // 引入支付云对象
  const uniPayCo = uniCloud.importObject('uni-pay-co');
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = 'create_date desc'; // 排序字段
  // 排序字段
  const dbSearchFields = ['order_no', 'out_trade_no', 'transaction_id']; // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20;
  const pageCurrent = 1;
  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
  };
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
  import { computed, nextTick, ref, watch } from 'vue';
  import { onLoad, onReady } from '@dcloudio/uni-app';
  const collectionListState = ref('uni-pay-orders');
  const collectionList = collectionListState;
  const queryState = ref({
    appid: '',
    platform_id: '',
    uni_platform: '',
    version: '',
    pay_date: [],
  });
  const query = queryState;
  const whereState = ref('');
  const where = whereState;
  const orderbyState = ref(dbOrderBy);
  const orderby = orderbyState;
  const orderByFieldNameState = ref('');
  const orderByFieldName = orderByFieldNameState;
  const selectedIndexsState = ref([]);
  const selectedIndexs = selectedIndexsState;
  const filterDefaultValueUserIdState = ref('');
  const filterDefaultValueUserId = filterDefaultValueUserIdState;
  const refundFormDataState = ref({
    out_trade_no: '',
    max_refund_fee: '',
    refund_fee: '',
    refund_desc: '',
  });
  const refundFormData = refundFormDataState;
  const refundFormRulesState = ref({
    refund_fee: {
      rules: [
        // 校验 name 不能为空
        {
          required: true,
          errorMessage: '退款金额必须>0',
        },
        // 对name字段进行长度验证
        {
          minimum: 0.01,
          maximum: 0,
          errorMessage: '最大可退 {maximum} 元',
        },
      ],
    },
    refund_desc: {
      rules: [
        // 校验 name 不能为空
        {
          required: true,
          errorMessage: '请输入退款原因',
        },
      ],
    },
  });
  const refundFormRules = refundFormRulesState;
  const optionsState = ref({
    pageSize,
    pageCurrent,
    filterData: {
      provider_localdata: [
        {
          text: '微信支付',
          value: 'wxpay',
        },
        {
          text: '支付宝',
          value: 'alipay',
        },
        {
          text: '苹果应用内支付',
          value: 'appleiap',
        },
      ],
      status_localdata: [
        {
          text: '已关闭',
          value: -1,
        },
        {
          text: '未支付',
          value: 0,
        },
        {
          text: '已支付',
          value: 1,
        },
        {
          text: '已部分退款',
          value: 2,
        },
        {
          text: '已全额退款',
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
    filename: 'uni-pay-orders.xls',
    type: 'xls',
    fields: {
      用户ID: 'user_id',
      用户昵称: 'nickname',
      支付供应商: 'provider',
      支付方式: 'provider_pay_type',
      应用平台: 'uni_platform',
      订单状态: 'status',
      支付失败原因: 'err_msg',
      订单类型: 'type',
      业务系统订单号: 'order_no',
      支付插件订单号: 'out_trade_no',
      交易单号: 'transaction_id',
      支付描述: 'description',
      订单支付金额: 'total_fee',
      订单退款金额: 'refund_fee',
      当前退款笔数: 'refund_count',
      退款详情: 'refund_list',
      回调状态: 'user_order_success',
      创建时间: 'create_date',
      支付时间: 'pay_date',
      异步通知时间: 'notify_date',
      取消时间: 'cancel_date',
      开放平台appid: 'provider_appid',
      'DCloud AppId': 'appid',
      设备ID: 'device_id',
      客户端IP: 'client_ip',
      openid: 'openid',
    },
  });
  const exportExcel = exportExcelState;
  const exportExcelDataState = ref([]);
  const exportExcelData = exportExcelDataState;
  const _filterState = ref(undefined);
  const _filter = _filterState;
  const udbRef = ref(null);
  const tableRef = ref(null);
  const popupRef = ref(null);
  const refundFormRef = ref(null);
  const versionQueryComputed = computed(() => {
    const { appid, uni_platform } = queryState.value;
    const query = stringifyQuery({
      appid,
      uni_platform,
    });
    return query;
  });
  const versionQuery = versionQueryComputed;
  const onqueryloadAction = (data) => {
    exportExcelDataState.value = data;
  };
  const onqueryload = onqueryloadAction;
  const getWhereAction = () => {
    let where = '';
    let {
      pay_date,
      appid,
      version,
      uni_platform,
      //query, // 模糊查询
    } = queryState.value;
    if (pay_date && pay_date.length == 2) {
      where += ` && pay_date>=${pay_date[0]} && pay_date<=${pay_date[1]}`;
    }
    if (appid) {
      where += ` && appid=='${appid}'`;
    }
    if (version) {
      where += ` && stat_data.app_version=='${version}'`;
    }
    if (uni_platform) {
      where += ` && stat_data.platform=='${uni_platform}'`;
    }

    // if (query) {
    // 	const queryRe = new RegExp(query, 'i');
    // 	let queryReStr = dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ');
    // 	where += ` && (${queryReStr})`;
    // }

    // if (query) {
    // 	const queryRe = new RegExp(query, 'i');
    // 	let queryReStr = dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ');
    // 	where += ` && (${queryReStr})`;
    // }

    where = where.substring(3).trim();
    // console.log('where: ', where)
    // console.log('where: ', where)
    return where;
  };
  const getWhere = getWhereAction;
  const searchAction = () => {
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
  const refundPopupAction = (key, item) => {
    if (key) {
      let { total_fee = 0, refund_fee = 0, out_trade_no } = item;
      let max_refund_fee = Number(((total_fee - refund_fee) / 100).toFixed(2));
      refundFormDataState.value.max_refund_fee = max_refund_fee;
      refundFormDataState.value.refund_fee = max_refund_fee;
      refundFormDataState.value.out_trade_no = out_trade_no;
      refundFormRulesState.value.refund_fee.rules[1].maximum = max_refund_fee;
      popupRef.value.open();
    } else {
      refundFormDataState.value.max_refund_fee = '';
      refundFormDataState.value.refund_fee = '';
      refundFormDataState.value.out_trade_no = '';
      refundFormRulesState.value.refund_fee.rules[1].maximum = 0;
      popupRef.value.close();
    }
  };
  const refundPopup = refundPopupAction;
  const confirmRefundAction = async (item) => {
    let { total_fee = 0, refund_fee = 0, out_trade_no, refund_desc } = item;
    item.refund_fee = Number(item.refund_fee.toFixed(2));
    refundFormRef.value
      .validate()
      .then(async (formData) => {
        //console.log('表单数据信息：', formData);
        let apply_refund_fee = Number(refund_fee);
        if (isNaN(apply_refund_fee) || apply_refund_fee <= 0) {
          uni.showToast({
            title: '请输入正确的退款金额',
            icon: 'none',
            success: () => {
              setTimeout(() => {
                confirmRefundAction(item);
              }, 500);
            },
          });
          return;
        }
        let refundData = {
          out_trade_no,
          refund_fee: parseInt(apply_refund_fee * 100),
          // 金额已分为单位，100 = 1元
          refund_desc,
        };
        //console.log('refundData: ', refundData)
        let res = await uniPayCo.refund(refundData);
        if (!res.errCode) {
          refundPopupAction(false);
          loadDataAction(false);
        }
      })
      .catch((err) => {
        //console.log('表单错误信息：', err);
      });
  };
  const confirmRefund = confirmRefundAction;
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
  const filterChangeAction = (e, name, k) => {
    if (k && e.filter) {
      if (typeof e.filter == 'object') {
        if (typeof e.filter[0] === 'number') e.filter[0] = e.filter[0] / k;
        if (typeof e.filter[1] === 'number') e.filter[1] = e.filter[1] / k;
      }
    }
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
  const platformChangeAction = (id, index, name, item) => {
    queryState.value.version = 0;
    queryState.value.uni_platform = item.code;
  };
  const platformChange = platformChangeAction;
  const nameFormatAction = (item) => {
    if (!item.user_id) {
      return '匿名用户';
    } else if (item.nickname) {
      return `${item.user_id}（${item.nickname}）`;
    } else {
      return item.user_id;
    }
  };
  const nameFormat = nameFormatAction;
  const pageToUserAction = (item) => {
    let { user_id } = item;
    uni.navigateTo({
      url: `/pages/system/user/list?id=${user_id}`,
    });
  };
  const pageToUser = pageToUserAction;
  const toUniIdDocAction = () => {
    // #ifdef WEB
    window.open('https://doc.dcloud.net.cn/uniCloud/uni-id/summary.html');
    // #endif
  };
  const toUniIdDoc = toUniIdDocAction;
  watch(
    () => queryState.value,
    (val) => {
      searchAction();
    },
    {
      deep: true,
    }
  );
  onLoad((e) => {
    _filterState.value = {};
    if (e.user_id) {
      filterDefaultValueUserIdState.value = e.user_id;
      filterChangeAction(
        {
          filterType: 'search',
          filter: e.user_id,
        },
        'user_id'
      );
    }
  });
  onReady(() => {
    udbRef.value.loadData();
  });
</script>

<style lang="scss" scoped>
  .text-btn {
    color: $uni-color-primary;
    cursor: pointer;
    margin: 0 5px;
  }
</style>
