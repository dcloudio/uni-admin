<template>
    <view style="padding-top: 50px;">
        <button @click="throwError" type="primary" style="width: 350px;">点击模拟一个 ReferenceError 错误</button>
    </view>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        methods: {
            throwError() {
                a
            }
        }
    }
</script>

<style>

</style>
