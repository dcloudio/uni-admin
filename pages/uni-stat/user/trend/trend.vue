<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<!-- <view class="uni-title">趋势分析</view> -->
				<view class="uni-sub-title hide-on-phone">各指标趋势分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc" :defItem="1"  label="应用选择"
					v-model="query.appid" :clear="false" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id"
					@change="changePlatform" />
				<uni-data-select collection="uni-stat-app-channels"
					field="_id as value, channel_name as text, channel_code" label="渠道选择" v-model="query.channel_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.start_time"
					returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
				<uni-stat-tabs type="box" :current="currentDimensionTab" :tabs="dimensionTabs" class="ml-l"
					v-model="query.dimension" />
			</view>
			<uni-stat-panel :items="panelData" />

			<view class="uni-stat--x p-m">
				<view class="label-text mb-l">
					趋势图
				</view>
				<uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
				<view class="uni-charts-box">
					<qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp />
				</view>
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
		stringifyField,
		stringifyGroupField,
		getTimeOfSomeDayAgo,
		division,
		format,
		formatDate,
		getFieldTotal,
		debounce
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					dimension: "hour",
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
				currentDimensionTab: 0,
				tableData: [],
				panelData: fieldsMap.filter(f => f.hasOwnProperty('value')),
				chartData: {},
				chartTab: 'new_user_count'
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
			dimensionTabs() {
				const tabs = [{
					_id: 'hour',
					name: '按时'
				}, {
					_id: 'day',
					name: '按日'
				}, {
					_id: 'week',
					name: '按周'
				}, {
					_id: 'month',
					name: '按月'
				}]
				if (!this.getDays()) {
					this.query.dimension = 'hour'
					tabs.forEach((tab, index) => {
						if (tab._id === 'hour') {
							tab.disabled = false
						} else {
							tab.disabled = true
						}
					})
					this.currentDimensionTab = 0
				} else {
					this.query.dimension = 'day'
					tabs.forEach((tab, index) => {
						if (tab._id === 'hour') {
							tab.disabled = true
						} else {
							tab.disabled = false
						}
					})
					this.currentDimensionTab = 1
				}
				return tabs
			},
			channelQuery() {
				const platform_id = this.query.platform_id
				return stringifyQuery({
					platform_id
				})
			}
		},
    created() {
    	this.debounceGet = debounce(() => this.getAllData(this.query))
    },
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.debounceGet()
				}
			}
		},
		methods: {
			getDays() {
				if (!this.query.start_time.length) return true
				const day = 24 * 60 * 60 * 1000
				const [start, end] = this.query.start_time
				const lessTwoDay = end - start >= day
				return lessTwoDay
			},
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changePlatform() {
				this.query.channel_id = ''
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const day = 24 * 60 * 60 * 1000
				let start, end
				start = getTimeOfSomeDayAgo(id)
				if (!id) {
					end = getTimeOfSomeDayAgo(0) + day - 1
				} else {
					end = getTimeOfSomeDayAgo(0) - 1
				}
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
				// this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTabelData(this.query)
			},

			changeChartTab(id, index, name) {
				this.getChartData(this.query, id, name)
			},

			getAllData(query) {
				this.getPanelData()
				this.getChartData(query)
				this.getTabelData(query)
			},

			getChartData(query, field = this.chartTab, name = '新增用户') {
				this.chartData = {}
				query = stringifyQuery(query, true)
				const dimension = this.query.dimension
				const db = uniCloud.database()
				db.collection('uni-stat-result')
					.where(query)
					.field(`${stringifyField(fieldsMap, field)}, start_time`)
					.groupBy('start_time')
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
						const options = {
							categories: [],
							series: [{
								name,
								data: []
							}]
						}
						let mapper = fieldsMap.filter(f => f.field === field)
						mapper = JSON.parse(JSON.stringify(mapper))
						delete mapper[0].value
						mapper[0].formatter = ''
						for (const item of data) {
							mapfields(mapper, item, item)
							const x = formatDate(item.start_time, dimension)
							let y = item[field]
							options.series[0].data.push(y)
							options.categories.push(x)
						}
						this.chartData = options
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getTabelData(query) {
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query, true)
				this.options.pageCurrent = 1 // 重置分页
				this.loading = true
				const db = uniCloud.database()
				db.collection('uni-stat-result')
					.where(query)
					.field(stringifyField(fieldsMap))
					.groupBy('start_time')
					.groupField(stringifyGroupField(fieldsMap))
					.orderBy('start_time', 'desc')
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
						for (const item of data) {
							let date = item.start_time
							if (date) {
								const dimension = this.query.dimension
								item.start_time = formatDate(date, dimension)
							}
							mapfields(fieldsMap, item, item)
						}
						this.tableData = []
						this.options.total = count
						this.tableData = data
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
				let query = stringifyQuery(cloneQuery)
				const db = uniCloud.database()
				const subTable = db.collection('uni-stat-result')
					.where(query)
					.field(`${stringifyField(fieldsMap)},stat_date`)
					.groupBy('appid')
					.groupField(stringifyGroupField(fieldsMap))
					.orderBy('stat_date', 'desc')
					.get()
					.then(res => {
						const item = res.result.data[0]
						item && (item.total_users = 0)
						this.panelData = []
						this.panelData = mapfields(fieldsMap, item)
						getFieldTotal.call(this, query, 'total_users')
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

</style>
