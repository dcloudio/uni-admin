<template>
	<view class="uni-stat--tab-x">
		<view v-if="label" class="uni-label-text hide-on-phone">{{label + '：'}}</view>
		<view class="uni-stat--tab">
			<view v-if="!renderTabs.length" class="uni-stat--tab-item uni-stat--tab-item-disabled"
				:class="[`uni-stat--tab-item-${type}`]">
				{{placeholder}}
			</view>
			<view v-else v-for="(item, index) in renderTabs" :key="index" @click="change(item, index)"
				class="uni-stat--tab-item" :class="[
					index === currentTab ? `uni-stat--tab-item-${type}-active` : '' , `uni-stat--tab-item-${type}`,
					item.disabled ? 'uni-stat--tab-item-disabled' : ''
				]">
				{{item.name}}
				<uni-stat-tooltip v-if="tooltip" :text="item.tooltip" />
			</view>

		</view>
	</view>

</template>

<script>
	export default {
		name: "uni-stat-tabs",
		data() {
			return {
				currentTab: 0,
				renderTabs: []
			};
		},
		props: {
			type: {
				type: String,
				default: 'line'
			},
			value: {
				type: [String, Number],
				default: ''
			},
			modelValue: {
				type: [String, Number],
				default: ''
			},
			current: {
				type: [String, Number],
				default: 0
			},
			mode: {
				type: String,
				default: ''
			},
			today: {
				type: Boolean,
				default: false
			},
			yesterday: {
				type: Boolean,
				default: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			tooltip: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '暂无选项'
			},
			tabs: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		mounted() {
			this.init()
		},
		watch: {
			current(val) {
				this.currentTab = val
			},

			// value(val) {
			// 	this.currentTab = val
			// },

			tabs: {
				immediate: false,
				handler(val) {
					this.init()
				}
			}
		},
		methods: {
			init() {
				if (this.mode.indexOf('platform') > -1) {
					this.getPlatform()
				} else if (this.mode === 'date') {
					const dates = [{
						_id: 7,
						name: '最近七天',
					}, {
						_id: 30,
						name: '最近30天',
					}, {
						_id: 90,
						name: '最近90天',
					}]
					if (this.yesterday) {
						dates.unshift({
							_id: 1,
							name: '昨天',
						})
					}
					if (this.today) {
						dates.unshift({
							_id: 0,
							name: '今天',
						})
					}
					this.renderTabs = dates
				} else {
					this.renderTabs = this.tabs
				}

				const index = this.current
				// const index = 0
				this.currentTab = index
				if (this.mode === 'date' && index >= 0) {
					this.$nextTick(function() {
						const id = this.renderTabs[index]._id
						const name = this.renderTabs[index].name
						this.emit(id, index, name)
					})
				}
			},
			change(item, index) {
				if (item.disabled) return
				const id = item._id
				const name = item.name
				this.currentTab = index
				this.emit(id, index, name)
			},
			emit(id, index, name) {
				this.$emit('change', id, index, name)
				this.$emit('input', id, index, name)
				this.$emit('update:modelValue', id, index, name)
			},
			getPlatform() {
				const db = uniCloud.database()
				const appList = db.collection('uni-stat-app-platforms')
					.field('name, code')
					.get()
					.then(res => {
						let platforms = res.result.data
						if (this.mode === 'platform-channel') {
							platforms = platforms.filter(item => /^android|ios$/.test(item.code))
						}
						if (this.mode === 'platform-scene') {
							platforms = platforms.filter(item => !/^android|ios|h5|qn|qw$/.test(item.code))
						}
						platforms.unshift({
							name: '全部',
							code: 'all'
						})
						this.renderTabs = platforms
					})
			},

			// list(items, goal){
			// 	items.map( item => goal.code.indexOf("android") === -1)
			// }
		}
	}
</script>

<style lang="scss">
	.uni-label-text {
		font-size: 14px;
		font-weight: bold;
		color: #555;
		margin-top: 17px;
		margin-bottom: 17px;
		margin-right: 5px;
	}
	.uni-stat--tab-x {
		display: flex;
		margin: 0 15px;
		white-space: nowrap;
	}

	.uni-stat--tab {
		display: flex;
		flex-wrap: wrap;
	}

	.uni-stat {

		&--tab {

			&-item {
				white-space: nowrap;
				font-size: 14px;
				color: #666;
				text-align: center;
				cursor: pointer;
				box-sizing: border-box;
				margin: 15px 0;

				&-disabled {
					cursor: unset;
					opacity: 0.4;
				}

				&-line {
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 1px solid transparent;

					&:last-child {
						margin-right: 0;
					}

					&-active {
						color: $uni-color-primary;
						border-bottom: 1px solid $uni-color-primary;
						// &-disabled {
						// 	color: #666;
						// 	border-color: #666;
						// }
					}
				}

				&-boldLine {
					box-sizing: border-box;
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 2px solid transparent;

					&:last-child {
						margin-right: 0;
					}

					&-active {
						box-sizing: border-box;
						color: $uni-color-primary;
						border-bottom: 2px solid $uni-color-primary;
					}
				}

				&-box {
					padding: 5px 15px;
					border: 1px solid #dcdfe6;
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

	/* #ifndef APP-NVUE */
	@media screen and (max-width: 500px) {
		.hide-on-phone {
			display: none;
		}

		.uni-stat--tab {
			flex-wrap: unset;
			overflow-x: auto !important;
		}
		::-webkit-scrollbar {
		    display: none;
		}
	}
	/* #endif */

</style>
