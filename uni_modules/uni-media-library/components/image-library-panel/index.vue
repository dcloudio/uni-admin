<template>
	<view class="wrap">
		<view class="media-filter-warp">
			<view class="filter-options">
				<media-button
					type="primary"
					size="small"
					icon="download"
					@click="$emit('onCopyToMediaLibrary', selectedImages)"
					:disabled="selectedCount <= 0"
				>添加到上传列表</media-button>
				<div class="split"></div>
				<uni-easyinput
					v-model="keyword"
					class="search-input"
					suffixIcon="search"
					placeholder="搜索图片素材"
					@iconClick="search"
					@blur="search"
				></uni-easyinput>
			</view>
		</view>
		<scroll-view
			class="media-view"
			scroll-y
			enable-flex
			@scrolltolower="loadMore"
		>
			<view v-if="loading && page === 1" class="loading">
				<uni-icons class="icon" type="spinner-cycle" size="30" color="#000"></uni-icons>
			</view>
			<view class="items" v-else-if="list.length">
				<view
					class="media-item"
					:class="{selected: item.selected}"
					v-for="(item, index) in list"
					@click="onSelect(index)"
					:key="item.id"
				>
					<view class="image">
						<image
							:src="item.thumbUrl"
							mode="aspectFill" class="img"></image>
					</view>
				</view>
			</view>
			<view class="media-library-isnull" v-else>
				<uni-icons type="images" size="60" color="#ccc"></uni-icons>
				<view class="text">输入关键词，查找可用的免费素材</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import MediaButton from "../media-button/index.vue";

const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
	customUI: true
})

export default {
	name: "image-library-panel",
	components: {
		MediaButton
	},
	emits: ['onCopyToMediaLibrary'],
	expose: [],
	props: {
		provider: String
	},
	data() {
		return {
			keyword: '',
			loading: false,
			page: 1,
			pageSize: 30,
			list: [],
			fillingViewport: false,
			noMore: false,
		}
	},
	watch: {
		page () {
			this.loadList()
		}
	},
	computed: {
		selectedCount () {
			return this.selectedImages.length
		},
		selectedImages () {
			return this.list.filter(item => item.selected)
		}
	},
	methods: {
		search () {
			if (this.loading) return

			this.noMore = false
			this.fillingViewport = false
			if (this.page === 1) {
				this.loadList()
			} else {
				this.page = 1
			}
		},
		async loadList () {
			if (!this.keyword || this.loading) return

			this.loading = true

			let res
			try {
				res = await uniMediaLibraryCo.searchImageLibrary({
					keyword: this.keyword,
					page: this.page,
					pageSize: this.pageSize,
					provider: this.provider
				})
			} catch (e) {
				return uni.showToast({
					title: e.errMsg || e.message,
					icon: 'none'
				})
			} finally {
				this.loading = false
			}

			const list = res.data || []
			if (this.page === 1) {
				this.list = list
			} else {
				this.list = [...this.list, ...list]
			}

			this.noMore = list.length < this.pageSize
			setTimeout(() => this.ensureViewportFilled(), 0)
		},
		loadMore () {
			if (!this.loading && !this.noMore) {
				this.page += 1
			}
		},
		ensureViewportFilled() {
			if (this.fillingViewport || this.noMore || this.loading || !this.list.length) return

			this.fillingViewport = true
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this)
				query.select('.media-view').boundingClientRect()
				query.select('.items').boundingClientRect()
				query.exec((rects) => {
					this.fillingViewport = false
					const [viewRect, itemsRect] = rects || []

					if (!viewRect || !itemsRect) return
					if (itemsRect.height <= viewRect.height + 1) {
						this.loadMore()
					}
				})
			})
		},
		onSelect(index) {
			if (this.loading) return

			const mediaItem = this.list[index]
			this.$set(mediaItem, 'selected', !mediaItem.selected)
		}
	}
}
</script>

<style lang="scss">
.wrap {
	flex: 1;
	display: flex;
	flex-direction: column;
	user-select: none;
	height: 100%;
	box-sizing: border-box;
}
.media-view {
	flex: 1;
	box-sizing: border-box;
	display: flex;
	min-height: 0;

	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: 14px;
		align-items: start;
		padding: 10px;
	}
}

.loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;

	.icon {
		animation: rotate 1s linear infinite;
	}
}

.media-item {
	width: 100%;
	aspect-ratio: 1;
	background: #fff;
	border-radius: 10px;
	box-sizing: border-box;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	transition: box-shadow .2s, transform .2s;

	&::after {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		border-radius: 9px;
		box-shadow: inset 0 0 0 0 rgba(22, 119, 255, 0);
		transition: box-shadow .2s;
	}

	&:hover {
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	&.selected {
		box-shadow: 0 0 0 2px rgba(22, 119, 255, .16), 0 8px 20px rgba(0, 0, 0, 0.08);

		&::after {
			box-shadow: inset 0 0 0 5px #1677ff;
		}
	}

	.image {
		width: 100%;
		height: 100%;
		position: relative;
		background: #f5f5f5;

		.img, .v {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: block;
		}
	}

	.mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		background: rgba(0, 0, 0, .5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.tip {
			font-size: 12px;
			color: #fff;
			margin-top: 5px;
		}
	}

	.progress {
		width: 80%;
		height: 4px;
		border-radius: 2px;
		background: #fff;
		position: relative;
		overflow: hidden;

		.inner {
			width: 0;
			height: 100%;
			border-radius: 2px;
			transition: width .3s;
			background: #2979ff;
		}
	}
}

.media-library-isnull {
	padding-top: 50px;
	text-align: center;

	.text {
		font-size: 18px;
		color: #ccc;
		margin-top: 5px;
		margin-bottom: 30px;
	}
}

.media-filter-warp {
	display: flex;
	align-items: center;
	padding: 10px;

	.split {
		width: 1px;
		height: 14px;
		background: #f1f1f1;
		margin: 0 5px;
	}

	.filter-options {
		display: flex;
		align-items: center;
		gap: 5px;

		.search-input, .group-select {
			min-width: 200px;
		}
	}

	.select-options {
		display: flex;
		align-items: center;
		gap: 5px;
	}
}

@media screen and (max-width: 768px) {
	.media-filter-warp {
		flex-direction: column;
		align-items: flex-start;

		.select-options {
			margin-top: 15px;
		}
	}
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg)
	}
}

@media screen and (max-width: 768px) {
	.media-view {
		.items {
			grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
			gap: 10px;
		}
	}
}
</style>
