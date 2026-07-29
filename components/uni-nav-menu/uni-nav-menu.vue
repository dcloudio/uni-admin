<template>
  <view class="uni-nav-menu" :style="{ 'background-color': backgroundColor }">
    <slot>
      <uni-menu-sidebar :data="data"></uni-menu-sidebar>
    </slot>
  </view>
</template>

<script setup>
  import { provide, ref, watch } from 'vue';
  import { navMenuKey, subMenuPathKey } from './menu-context.js';

  defineOptions({ name: 'uniNavMenu' });

  const props = defineProps({
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    // 模式	可选值 horizontal / vertical
    mode: {
      type: String,
      default: 'vertical',
    },
    // 是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）
    collapse: {
      type: Boolean,
      default: false,
    },
    // 菜单的背景色
    backgroundColor: {
      type: String,
      default: '#fff',
    },
    // 菜单的文字颜色
    textColor: {
      type: String,
      default: '#303133',
    },
    // 当前激活菜单的文字颜色
    activeTextColor: {
      type: String,
      default: '#42B983',
    },
    // 当前激活菜单的背景色
    activeBackgroundColor: {
      type: String,
      default: 'inherit',
    },
    // 如果 index 为 Object ，需要指定选中字段的名称
    activeKey: {
      type: String,
      default: 'id',
    },
    // 当前激活菜单的 index
    active: {
      type: String,
      default: '',
    },
    // 当前打开的 sub-menu 的 index 的数组
    defaultOpeneds: {
      type: Array,
      default() {
        return [];
      },
    },
    // 是否只保持一个子菜单的展开
    uniqueOpened: {
      type: Boolean,
      default: false,
    },
    // TODO 子菜单打开的触发方式(只在 mode 为 horizontal 时有效) ，可选值 	 hover / click
    menuTrigger: {
      type: String,
      default: 'hover',
    },
    router: {
      type: Boolean,
      default: false,
    },
    // 是否开启折叠动画
    collapseTransition: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['select', 'open', 'close']);
  const activeIndex = ref(props.active);
  const itemChildren = [];
  const subMenuChildren = [];

  const select = (key, keyPath) => emit('select', key, keyPath);
  const open = (key, keyPath) => emit('open', key, keyPath);
  const close = (key, keyPath) => emit('close', key, keyPath);

  const isActive = (item) => {
    let active = '';
    if (typeof item.index === 'object') {
      active = item.index[props.activeKey] || '';
    } else {
      active = item.index;
    }

    if (item.index && activeIndex.value === active) {
      item.subMenus.forEach((subMenu) => {
        if (!subMenu.disabled && !item.disabled) {
          subMenu.isOpen = true;
        }
      });
      if (!item.active) item.onClickItem('init');
      return true;
    }
    return false;
  };

  const selectMenu = (subMenu) => {
    subMenuChildren.forEach((item) => {
      if (item === subMenu) {
        subMenu.isOpen = !subMenu.isOpen;
      } else if (item.isOpen && props.uniqueOpened) {
        item.isOpen = false;
      }
    });

    subMenu.subMenus.forEach((ancestor) => {
      ancestor.isOpen = true;
    });
    const indexPath = [...subMenu.subMenus.map((item) => item.index), subMenu.index];
    if (subMenu.isOpen) {
      open(subMenu.index, indexPath);
    } else {
      close(subMenu.index, indexPath);
    }
  };

  const closeOtherActive = (itemMenu) => {
    itemMenu.indexPath = itemMenu.subMenus.filter((item) => !item.disabled).map((item) => item.index);
    itemChildren.forEach((item) => {
      if (item.active) item.active = false;
    });
  };

  const closeAll = () => {
    subMenuChildren.forEach((item) => {
      if (item.isOpen) item.isOpen = false;
    });
  };

  const registerItem = (item) => {
    itemChildren.push(item);
    isActive(item);
    return () => {
      const index = itemChildren.indexOf(item);
      if (index !== -1) itemChildren.splice(index, 1);
    };
  };

  const registerSubMenu = (subMenu) => {
    subMenuChildren.push(subMenu);
    return () => {
      const index = subMenuChildren.indexOf(subMenu);
      if (index !== -1) subMenuChildren.splice(index, 1);
    };
  };

  provide(navMenuKey, {
    activeBackgroundColor: props.activeBackgroundColor,
    activeTextColor: props.activeTextColor,
    closeOtherActive,
    registerItem,
    registerSubMenu,
    select,
    selectMenu,
    textColor: props.textColor,
  });
  provide(subMenuPathKey, []);

  watch(
    () => props.active,
    (value) => {
      activeIndex.value = value;
    }
  );

  watch(activeIndex, () => {
    if (itemChildren.length) {
      let matched = false;
      for (const item of itemChildren) {
        matched = isActive(item);
        if (matched) break;
      }
      if (!matched) closeAll();
    }
  });
</script>

<style lang="scss">
  .uni-nav-menu {
    width: 240px;
    // min-height: 500px;
    background-color: #ffffff;
    font-size: 14px;
  }
</style>
