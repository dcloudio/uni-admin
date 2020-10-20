<template>
    <view style="padding: 20px">
        <update-password :hasBackButton="true" />
    </view>
</template>

<script>
    import updatePassword from '@/windows/components/update-password.vue'
    export default {
        components: {
            updatePassword
        },
        data() {
            return {

            }
        },
        onShow() {
            uni.setNavigationBarTitle({
                title: '修改密码'
            })
        },
        methods: {

        }
    }
</script>

<style>

</style>
