<template>
  <view
    class="uni-menu-item"
    :class="{
      'is-active': active,
      'is-disabled': disabled,
    }"
    :style="{
      paddingLeft: paddingLeft,
      'background-color': active ? activeBackgroundColor : '',
    }"
    @click="onClickItem"
  >
    <slot></slot>
  </view>
</template>

<script setup>
  import { computed, inject, onBeforeUnmount, ref } from 'vue';
  import { navMenuKey, subMenuPathKey } from '../uni-nav-menu/menu-context.js';

  defineOptions({ name: 'uniMenuItem' });

  const props = defineProps({
    // 唯一标识
    index: {
      type: [String, Object],
      default() {
        return '';
      },
    },
    // TODO 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const menu = inject(navMenuKey);
  const subMenus = inject(subMenuPathKey, []);
  const active = ref(false);
  const activeTextColor = menu.activeTextColor;
  const textColor = menu.textColor;
  const activeBackgroundColor = menu.activeBackgroundColor;
  const paddingLeft = computed(() => `${20 + 20 * subMenus.length}px`);

  const item = {
    get active() {
      return active.value;
    },
    set active(value) {
      active.value = value;
    },
    get disabled() {
      return props.disabled;
    },
    get index() {
      return props.index;
    },
    indexPath: [],
    onClickItem,
    subMenus,
  };

  function onClickItem(event) {
    if (props.disabled) return;
    menu.closeOtherActive(item);
    active.value = true;
    item.indexPath = [...item.indexPath, props.index];
    if (event !== 'init') menu.select(props.index, item.indexPath);
  }

  const unregister = menu.registerItem(item);
  onBeforeUnmount(unregister);
</script>

<style lang="scss">
  .uni-menu-item {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 56px;
    line-height: 56px;
    color: #303133;
    transition: all 0.3s;
    cursor: pointer;
    // border-bottom: 1px #f5f5f5 solid;
  }

  .uni-menu-item:hover {
    outline: none;
    background-color: #ebebeb;
    transition: all 0.3s;
  }

  .is-active {
    color: $uni-color-primary;
    // background-color: #ecf8f3;
  }

  .is-disabled {
    // background-color: #f5f5f5;
    color: #999;
  }

  .uni-menu-item.is-disabled:hover {
    background-color: inherit;
    color: #999;
    cursor: not-allowed;
  }
</style>
