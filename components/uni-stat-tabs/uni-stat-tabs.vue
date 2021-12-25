<template>
	<view class="uni-stat--tab">
		<view v-if="!renderTabs.length" class="uni-stat--tab-item" :class="[`uni-stat--tab-item-${type}`]">
			暂无选项
		</view>
		<view v-else v-for="(item, index) in renderTabs" :key="index" @click="change(item._id, index)"
			class="uni-stat--tab-item"
			:class="[index === tabIndex ? `uni-stat--tab-item-${type}-active` : '' , `uni-stat--tab-item-${type}`]">
			{{item.name}}
		</view>

	</view>
</template>

<script>
	export default {
		name: "uni-stat-tabs",
		data() {
			return {
				tabIndex: 0,
				renderTabs: []
			};
		},
		props: {
			type: {
				type: String,
				default: 'line'
			},
			mode: {
				type: String,
				default: ''
			},
			tabs: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		mounted() {
			if (this.mode === 'platform') {
				this.getPlatform()
			} else {
				this.renderTabs = this.tabs
			}
		},
		methods: {
			change(e, index) {
				console.log(',,,,,,,,,', e);
				this.tabIndex = index
				this.$emit('change', e)
				this.$emit('change', e)
				this.$emit('input', e)
			},
			getPlatform() {
				const db = uniCloud.database()
				const appList = db.collection('uni-stat-app-platforms')
					.field('name, code')
					.get()
					.then(res => {
						const platforms = res.result.data
						platforms.unshift({
							name: '全部',
							code: 'all'
						})
						this.renderTabs = platforms
					})
			},
		}
	}
</script>

<style lang="scss">
	.uni-stat {

		&--tab {
			display: flex;
			flex-wrap: wrap;

			&-item {
				font-size: 14px;
				color: #666;
				text-align: center;
				cursor: pointer;
				box-sizing: border-box;

				&-line {
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 1px solid transparent;

					&-active {
						color: $uni-color-primary;
						border-bottom: 1px solid $uni-color-primary;
					}
				}

				&-boldLine {
					box-sizing: border-box;
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 2px solid transparent;

					&-active {
						box-sizing: border-box;
						color: $uni-color-primary;
						border-bottom: 2px solid $uni-color-primary;
					}
				}

				&-box {
					padding: 5px 15px;
					border: 1px solid #eee;
					margin: 0;

					&:not(:last-child) {
						border-right-color: transparent;
					}


					&-active {
						box-sizing: border-box;
						border: 1px solid $uni-color-primary !important;
					}
				}
			}

		}
	}
</style>
