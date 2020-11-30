<template>
    <view>
        <view>
            <text style="font-size: 25px;color: #333;">
                404 Page Not Found
            </text>
        </view>
        <view>
            <text style="font-size: 18px;color: #999;">
                {{errMsg}}
            </text>
        </view>
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
