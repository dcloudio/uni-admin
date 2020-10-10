<template>
    <view style="padding: 15px;">
        内容主体，可自定义内容及样式
    </view>
</template>

<script>
    import {
        mapActions
    } from 'vuex'

    export default {
        data() {
            return {
                observer: null
            }
        },
        onLoad() {

        },
        mounted() {
            this.observeDevice()
        },
        methods: {
            ...mapActions({
                queryMedia: 'app/queryMedia'
            }),
            observeDevice() {
                this.observer = uni.createMediaQueryObserver(this)
                console.log('========this.observer==========', this.observer)
                this.observer.observe({
                    maxWidth: 500
                }, matches => {
                    this.queryMedia(matches)
                })
            }
        }
    }
</script>

<style>
</style>
