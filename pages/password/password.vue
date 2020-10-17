<template>
	<view style="padding: 20px">
		<password :hasBackButton="true"/>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
        onShow() {
            uni.setNavigationBarTitle({
                title:'修改密码'
            })
        },
		methods: {

		}
	}
</script>

<style>

</style>
