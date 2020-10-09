<template>
    <view class="pointer">
        <template v-if="!item.children || !item.children.length">
            <uni-menu-item @click="clickMenuItem(item)" :class="{actived: active === item.url}">
                <view :class="item.icon"></view>
                <text :class="{title: item.icon}">{{item.name}}</text>
            </uni-menu-item>
        </template>
        <uni-sub-menu v-else>
            <template v-slot:title>
                <view :class="item.icon"></view>
                <text :class="{title: item.icon}">{{item.name}}</text>
            </template>
            <sidebar-item class="item-bg" v-for="child in item.children" :item="child" :key="child._id" />
        </uni-sub-menu>
    </view>
</template>

<script>
    import sidebarItem from '@/components/sidebar-item/sidebar-item.vue'
    import {
        mapState,
    } from 'vuex'
    export default {
        name: 'sidebarItem',
        components: {
            sidebarItem
        },
        data() {
            return {
                route: ''
            };
        },
        props: {
            item: ''
        },

        computed: {
            ...mapState('app', ['active'])
        },

        methods:{
            clickMenuItem(menu) {
                uni.navigateTo({
                    url: menu.url,
                })
            }
        }
    }
</script>

<style lang="scss">
    .title {
        margin-left: 5px;
    }
    .item-bg {
        background-color: $sub-menu-bg-color;
    }
    // .only-one-menu {
    //     border-bottom: 1px #f5f5f5 solid;
    // }
    .actived {
        color: $menu-text-color-actived;
    }
</style>
