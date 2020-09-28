<template>
    <scroll-view class="sidebar" scroll-y="true">
        <!-- TODO -->
        <!-- <menus :data="data"/> -->
        <uni-nav-menu>
            <sidebar-item v-for="menu in menuData" :key="menu.title" :item="menu" />
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
                menuData: [{
                        title: '首页',
                        url: '/index',
                        icon: 'home',
                    }, {
                        title: '设置',
                        url: '/config',
                        icon: 'gear',
                    },
                    {
                        title: '个人信息',
                        url: '/user',
                        icon: 'gear',
                        children: [{
                                title: '邮箱设置',
                                url: '/email',
                                icon: 'gear',
                            },
                            {
                                title: '个人信息',
                                url: '/user',
                                icon: 'gear',
                                children: [{
                                    title: '邮箱设置',
                                    url: '/email',
                                    icon: 'gear',
                                }]
                            }
                        ]
                    },
                ]
            }
        },
        computed: {
            ...mapState({
                navMenu: 'app/navMenu'
            })
        },

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
