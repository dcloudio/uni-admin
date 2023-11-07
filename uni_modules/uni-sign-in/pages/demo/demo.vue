<template>
<view>
	<uni-sign-in ref="signIn"></uni-sign-in>
	<button type="default" @click="signIn">签到</button>
</view>
</template>
<script>
	export default {
		methods: {
			signIn() { //签到
				this.$refs.signIn.open()
			}
		}
	}
</script>