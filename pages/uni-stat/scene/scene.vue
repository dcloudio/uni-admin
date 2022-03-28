<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">场景值（小程序）</view>
				<view class="uni-sub-title">小程序平台有效。用户打开小程序时的场景，如通过扫描二维码打开小程序，场景为二维码。注意：部分平台可能获取不到场景值，如支付宝小程序</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" :clear="false" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform-scene" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
				<view class="uni-charts-box" style="height: 400px;">
					<qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp />
				</view>
			</view>

			<view class="uni-stat--x p-m">
				<uni-stat-table :data="tableData" :filedsMap="fieldsMap.slice(0, fieldsMap.length-1)"
					:loading="loading" />
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
		stringifyField,
		stringifyGroupField,
		maxDeltaDay,
		getTimeOfSomeDayAgo,
		division,
		format,
		formatDate,
		getCurrentTotalUser
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					dimension: "hour",
					appid: "__UNI__HelloUniApp",
					platform_id: '',
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
				tableData: [],
				panelData: [],
				chartData: {},
				chartTab: 'new_user_count',
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
				const tabs = []
				fieldsMap.forEach(item => {
					const {
						field: _id,
						title: name
					} = item
					const isTab = item.hasOwnProperty('value')
					if (_id && name && isTab) {
						tabs.push({
							_id,
							name
						})
					}
				})
				return tabs
			},
			defQuery() {
				let def = ''
				if (!this.query.platform_id) {
					const notMiniProgramPlatform = [
						"6221e59b428244000187a11d",
						"6221e59b428244000187a11e",
						"6221e59b428244000187a11f",
						"6221e59b428244000187a125",
						"6221e59b428244000187a126"
					]
					def = notMiniProgramPlatform.map(p => `platform_id != "${p}"`).join(' && ')
				}
				return def
			},
			queryStr() {
				return stringifyQuery(this.query, true) + ' && ' + this.defQuery
			},
			dimension() {
				if (maxDeltaDay(this.query.start_time, 1)) {
					return 'hour'
				} else {
					return 'day'
				}
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
				this.getTabelData(this.queryStr)
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTabelData(this.queryStr)
			},

			changeChartTab(id, index, name) {
				this.getChartData(this.queryStr, id, name)
			},

			getAllData(query) {
				this.getPanelData(query)
				this.getChartData(query)
				this.getTabelData(query)
			},

			getChartData(query, field = this.chartTab) {
				this.chartData = {}
				const {
					pageCurrent
				} = this.options
				console.log('..............Chart query：', query);
				console.log('..............Chart stringifyGroupField(fieldsMap, field)：', stringifyGroupField(fieldsMap,
					field));
				const db = uniCloud.database()
				db.collection('opendb-stat-result')
					.where(query)
					.field(`${stringifyField(fieldsMap, field)}, start_time, channel_id`)
					.groupBy('channel_id,start_time')
					.groupField(stringifyGroupField(fieldsMap, field))
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
						const options = {
							categories: [],
							series: [{
								name: '暂无数据',
								data: []
							}]
						}
						const xAxis = options.categories
						if (this.dimension === 'hour') {
							for (let i = 0; i < 24; ++i) {
								const hour = i < 10 ? '0' + i : i
								const x = `${hour}:00 ~ ${hour}:59`
								xAxis.push(x)
							}
						}
						const hasChannels = []
						data.forEach(item => {
							if (hasChannels.indexOf(item.channel_id) < 0) {
								hasChannels.push(item.channel_id)
							}
						})
						let allChannels = []
						this.getChannels().then(res => {
							allChannels = res.result.data
						}).finally(() => {
							hasChannels.forEach((channel, index) => {
								const c = allChannels.find(item => item._id === channel)
								const line = options.series[index] = {
									name: c && c.channel_code || '未知',
									data: []
								}
								for (let i = 0; i < 24; ++i) {
									line.data[i] = 0
								}

								for (const item of data) {
									let date = item.start_time
									const x = formatDate(date, this.dimension)
									let y = item[field]
									if (String(y).indexOf('.' > -1)) {
										if (field === 'bounce_rate') {
											y = y.toFixed(2)
										} else {
											y = y.toFixed(0)
										}
									}
									const dateIndex = xAxis.indexOf(x)
									if (channel === item.channel_id) {
										if (dateIndex < 0) {
											xAxis.push(x)
											line.data.push(y)
										} else {
											line.data[dateIndex] = y
										}
									}

								}
							})
							this.chartData = options
						})
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getChannels() {
				const db = uniCloud.database()
				return db.collection('opendb-app-channels')
					.get()
			},

			getTabelData(query) {
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-result')
					.where(query)
					.groupBy('appid, channel_id')
					.groupField(
						'sum(new_user_count) as total_new_user_count, sum(active_user_count) as total_active_user_count, sum(page_visit_count) as total_page_visit_count, sum(app_launch_count) as total_app_launch_count, avg(avg_session_time) as total_avg_session_time, avg(avg_user_time) as total_avg_user_time, avg(bounce_rate) as total_bounce_rate'
					)
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
						// console.log('.......table:', data);

						this.getChannels().then(res => {
							const channels = res.result.data
							for (const item of data) {
								channels.forEach(channel => {
									if (item.channel_id === channel._id) {
										item.channel_code = channel.channel_code
										item.channel_name = channel.channel_name
									}
								})
							}
						}).finally(() => {
							for (const item of data) {
								mapfields(fieldsMap, item, item, 'total_')
							}
							this.tableData = []
							this.options.total = count
							this.tableData = data
						})

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getPanelData() {
				let cloneQuery = JSON.parse(JSON.stringify(this.query))
				cloneQuery.dimension = 'day'
				let query = stringifyQuery(cloneQuery) + ' && ' + this.defQuery
				console.log(99999999, query)
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-result')
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
						const item = res.result.data[0]
						item && (item.total_total_users = 0)
						getCurrentTotalUser.call(this, query)
						this.panelData = []
						this.panelData = mapfields(fieldsMap, item, undefined, 'total_')
					})
			},

			navTo(id) {
				const url = `/pages/uni-stat/overview/overview?id=${id}`
				uni.navigateTo({
					url
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
