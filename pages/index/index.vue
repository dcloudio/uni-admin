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
        /* height: calc(100vh - (var(--window-top))); */
        display: flex;
        flex-direction: column;
     /*   align-items: center;
        justify-content: center; */
        padding-top: var(--window-top);
    }

    
</style>
