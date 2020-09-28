<template>
    <scroll-view class="sidebar" scroll-y="true">
        <!-- TODO -->
        <!-- <menus :data="data"/> -->
        <uni-nav-menu>
            <sidebar-item v-for="menu in navMenu" :key="menu._id" :item="menu" />
        </uni-nav-menu>
    </scroll-view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import sidebarItem from '@/components/sidebar-item/sidebar-item.vue'
    export default {
        components: {
            sidebarItem
        },
        data() {
            return {
            }
        },
        computed: {
            ...mapState('app',['navMenu'])
        },
        mounted() {
            console.log('======== navMenu =====',this.$store.state.app.navMenu)
        }

    }
</script>

<style>
    .sidebar {
        position: fixed;
        top: var(--window-top);
        left: 0;
        width: 240px;
        height: calc(100vh - (var(--window-top)));
        box-sizing: border-box;
        border-right: 1px solid #eaecef;
        background-color: #fff;
        padding-bottom: 10px;
    }

    .title {
        margin-left: 5px;
    }
</style>
