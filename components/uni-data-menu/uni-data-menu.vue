<template>
  <view>
    <uni-nav-menu :active="value" activeKey="value" :activeTextColor="activeTextColor" :uniqueOpened="uniqueOpened" @select="onSelect">
      <uni-menu-sidebar :data="userMenu"></uni-menu-sidebar>
      <uni-menu-sidebar :data="staticMenu"></uni-menu-sidebar>
    </uni-nav-menu>
  </view>
</template>

<script setup>
  import { getCurrentInstance, onBeforeMount, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { buildMenus } from './util.js';

  defineOptions({ mixins: [uniCloud.mixinDatacom] });

  const props = defineProps({
    // 当前激活菜单的 url
    value: {
      type: String,
      default: '',
    },
    // 当前激活菜单的文字颜色
    activeTextColor: {
      type: String,
      default: '#42B983',
    },
    // 是否只保持一个子菜单的展开
    uniqueOpened: {
      type: Boolean,
      default: false,
    },
    staticMenu: {
      type: Array,
      default() {
        return [];
      },
    },
  });

  const emitEvent = defineEmits(['select', 'input']);
  const store = useStore();
  const { proxy } = getCurrentInstance();
  const menus = ref([]);
  const userMenu = ref([]);
  const famliy = ref([]);

  const setRoutes = (routes) => store.dispatch('app/setRoutes', routes);
  const hasLocalData = (value) => Array.isArray(value) && value.length > 0;

  const getUserMenu = (menuList) => {
    const { permission, role } = uniCloud.getCurrentUserInfo();
    menuList.forEach((item) => {
      if (!menuList.some((subMenuItem) => subMenuItem.parent_id === item.menu_id)) {
        item.isLeafNode = true;
      }
    });

    if (!role.includes('admin')) {
      menuList = menuList.filter((item) => {
        if (item.isLeafNode) {
          if (item.permission && item.permission.length) {
            return item.permission.some((item) => permission.indexOf(item) > -1);
          }
          return false;
        }
        return true;
      });
    }
    return buildMenus(menuList);
  };

  const getMenuAncestor = (menuId, menuList) => {
    menuList.forEach((item) => {
      if (item.menu_id !== menuId) return;
      const route = { name: item.text };
      if (item.value) route.to = { path: item.value };
      famliy.value.unshift(route);
      if (item.parent_id) getMenuAncestor(item.parent_id, menuList);
    });
  };

  const emit = (menu) => {
    emitEvent('select', menu, famliy.value);
    emitEvent('input', menu.value);
  };

  const onSelect = (menu) => {
    famliy.value = [];
    getMenuAncestor(menu.menu_id, menus.value);
    emit(menu);
  };

  const load = () => {
    if (proxy.mixinDatacomLoading === true) return;
    proxy.mixinDatacomLoading = true;
    proxy
      .mixinDatacomGet()
      .then((res) => {
        proxy.mixinDatacomLoading = false;
        menus.value = res.result.data;
        userMenu.value = getUserMenu(menus.value);
      })
      .catch((err) => {
        proxy.mixinDatacomLoading = false;
        proxy.mixinDatacomErrorMessage = err;
      });
  };

  watch(
    () => proxy.localdata,
    (value) => {
      if (hasLocalData(value)) userMenu.value = value;
    },
    { immediate: true }
  );

  // #ifdef H5
  watch(
    menus,
    (value) => {
      const route = proxy.$route;
      const item = route && value.find((menu) => menu.value === route.path);
      if (item) {
        getMenuAncestor(item.menu_id, value);
        setRoutes(famliy.value);
      }
    },
    { immediate: true }
  );
  // #endif

  watch(
    () => proxy.$route,
    (value, oldValue) => {
      if (value.fullPath !== oldValue.fullPath) {
        famliy.value = [];
        const menu = menus.value.find((item) => item.value === value.path);
        getMenuAncestor(menu && menu.menu_id, menus.value);
        setRoutes(famliy.value);
      }
    }
  );

  onBeforeMount(() => {
    if (!hasLocalData(proxy.localdata)) load();
  });

  defineExpose({ load });
</script>

<style></style>
