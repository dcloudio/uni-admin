<template>
    <scroll-view style="padding: 15px;box-sizing: border-box;">
        内容主体，可自定义内容及样式<text style="color: #666; font-size: 15px;">（ uniCloud admin {{adminVersion}}, 可在控制台打印信息和 package.json 中查看当前版本号）</text>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
    </scroll-view>
</template>

<script>
	import { version } from '../../package.json'
    export default {
        data() {
            return {
				adminVersion: version
			}
        },
        onLoad() {},
        methods: {}
    }
</script>

<style>
	/* #ifndef H5 */
	page {
		padding-top: 85px;
	}
	/* #endif */
</style>
