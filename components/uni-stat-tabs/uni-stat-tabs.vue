<template>
	<view class="uni-stat--tab">
		<span v-if="label" class="label-text">{{label + '：'}}</span>
		<view v-if="!renderTabs.length" class="uni-stat--tab-item uni-stat--tab-item-disabled" :class="[`uni-stat--tab-item-${type}`]">
			{{placeholder}}
		</view>
		<view v-else v-for="(item, index) in renderTabs" :key="index" @click="change(item._id, index)"
			class="uni-stat--tab-item"
			:class="[index === current ? `uni-stat--tab-item-${type}-active` : '' , `uni-stat--tab-item-${type}`, (index === current && disabled) ? `uni-stat--tab-item-${type}-active-disabled` : '']">
			{{item.name}}
		</view>

	</view>
</template>

<script>
	export default {
		name: "uni-stat-tabs",
		data() {
			return {
				current: 0,
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
			disabled: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				default: 'label'
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
				this.renderTabs = [{
					_id: 1,
					name: '昨天',
				}, {
					_id: 7,
					name: '最近七天',
				}, {
					_id: 30,
					name: '最近30天',
				}, {
					_id: 90,
					name: '最近90天',
				}]
			}else {
				this.renderTabs = this.tabs
			}
		},
		methods: {
			change(e, index) {
				console.log(',,,,,,,,,', e);
				// if(this.disabled) return
				this.current = index
				this.$emit('change', e)
				this.$emit('input', e)
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
						&-disabled {
							color: #666;
							border-color: #666;
						}
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
