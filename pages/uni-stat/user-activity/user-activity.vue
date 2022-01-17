<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">用户活跃度</view>
				<view class="uni-sub-title">用户活跃度分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" />
				<uni-stat-select mode="channel" label="渠道选择" v-model="query.channel_id" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" :yesterday="false"
					@change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x p-m">
				<view class="label-text mb-l">
					趋势图
				</view>
				<uni-stat-tabs type="box" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
				<qiun-data-charts type="area" :echartsApp="true" :chartData="chartData"
					:opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}" />
			</view>

			<view class="uni-stat--x p-m">
				<uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" />
				<view class="uni-pagination-box">
					<picker class="select-picker" mode="selector" :value="options.pageSizeIndex"
						:range="options.pageSizeRange" @change="changePageSize">
						<button type="default" size="mini" :plain="true">
							<text>{{pageSize}} 条/页</text>
							<uni-icons class="select-picker-icon" type="arrowdown" size="12" color="#999"></uni-icons>
						</button>
					</picker>
					<uni-pagination show-icon :page-size="pageSize" :current="options.pageCurrent"
						:total="options.total" @change="changePageCurrent" />
				</view>
			</view>
		</view>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		mapfields,
		stringifyQuery,
		getTimeOfSomeDayAgo,
		division,
		format
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					dimension: "day",
					appid: '',
					platform_id: '',
					channel_id: '',
					start_time: [],
				},
				options: {
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
					pageSizeIndex: 0, // 与 pageSizeRange 一起计算得出 pageSize
					pageSizeRange: [10, 20, 50, 100],
				},
				loading: false,
				currentDateTab: 0,
				currentChartTab: 'day',
				tableData: [],
				panelData: [],
				chartData: {},
				defaultChart: {
					field: 'new_user_count',
					name: '新增用户'
				},
			}
		},
		computed: {
			pageSize() {
				const {
					pageSizeRange,
					pageSizeIndex
				} = this.options
				return pageSizeRange[pageSizeIndex]
			},
			chartTabs() {
				const tabs = [{
					_id: 'day',
					name: '日活'
				}, {
					_id: 'week',
					name: '周活'
				}, {
					_id: 'month',
					name: '月活'
				}]
				return tabs
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.getAllData(val)
				}
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) + 24 * 60 * 60 - 1
				this.query.start_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTabelData(this.query)
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTabelData(this.query)
			},

			changeChartTab(type, index, name) {
				this.currentChartTab = type
				this.getChartData(this.query, type, name)
			},

			getAllData(query) {
				this.getChartData(query, this.currentChartTab)
				this.getTabelData(query)
			},

			getChartData(query, type, name = '日活', field = 'active_user_count') {
				const options = {
					categories: [],
					series: [{
						name,
						data: []
					}]
				}
				query = stringifyQuery(query)
				const db = uniCloud.database()
				if (type === 'day') {
					db.collection('opendb-stat-app-session-result')
						.where(query)
						.field(`${field}, start_time, stat_date`)
						.orderBy('start_time', 'asc')
						.get({
							getCount: true
						})
						.then(res => {
							const {
								count,
								data
							} = res.result
							// console.log('.......chart:', data);
							this.chartData = []
							for (const item of data) {
								const x = item.stat_date
								const y = item[field]
								if (y) {
									options.series[0].data.push(y)
									options.categories.push(x)
								}
							}
							this.chartData = options
						}).catch((err) => {
							console.error(err)
						})
				} else {
					this.getRangeCountData(query, type).then(res => {
						const {
							count,
							data
						} = res.result
						this.chartData = []
						for (const item of data) {
							const x = item.year + '/' + item[type] + type
							const y = item[type + '_' + field]
							if (y) {
								options.series[0].data.push(y)
								options.categories.push(x)
							}
						}
						this.chartData = options
					})
				}
			},

			getTabelData(query) {
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query)
				console.log('..............Table query：', query);
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-app-session-result')
					.where(query)
					.field('active_user_count, start_time, stat_date')
					.skip((pageCurrent - 1) * this.pageSize)
					.limit(this.pageSize)
					.orderBy('start_time', 'asc')
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						let daysData = data,
							daysCount = count,
							weeks = [],
							months = []

						this.getRangeCountData(query, 'week').then(res => {
							const {
								count,
								data
							} = res.result
							weeks = data

							this.getRangeCountData(query, 'month').then(res => {
								const {
									count,
									data
								} = res.result
								months = data

								const allData = this.mapWithWeekAndMonth(daysData, weeks, months)

								for (const item of allData) {
									mapfields(fieldsMap, item, item)
								}
								this.tableData = []
								this.options.total = daysCount
								this.tableData = allData
							})
						})


					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getRangeCountData(query, type) {
				const {
					pageCurrent
				} = this.options
				const db = uniCloud.database()
				return db.collection('opendb-stat-app-session-result')
					.where(query)
					.field(
						`active_user_count, start_time, ${type}(add(new Date(0),start_time), "Asia/Shanghai") as ${type},year(add(new Date(0),start_time), "Asia/Shanghai") as year`
					)
					.groupBy(`year, ${type}`)
					.groupField(`sum(active_user_count) as ${type}_active_user_count`)
					.orderBy(`year asc, ${type} asc`)
					.get({
						getCount: true
					})
			},


			mapWithWeekAndMonth(data, weeks, months) {
				for (const item of data) {
					const date = new Date(item.start_time)
					const year = date.getUTCFullYear()
					const month = date.getMonth() + 1
					const week = this.getWeekNumber(date)
					for (const w of weeks) {
						if (w.week === week && w.year === year) {
							item[`week_active_user_count`] = w[`week_active_user_count`]
						}
					}
					for (const m of months) {
						if (m.month === month && m.year === year) {
							item[`month_active_user_count`] = m[`month_active_user_count`]
						}
					}
				}

				return data
			},

			getWeekNumber(d) {
				// Copy date so don't modify original
				d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
				// Set to nearest Thursday: current date + 4 - current day number
				// Make Sunday's day number 7
				d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
				// Get first day of year
				var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
				// Calculate full weeks to nearest Thursday
				var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
				// Return array of year and week number
				return weekNo;
			}

		}

	}
</script>

<style>

</style>
