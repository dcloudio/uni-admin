<template>
	<scroll-view style="padding: 15px;box-sizing: border-box;">
		<button type="default" @click="locale('en')">英语</button>
		<button type="default" @click="locale('zh-Hans')">中文简体</button>
		<button type="default" @click="locale('zh-Hant')">中繁体</button>
		{{ $t("index.text.prompt") }}
		<text style="color: #666; font-size: 15px;">（ v{{adminVersion}}, {{ $t("index.text.vesion") }}）</text>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</scroll-view>
</template>

<script>
	import {
		version
	} from '../../package.json'

	export default {
		data() {
			return {
				adminVersion: version,
				// locale: 'en'
			}
		},
		watch: {

		},
		onLoad() {},
		methods: {
			locale(val) {
				this.$i18n.locale = val
			}
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
