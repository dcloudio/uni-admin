<template>
  <view class="uni-sub-menu">
    <view class="uni-sub-menu__title" :class="{ 'is-disabled': disabled }" :style="{ paddingLeft: paddingLeft }" @click="select">
      <view class="uni-sub-menu__title-sub" :style="{ color: disabled ? '#999' : textColor }">
        <slot name="title"></slot>
      </view>
      <uni-icons class="uni-sub-menu__icon" :class="{ transition: isOpen }" type="down" color="#bbb" size="14"></uni-icons>
    </view>
    <view class="uni-sub-menu__content" :class="{ 'uni-sub-menu--close': !isOpen }" :style="{ 'background-color': backgroundColor }">
      <view id="content--hook">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { computed, inject, onBeforeUnmount, provide, ref } from 'vue';
  import { navMenuKey, subMenuPathKey } from '../uni-nav-menu/menu-context.js';

  defineOptions({ name: 'uniSubMenu' });

  const props = defineProps({
    // 唯一标识
    index: {
      type: [String, Object],
      default() {
        return '';
      },
    },
    // TODO 自定义类名
    popperClass: {
      type: String,
      default: '',
    },
    // TODO 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 展开菜单的背景色
    backgroundColor: {
      type: String,
      default: '#f5f5f5',
    },
  });

  const menu = inject(navMenuKey);
  const subMenus = inject(subMenuPathKey, []);
  const isOpen = ref(false);
  const textColor = menu.textColor;
  const paddingLeft = computed(() => `${20 + 20 * subMenus.length}px`);

  const subMenu = {
    get disabled() {
      return props.disabled;
    },
    get index() {
      return props.index;
    },
    get isOpen() {
      return isOpen.value;
    },
    set isOpen(value) {
      isOpen.value = value;
    },
    subMenus,
  };

  provide(subMenuPathKey, [...subMenus, subMenu]);

  const select = () => {
    if (!props.disabled) menu.selectMenu(subMenu);
  };
  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };

  const unregister = menu.registerSubMenu(subMenu);
  onBeforeUnmount(unregister);

  defineExpose({ close, open });
</script>

<style lang="scss">
  .uni-sub-menu {
    position: relative;
    /* background-color: #FFFFFF; */
  }

  .uni-sub-menu__title {
    display: flex;
    align-items: center;
    padding: 0 20px;
    padding-right: 10px;
    height: 56px;
    line-height: 56px;
    color: #303133;
    cursor: pointer;
    /* border-bottom: 1px #f5f5f5 solid; */
  }

  .uni-sub-menu__title:hover {
    color: #42b983;
    outline: none;
    background-color: #ebebeb;
  }

  .uni-sub-menu__title-sub {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .uni-sub-menu--close {
    height: 0;
    /* transition: all 0.3s; */
  }

  .uni-sub-menu__content {
    overflow: hidden;
  }

  .uni-sub-menu__icon {
    max-height: auto;
    transition: all 0.2s;
  }

  .transition {
    transform: rotate(-180deg);
  }

  .is-disabled {
    /* background-color: #f5f5f5; */
    color: red;
  }
  .uni-sub-menu__title.is-disabled:hover {
    background-color: inherit;
    color: #999;
    cursor: not-allowed;
  }
</style>
