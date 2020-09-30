<template>
    <scroll-view class="sidebar" scroll-y="true">
        <template v-if="navMenu.length">
            <uni-nav-menu>
                <sidebar-item v-for="menu in navMenu" :key="menu._id" :item="menu" />
            </uni-nav-menu>
            <uni-nav-menu>
                <sidebar-item v-for="menu in secondaryMenus" :key="menu._id" :item="menu" />
            </uni-nav-menu>
        </template>
    </scroll-view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import sidebarItem from '@/components/sidebar-item/sidebar-item.vue'
    import config from '@/admin.config.js'
    export default {
        components: {
            sidebarItem
        },
        data() {
            return {
                ...config.sideBar
            }
        },
        computed: {
            ...mapState('app', ['navMenu'])
        }
    }
</script>

<style lang="scss">
    .sidebar {
        position: fixed;
        top: var(--window-top);
        left: 0;
        width: 240px;
        height: calc(100vh - (var(--window-top)));
        box-sizing: border-box;
        border-right: 1px solid #eaecef;
        background-color: $left-window-bg-color;
        padding-bottom: 10px;
    }

    .title {
        margin-left: 5px;
    }
</style>
