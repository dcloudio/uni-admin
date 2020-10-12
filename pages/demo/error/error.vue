<template>
    <view style="padding-top: 50px;">
        <button @click="throwJsError" type="primary" style="width: 280px;">点击模拟一个 js 错误</button>
        <button @click="throwHttpError" :disabled="loading" :loading="loading" type="primary" style="width: 280px;margin-top: 15px;">点击模拟一个接口请求错误</button>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                loading: false
            }
        },
        methods: {
            throwJsError() {
                a
            },
            throwHttpError() {
                this.loading = true
                this.$request('error/throw', {}, {
                    showModal: false
                }).finally(() => {
                    this.loading = false
                })
            }
        }
    }
</script>

<style>

</style>
