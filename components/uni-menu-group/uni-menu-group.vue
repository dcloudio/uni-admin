<template>
  <view class="uni-menu-group">
    <view class="uni-menu-group__title" name="title" :style="{ paddingLeft: paddingLeft }">{{ title }}</view>
    <slot></slot>
  </view>
</template>

<script setup>
  import { computed, inject } from 'vue';
  import { subMenuPathKey } from '../uni-nav-menu/menu-context.js';

  defineOptions({ name: 'uniMenuGroup' });
  defineProps({ title: String });

  const subMenus = inject(subMenuPathKey, []);
  const paddingLeft = computed(() => `${20 + 20 * subMenus.length}px`);
</script>

<style>
  .uni-menu-group {
    /* border: 1px red solid; */
  }
  .uni-menu-group__title {
    line-height: 36px;
    font-size: 12px;
    color: #999;
  }
</style>
