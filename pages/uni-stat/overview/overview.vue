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
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<uni-stat-panel :items="panelData" :contrast="true" />

			<view class="uni-stat--x p-m">
				<view class="label-text mb-l">
					趋势图
				</view>
				<uni-stat-tabs type="box" :tabs="chartTabs" class="mb-l" />
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
					const query = stringifyQuery(val)
					this.getAllData(query)
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
				this.getTableData(stringifyQuery(this.query))
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTableData(stringifyQuery(this.query))
			},

			getAllData(query = stringifyQuery(this.query)) {
				this.getPanelData()
				this.getTableData(query)
			},

			getTableData(query) {
				const {
					pageCurrent
				} = this.options
				console.log('..............Table query：', query);
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-app-session-result')
					.where(query)
					.field('new_user_count, start_time, stat_date')
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
						console.log('.......chart:', data);
						const options = {
							categories: [],
							series: [{
								name: "日活",
								smooth: true,
								areaStyle: {
									color: {
										type: 'linear',
										x: 0,
										y: 0,
										x2: 0,
										y2: 1,
										colorStops: [{
											offset: 0,
											color: '#1890FF' // 0% 处的颜色
										}, {
											offset: 1,
											color: '#FFFFFF' // 100% 处的颜色
										}],
										global: false // 缺省为 false
									}
								},
								data: []
							}]
						}
						this.chartData = []
						for (const item of data) {
							options.categories.push(item.stat_date)
							options.series[0].data.push(item.new_user_count)
						}
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

			getPanelData() {
				const {
					appid,
					platform_id
				} = this.query
				const query = stringifyQuery({
					dimension: "day",
					appid,
					platform_id,
					start_time: [getTimeOfSomeDayAgo(1), getTimeOfSomeDayAgo(0)]
				})
				console.log('..............Panel query：', query);
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-app-session-result')
					.where(query)
					.orderBy('start_time', 'desc')
					.get()
					.then(res => {
						const items = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, items, undefined)
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
