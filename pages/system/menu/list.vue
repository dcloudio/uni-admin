<template>
  <view>
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
    </view>
    <view class="uni-tabs__header">
      <view class="uni-tabs__nav-wrap">
        <view class="uni-tabs__nav-scroll">
          <view class="uni-tabs__nav">
            <view @click="switchTab('menus')" :class="{ 'is-active': currentTab === 'menus' }" class="uni-tabs__item">
              {{ $t('menu.text.menuManager') }}
            </view>
            <view @click="switchTab('pluginMenus')" v-if="pluginMenus.length" :class="{ 'is-active': currentTab === 'pluginMenus' }" class="uni-tabs__item">
              {{ $t('menu.text.additiveMenu') }}
              <uni-badge class="menu-badge" :text="pluginMenus.length" type="error"></uni-badge>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-show="currentTab === 'menus'">
      <view class="uni-header" style="border-bottom: 0; margin-bottom: -15px">
        <view class="uni-group">
          <button @click="navigateTo('./add')" size="mini" plain="true" type="primary">{{ $t('menu.button.addFirstLevelMenu') }}</button>
          <button @click="updateBuiltInMenu" size="mini" plain="true" style="margin-left: 10px" type="warn">{{ $t('menu.button.updateBuiltInMenu') }}</button>
        </view>
        <view class="uni-group"> </view>
      </view>
      <view class="uni-container">
        <unicloud-db
          ref="udbRef"
          @load="onqueryload"
          collection="opendb-admin-menus"
          :options="options"
          :where="where"
          page-data="replace"
          :orderby="orderby"
          :getcount="true"
          :page-size="options.pageSize"
          :page-current="options.pageCurrent"
          v-slot:default="{ data, pagination, loading, error }"
        >
          <uni-table :loading="loading" class="table-pc" :emptyText="errMsg || $t('common.empty')" border stripe>
            <uni-tr>
              <uni-th align="center">排序</uni-th>
              <uni-th width="200" align="center">名称</uni-th>
              <uni-th align="center">标识</uni-th>
              <uni-th align="center">URL</uni-th>
              <uni-th width="100" align="center">是否启用</uni-th>
              <uni-th align="center">操作</uni-th>
            </uni-tr>
            <uni-tr v-for="(item, index) in data" :key="index">
              <uni-td align="center">{{ item.sort }}</uni-td>
              <uni-td>{{ item.name }}</uni-td>
              <uni-td>{{ item.menu_id }}</uni-td>
              <uni-td>{{ item.url }}</uni-td>
              <uni-td align="center" :class="{ 'menu-disable': !item.enable }">
                <switch :checked="item.enable" @change="enableChange(item)" />
                <!-- {{ item.enable ? '已启用' : '未启用' }} -->
              </uni-td>
              <uni-td align="center">
                <view class="uni-group" style="justify-content: left">
                  <button @click="navigateTo('./edit?id=' + item._id, false)" class="uni-button" size="mini" type="primary">{{ $t('common.button.edit') }}</button>
                  <button v-if="item.menu_id !== 'system_menu' && item.menu_id !== 'system_management'" @click="confirmDelete(item)" class="uni-button" size="mini" type="warn">
                    {{ $t('common.button.delete') }}
                  </button>
                  <button v-if="!item.url" @click="navigateTo('./add?parent_id=' + item.menu_id, false)" class="uni-button" size="mini" type="primary">
                    {{ $t('menu.button.addChildMenu') }}
                  </button>
                </view>
              </uni-td>
            </uni-tr>
          </uni-table>
        </unicloud-db>
      </view>
    </view>
    <view v-show="currentTab === 'pluginMenus'">
      <view class="uni-header" style="border-bottom: 0; margin-bottom: -15px">
        <view class="uni-group">
          <button style="width: 130px" @click="addPluginMenus" size="mini" type="primary">添加选中的菜单</button>
        </view>
        <view class="uni-group"></view>
      </view>
      <view class="uni-container">
        <uni-table ref="pluginMenusTableRef" type="selection" border stripe @selection-change="pluginMenuSelectChange">
          <uni-tr>
            <uni-th align="center">名称（标识）</uni-th>
            <uni-th align="center">URL</uni-th>
            <uni-th align="center">插件菜单 json 文件</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in pluginMenus" :key="index">
            <uni-td>{{ item.name }}（{{ item.menu_id }}）</uni-td>
            <uni-td>{{ item.url }}</uni-td>
            <uni-td>{{ item.json }}</uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-sub-title" style="margin-top: 15px">
          以上待添加菜单来自于三方插件，添加后，将显示在菜单管理中，若不希望显示在上述表格中时，可手动删除项目中对应的`插件id-menu.json`文件。
        </view>
      </view>
    </view>
    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script setup>
  import { buildMenus } from '../../../components/uni-data-menu/util.js';
  import originalMenuList from './originalMenuList.json';
  const db = uniCloud.database();
  // 表查询配置
  // 表查询配置
  const dbOrderBy = 'create_date asc';
  // 分页配置
  // 分页配置
  const pageSize = 20000;
  const pageCurrent = 1;
  // 查找插件注册的菜单列表（目前仅在开发模式启用，仅限 admin 角色）
  // 查找插件注册的菜单列表（目前仅在开发模式启用，仅限 admin 角色）
  const pluginMenuJsons = [];
  if (process.env.NODE_ENV === 'development') {
    const rootModules = import.meta.glob('../../../uni_modules/*/*-menu.json', {
      eager: true,
    });
    for (const modulePath in rootModules) {
      const json = modulePath.replace(/^..\/..\/..\//, '');
      let moduleItem = rootModules[modulePath];
      if (typeof moduleItem === 'function') {
        // 兼容 HBX3.6.5或以下版本
        moduleItem().then((module) => {
          module = module.default ? module.default : module;
          module.forEach((item) => {
            item.json = json;
            pluginMenuJsons.push(item);
          });
        });
      } else {
        // 兼容 HBX3.6.13或以上版本
        let module = moduleItem.default ? moduleItem.default : moduleItem;
        module.forEach((item) => {
          item.json = json;
          pluginMenuJsons.push(item);
        });
      }
    }
    const pluginModules = import.meta.glob('../../../uni_modules/**/menu.json', {
      eager: true,
    });
    for (const modulePath in pluginModules) {
      const json = modulePath.replace(/^..\/..\/..\//, '');
      let moduleItem = pluginModules[modulePath];
      if (typeof moduleItem === 'function') {
        // 兼容 HBX3.6.5或以下版本
        moduleItem().then((module) => {
          module = module.default ? module.default : module;
          module.forEach((item) => {
            item.json = json;
            pluginMenuJsons.push(item);
          });
        });
      } else {
        // 兼容 HBX3.6.13或以上版本
        let module = moduleItem.default ? moduleItem.default : moduleItem;
        module.forEach((item) => {
          item.json = json;
          pluginMenuJsons.push(item);
        });
      }
    }
  }

  // 获取父的个数
  // 获取父的个数
  function getParents(menus, id, depth = 0) {
    menus.forEach((menu) => {
      if (menu.menu_id === id && menu.parent_id) {
        depth = depth + 1 + getParents(menus, menu.parent_id, depth);
      }
    });
    return depth;
  }

  // 获取子的 _id
  // 获取子的 _id
  function getChildren(menus, id, childrenIds = []) {
    if (menus.find((menu) => menu.parent_id === id)) {
      menus.forEach((item) => {
        if (item.parent_id === id) {
          childrenIds.push(item._id);
          getChildren(menus, item.menu_id, childrenIds);
        }
      });
    }
    return childrenIds;
  }
  import { computed, getCurrentInstance, ref, watch } from 'vue';
  const { proxy } = getCurrentInstance();
  const queryState = ref('');
  const query = queryState;
  const whereState = ref('');
  const where = whereState;
  const orderbyState = ref(dbOrderBy);
  const orderby = orderbyState;
  const optionsState = ref({
    pageSize,
    pageCurrent,
  });
  const options = optionsState;
  const selectedIndexsState = ref([]);
  const selectedIndexs = selectedIndexsState;
  const loadingState = ref(true);
  const loading = loadingState;
  const menusState = ref([]);
  const menus = menusState;
  const errMsgState = ref('');
  const errMsg = errMsgState;
  const currentTabState = ref('menus');
  const currentTab = currentTabState;
  const selectedPluginMenuIndexsState = ref([]);
  const selectedPluginMenuIndexs = selectedPluginMenuIndexsState;
  const udbRef = ref(null);
  const pluginMenusTableRef = ref(null);
  const pluginMenusComputed = computed(() => {
    const menus = [];
    if (!proxy.$hasRole('admin')) {
      return menus;
    }
    const dbMenus = menusState.value;
    if (!dbMenus.length) {
      return menus;
    }
    pluginMenuJsons.forEach((menu) => {
      // 查找尚未被注册到数据库中的菜单
      if (!dbMenus.find((item) => item.menu_id === menu.menu_id)) {
        menus.push(menu);
      }
    });
    return menus;
  });
  const pluginMenus = pluginMenusComputed;
  const enableChangeAction = (item) => {
    item.enable = item.enable ? false : true;
    db.collection('opendb-admin-menus').doc(item._id).update({
      enable: item.enable,
    });
  };
  const enableChange = enableChangeAction;
  const getSortMenuAction = (menuList) => {
    // 标记叶子节点
    menuList.map((item) => {
      if (!menuList.some((subMenuItem) => subMenuItem.parent_id === item.menu_id)) {
        item.isLeafNode = true;
      }
    });
    return buildMenus(menuList);
  };
  const getSortMenu = getSortMenuAction;
  const onqueryloadAction = (data) => {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      const depth = getParents(data, item.menu_id);
      item.name = (depth ? '　'.repeat(depth) + '|-' : '') + item.name;
    }
    const menuTree = getSortMenuAction(data);
    const sortMenus = [];
    patTreeAction(menuTree, sortMenus);
    data.length = 0;
    data.push(...sortMenus);
    menusState.value = data; //仅导出当前页
  };
  const onqueryload = onqueryloadAction;
  const patTreeAction = (tree, sortMenus) => {
    tree.forEach((item) => {
      sortMenus.push(item);
      if (item.children.length) {
        patTreeAction(item.children, sortMenus);
      }
    });
    return sortMenus;
  };
  const patTree = patTreeAction;
  const switchTabAction = (tab) => {
    currentTabState.value = tab;
  };
  const switchTab = switchTabAction;
  const loadDataAction = (clear = true) => {
    udbRef.value.loadData({
      clear,
    });
  };
  const loadData = loadDataAction;
  const navigateToAction = (url, clear) => {
    // clear 表示刷新列表时是否清除当前页码，true 表示刷新并回到列表第 1 页，默认为 true
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
  const confirmDeleteAction = (menu) => {
    let ids = menu._id;
    let content = '是否删除该菜单？';
    // 如有子菜单
    // 如有子菜单
    const children = getChildren(menusState.value, menu.menu_id);
    if (children.length) content = '是否删除该菜单及其子菜单？';
    ids = [ids, ...children];
    uni.showModal({
      title: '提示',
      content,
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        udbRef.value.remove(ids, {
          needConfirm: false,
        });
      },
    });
  };
  const confirmDelete = confirmDeleteAction;
  const pluginMenuSelectChangeAction = (e) => {
    selectedPluginMenuIndexsState.value = e.detail.index;
  };
  const pluginMenuSelectChange = pluginMenuSelectChangeAction;
  const addPluginMenusAction = (confirmContent) => {
    if (!selectedPluginMenuIndexsState.value.length) {
      return uni.showModal({
        title: '提示',
        content: '请选择要添加的菜单！',
        showCancel: false,
      });
    }
    const pluginMenus = pluginMenusComputed.value;
    const menus = [];
    selectedPluginMenuIndexsState.value.forEach((i) => {
      const menu = pluginMenus[i];
      if (menu) {
        // 拷贝一份，移除 json 字段
        const dbMenu = JSON.parse(JSON.stringify(menu));
        dbMenu.enable = true;
        delete dbMenu.json;
        menus.push(dbMenu);
      }
    });
    uni.showModal({
      title: '提示',
      content: '您确认要添加已选中的菜单吗？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        uni.showLoading({
          mask: true,
        });
        const checkAll = menus.length === pluginMenus.length;
        uniCloud
          .database()
          .collection('opendb-admin-menus')
          .add(menus)
          .then((res) => {
            // this.init()
            uni.showModal({
              title: '提示',
              content: '添加菜单成功！',
              showCancel: false,
              success: () => {
                pluginMenusTableRef.value.clearSelection();
                if (checkAll) {
                  currentTabState.value = 'menus';
                }
                loadDataAction();
              },
            });
          })
          .catch((err) => {
            uni.showModal({
              title: '提示',
              content: err.message,
              showCancel: false,
            });
          })
          .finally(() => {
            uni.hideLoading();
          });
      },
    });
  };
  const addPluginMenus = addPluginMenusAction;
  const updateBuiltInMenuAction = async () => {
    uni.showModal({
      title: '提示',
      content: '确定更新内置菜单吗？\n（该操作不会影响现有的菜单）',
      success: async (res) => {
        if (res.confirm) {
          const db = uniCloud.database();
          const _ = db.command;
          let menu_ids = originalMenuList.map((item, index) => {
            return item.menu_id;
          });
          uni.showLoading({
            title: '更新中...',
            mask: true,
          });
          try {
            let addMenuList = [];
            // 读取菜单
            let oldMenuListRes = await db
              .collection('opendb-admin-menus')
              .where({
                menu_id: _.in[menu_ids],
              })
              .limit(500)
              .get();
            let oldMenuList = oldMenuListRes.result.data;
            originalMenuList.map((item, index) => {
              let oldMenuItem = oldMenuList.find((item2, index2, arr2) => {
                return item2.menu_id === item.menu_id;
              });
              if (!oldMenuItem) {
                addMenuList.push({
                  ...item,
                  create_date: undefined,
                });
              }
            });
            if (addMenuList && addMenuList.length > 0) {
              // 添加没有的菜单
              let addRes = await db.collection('opendb-admin-menus').add(addMenuList);
              uni.showToast({
                title: `新增了${addRes.result.inserted}个菜单，即将刷新`,
                icon: 'none',
              });
              setTimeout(() => {
                // #ifdef H5
                window.location.reload();
                // #endif
                // #ifndef H5
                loadDataAction(true);
                // #endif
              }, 300);
            } else {
              uni.showToast({
                title: '菜单无变动',
                icon: 'none',
              });
            }
          } catch (err) {
            console.error(err);
          } finally {
            uni.hideLoading();
          }
        }
      },
    });
  };
  const updateBuiltInMenu = updateBuiltInMenuAction;
  watch(
    () => pluginMenusComputed.value,
    (val) => {
      if (!val.length) {
        currentTabState.value = 'menus';
      }
    }
  );
</script>
<style>
  /* #ifndef H5 */
  page {
    padding-top: 85px;
  }

  /* #endif */
  .menu-disable {
    color: red;
  }

  .menu-badge {
    position: absolute;
    top: 0;
    right: 5px;
  }
</style>
