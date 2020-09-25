<template>
    <view class="navbar">
        <!--TODO-->
		<view class="flex-s p-t-20">
			<image src="../static/logo.png" mode=""></image>
			<view class="flex-s">
				<image src="../static/user.png" mode=""></image>
				<a herf="" text="" class="logout">退出</a>️
			</view>
		</view>
    </view>
</template>

<script>
</script>

<style>
    .navbar {
		/* position: fixed;
		top: 0; */
        height: 60px;
		width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid #eaecef;
        background-color: #ecf8f3;
    }
	.flex-s {
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.p-t-20 {
		padding: 0 20px;
	}
	.flex-s image {
		height: 35px;
		width: 35px;
	}
	.logout {
		margin-left: 10px;
		color: #999;
		font-size: 14px;
	}
	.logout:hover {
		color: #42B983;
	}
</style>
