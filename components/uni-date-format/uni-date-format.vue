<template>
    <text>{{dateShow}}</text>
</template>

<script>
    import {
        friendlyDate
    } from '../common/date-format.js'
    export default {
        props: {
            date: {
                type: [Object, Number],
                default () {
                    return Date.now()
                }
            },
            text: {
                type: Object,
                default () {
                    return {
                        year: '年',
                        month: '月',
                        day: '天',
                        hour: '小时',
                        minute: '分钟',
                        second: '秒',
                        before: '前',
                        after: '后',
                        justNow: '刚刚',
                        soon: '马上',
                        template: '{num}{unit}{suffix}'
                    }
                }
            },
            threshold: {
                type: Array,
                default () {
                    return [60000, 3600000]
                }
            },
            format: {
                type: String,
                default: 'yyyy/MM/dd hh:mm:ss'
            },
            refreshRate: {
                type: [Number, String],
                default: 0
            }
        },
        data() {
            return {
                refreshMark: 0
            }
        },
        computed: {
            dateShow() {
                this.refreshMark
                return friendlyDate(this.date, {
                    text: this.text,
                    threshold: this.threshold,
                    format: this.format
                })
            }
        },
        watch: {
            refreshRate: {
                handler() {
                    this.setAutoRefresh()
                },
                immediate: true
            }
        },
        methods: {
            refresh() {
                this.refreshMark++
            },
            setAutoRefresh() {
                clearInterval(this.refreshInterval)
                if (this.refreshRate) {
                    this.refreshInterval = setInterval(() => {
                        this.refresh()
                    }, parseInt(this.refreshRate))
                }
            }
        }
    }
</script>

<style>

</style>
