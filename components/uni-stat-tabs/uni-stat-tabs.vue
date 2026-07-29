<template>
  <view class="uni-stat--tab-x">
    <view v-if="label" class="uni-label-text hide-on-phone">{{ label + '：' }}</view>
    <view class="uni-stat--tab">
      <view v-if="!renderTabs.length" class="uni-stat--tab-item uni-stat--tab-item-disabled" :class="[`uni-stat--tab-item-${type}`]">
        {{ placeholder }}
      </view>
      <template v-else>
        <template v-for="(item, index) in renderTabs">
          <view
            v-if="item.enable"
            :key="index"
            @click="change(item, index)"
            class="uni-stat--tab-item"
            :class="[index === currentTab ? `uni-stat--tab-item-${type}-active` : '', `uni-stat--tab-item-${type}`, item.disabled ? 'uni-stat--tab-item-disabled' : '']"
          >
            <!-- #ifdef MP -->
            {{ item.name }}
            <!-- #endif -->
            <!-- #ifndef MP -->
            <uni-tooltip>
              {{ item.name }}
              <uni-icons v-if="item.tooltip" type="help" color="#666" />
              <template v-if="item.tooltip" v-slot:content>
                <view class="uni-stat-tooltip-s">
                  {{ item.tooltip }}
                </view>
              </template>
            </uni-tooltip>
            <!-- #endif -->
          </view>
        </template>
      </template>
    </view>
    <view v-if="costom" class="costom-box">
      <view class="coston-inner">
        <button class="uni-btn" size="mini" type="primary">自定义平台</button>
        <view class="costom-dialog">
          <view class="costom-dialog-inner">
            <uni-data-checkbox multiple v-model="customCheck" :map="{ text: 'name', value: 'code' }" :localdata="costomList" mode="list"></uni-data-checkbox>
            <view class="costom-dialog-bottom">
              <button class="uni-btn" size="mini">取消</button>
              <button class="uni-btn" size="mini" type="primary">确定</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { nextTick, onMounted, ref, watch } from 'vue';
  defineOptions({
    name: 'uni-stat-tabs',
  });
  const props = defineProps({
    type: {
      type: String,
      default: 'line',
    },
    value: {
      type: [String, Number],
      default: '',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    current: {
      type: [String, Number],
      default: 0,
    },
    mode: {
      type: String,
      default: '',
    },
    today: {
      type: Boolean,
      default: false,
    },
    yesterday: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: Boolean,
      default: false,
    },
    all: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '暂无选项',
    },
    tabs: {
      type: Array,
      default: () => {
        return [];
      },
    },
    costom: {
      type: Boolean,
      default: false,
    },
  });
  const emitEvent = defineEmits(['change', 'input', 'update:modelValue']);
  const currentTabState = ref(0);
  const currentTab = currentTabState;
  const renderTabsState = ref([]);
  const renderTabs = renderTabsState;
  const cacheKeyState = ref('uni-admin-statTabsData');
  const cacheKey = cacheKeyState;
  const customCheckState = ref([]);
  const customCheck = customCheckState;
  const costomListState = ref([
    {
      value: 0,
      text: '微信小程序',
    },
  ]);
  const costomList = costomListState;
  const lastState = ref(undefined);
  const last = lastState;
  const initAction = () => {
    if (props.mode.indexOf('platform') > -1) {
      renderTabsState.value = getCacheAction() || [];
      getPlatformAction();
    } else if (props.mode === 'date') {
      const dates = [
        {
          _id: 7,
          name: '最近7天',
          enable: true,
        },
        {
          _id: 30,
          name: '最近30天',
          enable: true,
        },
        {
          _id: 90,
          name: '最近90天',
          enable: true,
        },
      ];
      if (props.yesterday) {
        dates.unshift({
          _id: 1,
          name: '昨天',
          enable: true,
        });
      }
      if (props.today) {
        dates.unshift({
          _id: 0,
          name: '今天',
          enable: true,
        });
      }
      renderTabsState.value = dates;
    } else {
      renderTabsState.value = props.tabs;
    }
  };
  const init = initAction;
  const changeAction = (item, index) => {
    if (item.disabled) return;
    const id = item._id;
    const name = item.name;
    currentTabState.value = index;
    emitAction(id, index, name, item);
  };
  const change = changeAction;
  const emitAction = (id, index, name, item) => {
    emitEvent('change', id, index, name, item);
    emitEvent('input', id, index, name);
    emitEvent('update:modelValue', id, index, name);
  };
  const emit = emitAction;
  const getPlatformAction = () => {
    const db = uniCloud.database();
    const appList = db
      .collection('uni-stat-app-platforms')
      .get()
      .then((res) => {
        let platforms = res.result.data;
        platforms = platforms.filter((p) => (p.hasOwnProperty('enable') ? p.enable : true));
        platforms.sort((a, b) => a.order - b.order);
        if (props.mode === 'platform-channel') {
          platforms = platforms.filter((item) => /^android|ios|harmony$/.test(item.code));
          let _id = platforms.map((p) => `platform_id == "${p._id}"`).join(' || ');
          _id = `(${_id})`;
          setAllItemAction(platforms, _id);
        } else if (props.mode === 'platform-scene') {
          platforms = platforms.filter((item) => /mp-/.test(item.code));
          let _id = platforms.map((p) => `platform_id == "${p._id}"`).join(' || ');
          _id = `(${_id})`;
          setAllItemAction(platforms, _id);
        } else {
          setAllItemAction(platforms);
        }
        setCacheAction(platforms);
        renderTabsState.value = platforms;
        costomListState.value = [];
        renderTabsState.value.forEach((item) => {
          if (item.name !== '全部') {
            costomListState.value.push(item);
          }
        });
        console.log(costomListState.value);
      });
  };
  const getPlatform = getPlatformAction;
  const setAllItemAction = (platforms, _id = '', name = '全部') => {
    props.all &&
      platforms.unshift({
        name,
        _id,
        code: '',
        enable: true,
      });
  };
  const setAllItem = setAllItemAction;
  const getCurrentCacheKeyAction = () => {
    return props.mode;
  };
  const getCurrentCacheKey = getCurrentCacheKeyAction;
  const getCacheAction = (name = getCurrentCacheKeyAction()) => {
    let cacheData = uni.getStorageSync(cacheKeyState.value) || {};
    const tabs = cacheData[name];
    if (!Array.isArray(tabs)) return tabs;
    if (!props.all) return tabs.filter((item) => item.name !== '全部');
    return tabs.map((item) => {
      if (item.name !== '全部') return item;
      return {
        ...item,
        code: '',
        enable: true,
      };
    });
  };
  const getCache = getCacheAction;
  const setCacheAction = (value, name = getCurrentCacheKeyAction()) => {
    let cacheData = uni.getStorageSync(cacheKeyState.value) || {};
    cacheData[name] = value;
    uni.setStorageSync(cacheKeyState.value, cacheData);
  };
  const setCache = setCacheAction;
  const removeCacheAction = (name = getCurrentCacheKeyAction()) => {
    let cacheData = uni.getStorageSync(cacheKeyState.value) || {};
    delete cacheData[name];
    uni.setStorageSync(cacheKeyState.value, cacheData);
  };
  const removeCache = removeCacheAction;
  watch(
    () => props.current,
    (val) => {
      currentTabState.value = val;
    },
    {
      immediate: true,
    }
  );
  watch(
    () => props.tabs,
    (val) => {
      initAction();
    },
    {
      immediate: false,
    }
  );
  watch(
    () => renderTabsState.value,
    (val) => {
      const index = props.current;
      if (props.mode && val.length && index >= 0) {
        nextTick(function () {
          const item = renderTabsState.value[index];
          changeAction(item, index);
        });
      }
    }
  );
  lastState.value = `${props.mode.replace('-', '_')}_last_data`;
  onMounted(() => {
    initAction();
  });
