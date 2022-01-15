<template>
	<view class="uni-stat--tab">
		<span v-if="label" class="label-text">{{label + '：'}}</span>
		<view v-if="!renderTabs.length" class="uni-stat--tab-item uni-stat--tab-item-disabled"
			:class="[`uni-stat--tab-item-${type}`]">
			{{placeholder}}
		</view>
		<view v-else v-for="(item, index) in renderTabs" :key="index" @click="change(item._id, index, item.name)"
			class="uni-stat--tab-item"
			:class="[index === currentTab ? `uni-stat--tab-item-${type}-active` : '' , `uni-stat--tab-item-${type}`]">
			{{item.name}}
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
			// value: {
			// 	type: [String, Number],
			// 	default: ''
			// },
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
			if (this.mode === 'platform') {
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
			this.currentTab = index
			if (this.mode === 'date' && index >= 0) {
				this.$nextTick(function() {
					const id = this.renderTabs[index]._id
					const name = this.renderTabs[index].name
					this.$emit('change', id, index, name)
					this.$emit('input', id, index, name)
				})
			}
		},
		watch: {
			current(val) {
				this.currentTab = val
			}
		},
		methods: {
			change(id, index, name) {
				this.currentTab = index
				this.$emit('change', id, index, name)
				this.$emit('input', id, index, name)
			},
			getPlatform() {
				const db = uniCloud.database()
				const appList = db.collection('opendb-stat-app-platforms')
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
			margin: 0 15px;

			&-item {
				font-size: 14px;
				color: #666;
				text-align: center;
				cursor: pointer;
				box-sizing: border-box;
				margin: 15px 0;

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
