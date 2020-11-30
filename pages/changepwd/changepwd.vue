<template>
    <view style="padding: 20px">
        <update-password :hasBackButton="true" />
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
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
	/* #ifndef H5 */
	page {
		padding-top: 85px;
	}
	/* #endif */
</style>
