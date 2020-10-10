<template>
    <view style="padding-top: 50px;">
        <button @click="throwJsError" type="primary" style="width: 350px;">点击模拟一个 js 错误</button>
        <button @click="throwHttpError" type="primary" style="width: 350px;margin-top: 15px;">点击模拟一个接口请求错误</button>
    </view>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        methods: {
            throwJsError() {
                a
            },
            throwHttpError() {
                this.$http('error/throw')
            }
        }
    }
</script>

<style>

</style>
