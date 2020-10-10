<template>
    <view class="uni-table">
        <uni-table border stripe>
            <uni-table-tr>
                <uni-table-th align="center">错误信息</uni-table-th>
                <uni-table-th width="100" align="center">路由</uni-table-th>
                <uni-table-th width="100" align="center">时间</uni-table-th>
                <uni-table-th width="100" align="center">搜索</uni-table-th>
            </uni-table-tr>
            <uni-table-tr v-for="(log,index) in logs" :key="index">
                <uni-table-td>
                    <text class="err-msg">Error in {{log.info}}: `{{log.err}}`</text>
                </uni-table-td>
                <uni-table-td>
                    <navigator class="err-route" :url="log.route">{{log.route}}</navigator>
                </uni-table-td>
                <uni-table-td>
                    <text>{{log.time}}</text>
                </uni-table-td>
                <uni-table-td>
                    <!-- #ifdef H5 -->
                    <a v-for="engine in engines" :href="engine.url.replace('ERR_MSG',encodeURIComponent(log.err))"
                        target="_blank" class="err-search">{{engine.name}}</a>
                    <!-- #endif -->
                </uni-table-td>
            </uni-table-tr>
        </uni-table>
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
    .uni-table {}

    .err-msg {
        color: #FF0000;
    }

    .err-search {
        margin-right: 10px;
    }
</style>
