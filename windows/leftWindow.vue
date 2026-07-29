<template>
  <scroll-view class="sidebar" scroll-y="true">
    <uni-data-menu
      ref="menu"
      :value="currentMenu"
      :staticMenu="staticMenu"
      collection="opendb-admin-menus"
      :page-size="500"
      :field="field"
      where="enable==true"
      orderby="sort asc"
      active-text-color="#409eff"
      @select="select"
    >
    </uni-data-menu>
  </scroll-view>
</template>

<script setup>
  import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { store as uniIdStore } from '@/uni_modules/uni-id-pages/common/store.js';
  import config from '@/admin.config.js';

  const store = useStore();
  const { proxy } = getCurrentInstance();
  const menu = ref(null);
  const staticMenu = config.sideBar.staticMenu;
  const field = 'url as value, name as text, menu_id, parent_id, sort, icon, permission';
  const currentMenu = ref('/');
  const inited = computed(() => store.state.app.inited);
  const navMenu = computed(() => store.state.app.navMenu);
  const active = computed(() => store.state.app.active);
  const userInfo = computed(() => uniIdStore.userInfo);

  const setRoutes = (routes) => store.dispatch('app/setRoutes', routes);
  const splitFullPath = (path) => (path || '/').split('?')[0];

  const clickMenuItem = (targetUrl) => {
    let url = targetUrl;
    // #ifdef H5
    if (url.indexOf('http') === 0) return window.open(url);
    // #endif

    if (url[0] !== '/' && url.indexOf('http') !== 0) url = '/' + url;
    // #ifndef H5
    if (url === '/') url = config.index.url;
    // #endif
    uni.redirectTo({
      url,
      fail: () => {
        uni.showModal({
          title: '提示',
          content: '页面 ' + url + ' 跳转失败',
          showCancel: false,
        });
      },
    });
  };

  const select = (event, routes) => {
    const url = event.value || active.value;
    clickMenuItem(url);
    setRoutes(routes);
    // #ifdef H5
    uni.hideLeftWindow();
    // #endif
  };

  // #ifdef H5
  watch(
    () => proxy.$route,
    (route) => {
      if (route.fullPath) currentMenu.value = splitFullPath(route.fullPath);
    },
    { immediate: true }
  );
  // #endif

  watch(userInfo, (value) => {
    if (value) {
      nextTick(() => {
        menu.value.load();
      });
    }
  });
</script>

<style lang="scss">
  .sidebar {
    position: fixed;
    // top: var(--top-window-height); // useless
    width: 240px;
    height: calc(100vh - (var(--top-window-height)));
    box-sizing: border-box;
    border-right: 1px solid darken($left-window-bg-color, 8%);
    background-color: $left-window-bg-color;
    padding-bottom: 10px;
  }
  /* #ifdef H5 */
  .sidebar ::-webkit-scrollbar {
    display: none;
    // scrollbar-width: thin;
  }
  /* #endif */

  .title {
    margin-left: 5px;
  }
</style>
