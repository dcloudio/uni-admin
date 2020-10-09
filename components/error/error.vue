<template>
    <view class="err-table">
        <view class="err-row err-header">
            <view class="err-column">
                <text>错误信息</text>
            </view>
            <view class="err-column">
                <text>路由</text>
            </view>
            <view class="err-column">
                <text>时间</text>
            </view>
            <view class="err-column">
                <text>搜索</text>
            </view>
        </view>
        <view v-for="(log,index) in logs" :key="index" class="err-row">
            <view class="err-column">
                <text class="err-msg">Error in {{log.info}}: `{{log.err}}`</text>
            </view>
            <view class="err-column">
                <navigator class="err-route" :url="log.route">{{log.route}}</navigator>
            </view>
            <view class="err-column">
                <text>{{log.time}}</text>
            </view>
            <view class="err-column">
                <!-- #ifdef H5 -->
                <a v-for="engine in engines" :href="engine.url.replace('ERR_MSG',encodeURIComponent(log.err))" target="_blank"
                    class="err-search">{{engine.name}}</a>
                <!-- #endif -->
            </view>
        </view>
    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import config from '@/admin.config.js'
    const debugOptions = config.navBar.debug || {}
    export default {
        data() {
            return {
                engines: debugOptions.engine || []
            };
        },
        computed: {
            ...mapState('error', ['logs'])
        },
        methods: {
            search(engine, log) {

            }
        }
    }
</script>

<style>
    .err-table {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .err-row {
        display: flex;
    }

    .err-column {
        flex: 1;
    }

    .err-msg {
        color: #FF0000;
    }

    .err-search {
        margin-right: 10px;
    }
</style>
