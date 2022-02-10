<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">今日概况</view>
				<view class="uni-sub-title">今日概况</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" :today="true"
					@change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<uni-stat-panel :items="panelData" :contrast="true" />

			<view class="uni-stat--x p-m">
				<view class="uni-stat-card-header">
					趋势图
				</view>
				<uni-stat-tabs type="box" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
				<qiun-data-charts type="area" :echartsApp="true" :chartData="chartData"
					:opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}" />
			</view>

			<view style="display: flex;">
				<view class="uni-stat--x p-m" style="margin-right: 7.5px; width: 50%; min-width: 350px;">
					<view class="uni-stat-card-header">
						<view>受访页 TOP10</view>
						<view class="uni-stat-card-header-link" @click="navTo('/pages/uni-stat/page-res/page-res')">查看更多
						</view>
					</view>
					<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
						<uni-tr>
							<uni-th align="center">受访页</uni-th>
							<uni-th align="center">访问次数</uni-th>
							<uni-th align="center">占比</uni-th>
						</uni-tr>
						<uni-tr v-for="(item ,index) in resTableData" :key="index" style="text-align: center; !important">
							<uni-td>{{item.url}}</uni-td>
							<uni-td>{{item.access_times}}</uni-td>
							<uni-td>{{item.rate}}</uni-td>
						</uni-tr>
					</uni-table>
				</view>
				<view class="uni-stat--x uni-stat-card p-m" style="margin-left: 7.5px; width: 50%; min-width: 350px;">
					<view class="uni-stat-card-header">
						<view>入口页 TOP10</view>
						<view class="uni-stat-card-header-link" @click="navTo('/pages/uni-stat/page-ent/page-ent')">查看更多
						</view>
					</view>
					<uni-stat-table :data="[]" :filedsMap="[]" :loading="loading" />
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
					start_time: [],
				},
				options: {
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
					pageSizeIndex: 0, // 与 pageSizeRange 一起计算得出 pageSize
					pageSizeRange: [10, 20, 50, 100],
				},
				loading: false,
				currentDateTab: 4,
				// currentChartTab: ,
				tableData: [],
				resTableData: [],
				entTableData: [],
				panelData: [],
				chartData: {}
			}
		},
		onLoad(option) {
			console.log(22222222, option);
			this.query.appid = option.appid
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
					const _id = item.field
					const name = item.title
					if (_id && name) {
						tabs.push({
							_id,
							name
						})
					}
				})
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
				this.getChartData(this.query)
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getChartData(this.query)
			},

			changeChartTab(id, index, name) {
				this.getChartData(this.query, id, name)
			},

			getAllData(query) {
				this.getPanelData()
				this.getChartData(query)
				this.getPageTableData()
			},

			getChartData(query, field = 'new_user_count', name = '新增用户') {
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query)
				console.log('..............Table query：', query);
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-result')
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
						console.log('.......chart:', data);
						const options = {
							categories: [],
							series: [{
								name,
								data: []
							}]
						}
						this.chartData = []
						for (const item of data) {
							const x = item.stat_date
							const y = item[field]
							if (y) {
								options.series[0].data.push(y)
								options.categories.push(x)
							}
						}
						console.log(11111111111, options);
						this.chartData = options

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

			getPageTableData(query = stringifyQuery(this.query)) {
				const {
					pageCurrent
				} = this.options
				console.log('..............query：', query);
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery({
					appid: this.query.appid
				})
				const mainTableTemp = db.collection('opendb-stat-app-pages').where(filterAppid).getTemp()
				const subTableTemp = db.collection('opendb-stat-app-page-result')
					.where(query)
					.orderBy('access_times', 'desc')
					.getTemp()

				db.collection(mainTableTemp, subTableTemp)
					.field(
						'title, url, _id{"opendb-stat-app-page-result"{access_times, stat_date}}'
					)
					.limit(10)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						this.resTableData = []
						this.options.total = count
						for (const item of data) {
							const lines = item._id["opendb-stat-app-page-result"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								if (line && Object.keys(line).length) {
									item.access_times = line.access_times
									item.rate = line.access_times / 1100
									// mapfields(fieldsMap, line, item)
									this.resTableData.push(item)
								}
							}
						}
						console.log(666666666, this.resTableData);
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getPanelData() {
				const {
					appid,
					platform_id
				} = this.query
				const query = stringifyQuery({
					dimension: "day",
					appid,
					platform_id,
					start_time: [getTimeOfSomeDayAgo(2), getTimeOfSomeDayAgo(1)]
				})
				console.log('..............Panel query：', query);
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-result')
					.where(query)
					.orderBy('start_time', 'desc')
					.get()
					.then(res => {
						const today = res.result.data[0]
						const yesterday = res.result.data[1]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, today)
						this.panelData.map(item => {
							mapfields(fieldsMap, yesterday, item, '', 'contrast')
						})
					})
			},

			navTo(url) {
				if (!url) return
				uni.navigateTo({
					url
				})
			}
		}

	}
</script>

<style>
	.uni-stat-card-header {
		display: flex;
		justify-content: space-between;
		color: #555;
		font-size: 14px;
		font-weight: 600;
		padding: 10px 0;
		margin-bottom: 15px;
	}

	.uni-stat-card-header-link {
		cursor: pointer;
	}
</style>
