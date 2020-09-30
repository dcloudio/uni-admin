<template>
    <view class="pointer">
        <view v-if="!item.children">
            <uni-menu-item class="only-one-menu" :class="{active: actived}" @click="clickMenuItem(item.url)">
                <uni-icons :type="item.icon" size="18" color="#888" />
                <text class="title">{{item.name}}</text>
            </uni-menu-item>
        </view>
        <uni-sub-menu v-else>
            <template v-slot:title>
                <uni-icons :type="item.icon" size="18" color="#888" />
                <text class="title">{{item.name}}</text>
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
                actived: false
            };
        },
        props: {
            item: ''
        },
        methods:{
            clickMenuItem(url) {
                this.actived = true
                url = '../../pages/test/' + url
                uni.navigateTo({
                    url: url,
                    success(res) {
                        console.log('===== success =====',res)
                    },
                    fail(res) {
                        console.log('===== fail =====',res)
                    },
                })
            }
        }
    }
</script>

<style>
    .title {
        margin-left: 5px;
    }
    .item-bg {
        background-color: #F1F1F1;
    }
    .active {
        color: #42B983;
    }
    .only-one-menu {
        border-bottom: 1px #f5f5f5 solid;
    }
</style>
