<template>
    <view>
        <view>
            <!-- 显示404错误页面标题 -->
            <text style="font-size: 25px;color: #333;">
                404 页面未找到
            </text>
        </view>
        <view>
            <!-- 显示错误消息 -->
            <text style="font-size: 18px;color: #999;">
                {{errMsg}}
            </text>
        </view>
		<!-- 在非H5环境下显示fix-window组件 -->
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
    </view>
</template>


<script>
    export default {
        data() {
            return {

            }
        },
        onLoad(query) {
            this.errMsg = query.errMsg || ''
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
