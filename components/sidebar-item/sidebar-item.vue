<template>
    <view class="pointer">
        <view v-if="!item.children">
            <uni-menu-item @click="clickMenuItem(item.url)">
                <uni-icons :type="item.icon" size="18" color="#888" />
                <text :class="{title: item.icon, actived: isActived}">{{item.name}}</text>
            </uni-menu-item>
        </view>
        <uni-sub-menu v-else>
            <template v-slot:title>
                <uni-icons :type="item.icon" size="18" color="#888" />
                <text :class="{title: item.icon}">{{item.name}}</text>
            </template>
            <sidebar-item class="item-bg" v-for="child in item.children" :item="child" :key="child._id" />
        </uni-sub-menu>
    </view>
</template>

<script>
    import sidebarItem from '@/components/sidebar-item/sidebar-item.vue'
    export default {
        name: 'sidebarItem',
        components: {
            sidebarItem
        },
        data() {
            return {
                isActived: false
            };
        },
        props: {
            item: ''
        },
        methods:{
            clickMenuItem(url) {
                // this.isActived = true
                uni.navigateTo({
                    url: url,
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
    .el-icon-platform-eleme {
        width: 20px;
        height: 20px;
    }
</style>