</script>

<style lang="scss">
  .uni-stat-tooltip-s {
    width: 160px;
    white-space: normal;
  }

  .uni-label-text {
    font-size: 14px;
    font-weight: bold;
    color: #555;
    margin-top: 17px;
    margin-bottom: 17px;
    margin-right: 5px;
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }

  .uni-stat--tab-x {
    display: flex;
    margin: 0 15px;
    white-space: nowrap;
  }

  .uni-stat--tab {
    display: flex;
    flex-wrap: wrap;
  }

  .uni-stat {
    &--tab {
      &-item {
        white-space: nowrap;
        font-size: 14px;
        color: #666;
        text-align: center;
        cursor: pointer;
        box-sizing: border-box;
        margin: 15px 0;

        &-disabled {
          cursor: unset;
          opacity: 0.4;
        }

        &-line {
          margin-right: 30px;
          padding: 2px 0;
          border-bottom: 1px solid transparent;

          &:last-child {
            margin-right: 0;
          }

          &-active {
            color: $uni-color-primary;
            border-bottom: 1px solid $uni-color-primary;
            // &-disabled {
            // 	color: #666;
            // 	border-color: #666;
            // }
          }
        }

        &-boldLine {
          box-sizing: border-box;
          margin-right: 30px;
          padding: 2px 0;
          border-bottom: 2px solid transparent;

          &:last-child {
            margin-right: 0;
          }

          &-active {
            box-sizing: border-box;
            color: $uni-color-primary;
            border-bottom: 2px solid $uni-color-primary;
          }
        }

        &-box {
          padding: 5px 15px;
          border: 1px solid #dcdfe6;
          // margin: 0;

          &:not(:last-child) {
            border-right-color: transparent;
          }

          &-active {
            box-sizing: border-box;
            border: 1px solid $uni-color-primary !important;
          }
        }
      }
    }
  }

  /* #ifndef APP-NVUE */
  @media screen and (max-width: 500px) {
    .hide-on-phone {
      display: none;
    }

    .uni-stat--tab {
      flex-wrap: unset;
      overflow-x: auto !important;
    }
    /* #ifdef H5 */
    ::-webkit-scrollbar {
      display: none;
    }
    /* #endif */
  }

  /* #endif */

  .costom-box {
    display: flex;
    align-items: center;
    margin-left: 20px;
    height: auto;
    width: auto;
    .coston-inner {
      position: relative;
      .costom-dialog {
        position: absolute;
        top: 40px;
        right: 0;
        border: 1px #eee solid;
        box-sizing: border-box;
        width: 200px;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.1);

        // z-index: 10;
        &::before {
          content: '';
          position: absolute;
          right: 40px;
          top: -5px;
          width: 10px;
          height: 10px;
          transform: rotate(45deg);
          // border: 1px red solid;
          z-index: 0;
          background-color: #fff;
          box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.1);
        }
        .costom-dialog-inner {
          position: relative;
          padding: 15px;
          width: 100%;
          height: 100%;
          background-color: #fff;
          box-sizing: border-box;
          z-index: 2;
        }
        .costom-dialog-bottom {
          margin-top: 20px;
          display: flex;
          align-items: center;
        }
      }
    }
  }
</style>
