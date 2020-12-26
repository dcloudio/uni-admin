<template>
    <scroll-view style="padding: 15px;box-sizing: border-box;">
        内容主体，可自定义内容及样式<text style="color: #666; font-size: 15px;">（ uniCloud admin 当前版本号 {{adminVersion}}, 运行到浏览器可在控制台打印信息中查看当前的版本，也可在代码 package.json 中查看）</text>
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
