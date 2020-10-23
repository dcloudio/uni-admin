<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">图标（uni-icons）</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="icons">
				<view v-for="icon in icons" :key="icon" class="icon-item pointer">
					<view @click="setClipboardData('tag',icon)" :class="'uni-icon-'+icon"></view>
					<text @click="setClipboardData('class',icon)" class="icon-text">uni-icon-{{icon}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import icons from './uni-icons.js'
	export default {
		data() {
			return {
				icons
			}
		},
		methods: {
			setClipboardData(type, icon) {
				let data = 'uni-icon-' + icon
				if (type === 'tag') {
					data = '<view class="' + data + '"></view>'
				}
				uni.setClipboardData({
					data,
					success(res) {
						uni.showToast({
							icon: 'none',
							title: '复制 ' + data + ' 成功！'
						})
					},
					fail(res) {
						uni.showModal({
							content: '复制 ' + data + ' 失败！',
							showCancel: false
						})
					}
				})
			}
		}
	}
</script>

<style>
	.icons {
		display: flex;
		flex-wrap: wrap;
	}

	.icon-item {
		display: flex;
		width: 16.6%;
		height: 120px;
		font-size: 30px;
		text-align: center;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.icon-item:hover,
	.icon-item:hover .icon-text {
		color: #007AFF;
	}

	.icon-text {
		color: #99a9bf;
		font-size: 12px;
		text-align: center;
		height: 1em;
		line-height: 1em;
		margin-top: 15px;
	}
</style>
