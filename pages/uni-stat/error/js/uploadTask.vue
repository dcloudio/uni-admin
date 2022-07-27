<template>
	<view>
		<template v-for="fileTask in uploadTasks">
			<view class="upload-task-body">
				<view class="upload-task-item">
					<text class="upload-task-item-name">{{fileTask.name}}</text>
					<progress v-if="showProgress" class="upload-task-item-progress"
						:activeColor="fileTask.state !== -1 ? '#42b983' : '#ff5a5f'" :percent="fileTask.progress * 100"
						active :duration="5" />
					<view class="flex" style="justify-content: space-between;">
						<text class="upload-task-item-size">{{fileTask.size}}</text>
						<text class="upload-task-item-size">{{fileTask.state !== -1 ? '' : '失败'}}</text>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		props: {
			uploadTasks: {
				type: Array,
				default: []
			},
			showProgress: {
				type: Boolean,
				default: true
			}
		}
	}
</script>

<style>
	.upload-task-body {
		background-color: #fff;
		padding: 0 25rpx;
		transition: background-color .4s;
	}

	.upload-task-body:hover {
		background-color: #f5f5f5;
	}

	.upload-task-item {
		padding: 20rpx 0;
	}

	.upload-task-item-progress {
		padding: 20rpx 0;
	}

	.upload-task-item-size {
		font-size: 12px;
		color: #999;
	}

	.upload-task-item-name {
		font-size: 14px;
	}
</style>
