<template>
    <view class="content">
        内容主体，可自定义内容及样式
    </view>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        computed: {},
        onLoad() {
            
        },
        methods: {}
    }
</script>

<style>
    .content {
        height: calc(100vh - (var(--window-top)));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: var(--window-top);
        background-color: #f8f8f8;
    }

    .logo {
        height: 200rpx;
        width: 200rpx;
        margin-top: 200rpx;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 50rpx;
    }

    .text-area {
        display: flex;
        justify-content: center;
    }

    .title {
        /* font-size: 36rpx; */
        color: #8f8f94;
    }

    .item-bg {
        background-color: #ecf8f3;
    }
</style>
