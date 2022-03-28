<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">错误分析</view>
				<view class="uni-sub-title">开发者可以在这里快速查询应用最近出现的具体错误内容，了解错误概况信息，以便快速修复问题</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" :clear="false" />
				<uni-stat-select mode="version" label="版本选择" v-model="query.version_id" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" :yesterday="false" mode="date"
					@change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<view class="uni-charts-box">
					<qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp />
				</view>
			</view>

			<view class="uni-stat--x p-m">
				<uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" tooltip />
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
		format,
		formatDate,
		parseDateTime
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					dimension: "day",
					appid: "__UNI__HelloUniApp",
					platform_id: '',
					version_id: '',
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
				// currentChartTab: ,
				tableData: [],
				panelData: [],
				chartData: {}
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
			queryStr() {
				return stringifyQuery(this.query)
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.getAllData(this.queryStr)
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
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},

			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData(this.queryStr)
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTableData(this.queryStr)
			},

			getAllData(query) {
				// this.getPanelData(query)
				this.getChartData(query)
				this.getTableData(query)
			},

			getChartData(query, field = 'day_count') {
				const {
					pageCurrent
				} = this.options
				console.log('..............Chart query：', query);
				const db = uniCloud.database()
				db.collection('opendb-stat-error-result')
					.where(query)
					.groupBy('start_time')
					.groupField('sum(count) as total_day_count')
					.orderBy('start_time', 'asc')
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						console.log('.......chart:', data);

						let dayAppLaunchs = []
						this.getDayLaunch(query).then(res => {
							dayAppLaunchs = res.result.data
							console.log(3333333333, dayAppLaunchs);
						}).finally(() => {
							const options = {
								categories: [],
								series: [{
									name: '暂无数据',
									data: []
								}]
							}
							const countLine = options.series[0] = {
								name: '错误次数',
								data: []
							}
							const rateLine = options.series[1] = {
								name: '错误率',
								data: []
							}
							const xAxis = options.categories
							for (const item of data) {
								let date = item.start_time
								const x = formatDate(date, 'day')
								const countY = item[`total_${field}`]
								xAxis.push(x)
								countLine.data.push(countY)
								if (dayAppLaunchs.length) {
									dayAppLaunchs.forEach(day => {
										if (day.start_time === item.start_time) {
											let rateY = item[`total_${field}`] / day
												.day_app_launch_count
											rateY = rateY.toFixed(2)
											rateLine.data.push(rateY)
										}
									})
								}
							}
							console.log(6666666, options);
							this.chartData = {}
							this.chartData = options
						})
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {})
			},

			getTotalCount(query) {
				const db = uniCloud.database()
				return db.collection('opendb-stat-error-result')
					.where(query)
					.groupBy('appid')
					.groupField('sum(count) as total_count')
					.get()
			},

			getTotalLaunch(query) {
				const db = uniCloud.database()
				return db.collection('opendb-stat-result')
					.where(query)
					.groupBy('appid')
					.groupField('sum(app_launch_count) as total_app_launch_count')
					.get()
			},

			getDayLaunch(query) {
				const db = uniCloud.database()
				return db.collection('opendb-stat-result')
					.where(query)
					.groupBy('start_time')
					.groupField('sum(app_launch_count) as day_app_launch_count')
					.orderBy('start_time', 'asc')
					.get()
			},

			getTableData(query = stringifyQuery(this.query)) {
				const {
					pageCurrent
				} = this.options
				console.log('..............query：', query);
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery({
					appid: this.query.appid
				})
				const mainTableTemp = db.collection('opendb-stat-error-result').where(query).getTemp()
				const subTableTemp = db.collection('opendb-stat-app-versions')
					.where(filterAppid)
					.orderBy('start_time ', 'desc ')
					.getTemp()

				db.collection(mainTableTemp, subTableTemp)
					.skip((pageCurrent - 1) * this.pageSize)
					.limit(this.pageSize)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						const tempData = []
						const panelData = []
						for (const item of data) {
							item.last_time = parseDateTime(item.last_time, 'dateTime')
							const lines = item.version_id
							if (Array.isArray(lines)) {
								delete(item.version_id)
								const version = lines[0] && lines[0].version
								if (version) {
									item.version = version
								}
							}
							tempData.push(item)
						}
						this.getTotalCount(query).then(res => {
							const total = res.result.data[0]
							const total_count = total && total.total_count
							if (total_count) {
								tempData.forEach(item => item.total_count = Number(total_count))
								panelData[0] = {
									title: '错误总数',
									value: total_count,
									tooltip: '指应用在某个时间段内出现错误的总数'
								}
							}
							let launch_count = ''
							this.getTotalLaunch(query).then(res => {
								const total = res.result.data[0]
								launch_count = total && total.total_app_launch_count
								if (total_count && launch_count) {
									let errorRate = total_count / launch_count
									errorRate = (errorRate * 100).toFixed(2) + '%'
									panelData[1] = {
										title: '错误率',
										value: errorRate,
										tooltip: '时间范围内的总错误数/应用启动次数，如果小于0.01%，默认显示为0'
									}
								}
							}).finally(() => {
								this.panelData = []
								this.panelData = panelData
							})

						}).finally(() => {
							this.tableData = []
							this.options.total = count
							tempData.forEach(item => mapfields(fieldsMap, item, item))
							this.tableData = tempData
						})

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			createStr(maps, fn, prefix = 'total_') {
				const strArr = []
				maps.forEach(mapper => {
					if (field.hasOwnProperty('value')) {
						const fieldName = mapper.field
						strArr.push(`${fn}(${fieldName}) as ${prefix + fieldName}`)
					}
				})
				return strArr.join()
			},

			getPanelData(query) {
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-error-result')
					.where(query)
					.groupBy('appid')
					.groupField(
						'sum(new_user_count) as total_new_user_count, sum(active_user_count) as total_active_user_count, sum(page_visit_count) as total_page_visit_count, sum(app_launch_count) as total_app_launch_count, avg(avg_session_time) as total_avg_session_time, avg(avg_user_time) as total_avg_user_time, avg(bounce_rate) as total_bounce_rate, max(total_users) as total_total_users'
					)
					.orderBy('start_time', 'desc')
					.get({
						getCount: true
					})
					.then(res => {
						const items = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, items, undefined, 'total_')
					})
			}
		}

	}
</script>

<style>
	.uni-stat-panel {
		box-shadow: unset;
		border-bottom: 1px solid #eee;
		padding: 0;
		margin: 0 15px;
	}
</style>
