<template>
    <view class="pointer">
        <template v-if="!item.children || !item.children.length">
            <uni-menu-item @click="clickMenuItem(item)" :class="{actived: active === item.url}">
                <view :class="item.icon"></view>
                <text :class="{title: item.icon}">{{item.name}}</text>
            </uni-menu-item>
        </template>
        <uni-sub-menu :active="hasChildActive" v-else>
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
            ...mapState('app', ['active']),
            hasChildActive() {
                return this.activeUrl(this.active, this.item)
            }
        },
        methods: {
            clickMenuItem(menu) {
                // #ifdef H5
                if (menu.url.indexOf('http') === 0) {
                    return window.open(menu.url)
                }
                // #endif
                uni.navigateTo({
                    url: menu.url,
                })
            },
            activeUrl(active, item) {
                if (item.url === active) {
                    return true
                }
                const children = item.children
                if (children && children.length) {
                    const childItem = children.find(item => this.activeUrl(active, item))
                    if (childItem) {
                        return true
                    }
                }
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
