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
				<qiun-data-charts type="area" :echartsApp="true" :chartData="chartData" :opts="chartOption" />
			</view>

			<view style="display: flex;">
				<view class="uni-stat--x p-m" style="margin-right: 7.5px; width: 50%; min-width: 350px;">
					<view class="uni-stat-card-header">
						<view>受访页 TOP10</view>
						<view class="uni-stat-card-header-link" @click="navTo('/pages/uni-stat/page-res/page-res')">查看更多
						</view>
					</view>
					<uni-stat-table :data="resTableData" :filedsMap="resFieldsMap" :loading="loading" tooltip />
				</view>
				<view class="uni-stat--x uni-stat-card p-m" style="margin-left: 7.5px; width: 50%; min-width: 350px;">
					<view class="uni-stat-card-header">
						<view>入口页 TOP10</view>
						<view class="uni-stat-card-header-link" @click="navTo('/pages/uni-stat/page-ent/page-ent')">查看更多
						</view>
					</view>
					<uni-stat-table :data="entTableData" :filedsMap="entFieldsMap" :loading="loading" tooltip />
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
				chartData: {},
				resFieldsMap: [{
					title: '受访页',
					field: 'url',
					tooltip: '用户进入应用访问的所有页面，例如用户从页面1进入应用，跳转到页面2，1,2均为受访页',
					formatter: ''
				}, {
					title: '访问次数',
					field: 'access_times',
					tooltip: '访问该页面的总次数'
				}, {
					title: '占比',
					field: 'rate',
					computed: 'access_times/total_app_access',
					tooltip: '某个页面的访问次数占所有页面访问次数的比例',
					formatter: '%',
				}],
				entFieldsMap: [{
					title: '入口页',
					field: 'url',
					tooltip: '用户进入应用访问的第一个页面，例如用户从页面1进入应用，跳转到页面2，1为入口页，而2不是',
					formatter: ''
				}, {
					title: '访问次数',
					field: 'entry_count',
					tooltip: '访问该页面的总次数'
				}, {
					title: '占比',
					field: 'rate',
					computed: 'entry_count/total_app_access',
					tooltip: '某个页面的访问次数占所有页面访问次数的比例',
					formatter: '%'
				}],
				chartOption: {
					extra: {
						area: {
							type: 'curve',
							addLine: true,
							gradient: true
						}
					}
				}
			}
		},
		onLoad(option) {
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
				this.currentDateTab = null
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const day = 24 * 60 * 60 * 1000
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) + day - 1
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
				this.getPageData(query, 'res')
				this.getPageData(query, 'ent')
			},

			getDays() {
				const day = 24 * 60 * 60 * 1000
				const [start, end] = this.query.start_time
				console.log(start, end, end - start);
				const lessTwoDay = end - start >= day
				console.log(55555555, lessTwoDay);
				return lessTwoDay
			},

			getChartData(query, field = 'new_user_count', name = '新增用户') {
				const {
					pageCurrent
				} = this.options
				const days = this.currentDateTab
				const date = getTimeOfSomeDayAgo(days)
				const day = 24 * 60 * 60 * 1000
				if (!this.getDays()) {
					const start = date - day
					const end = date + day - 1
					query = JSON.parse(JSON.stringify(query))
					// query.start_time = [start, end]
					query.start_time = [1644681600000, 1644854399999]
					query.dimension = 'hour'
				}
				query = stringifyQuery(query)
				console.log('..............getChartData query：', query);
				// this.loading = true
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
						if (!this.getDays()) {
							const line = options.series[0] = {
								name: 'a',
								data: []
							}
							const cont = options.series[1] = {
								name: 'b',
								data: []
							}
							for (let i = 0; i < 24; ++i) {
								const hour = i < 10 ? '0' + i : i
								const x = `${hour}:00 ~ ${hour}:59`
								options.categories.push(x)
								line.data[i] = 0
								cont.data[i] = 0
								data.forEach(item => {
									const d = new Date(item.start_time)
									if (item.start_time < date) {
										if (d.getHours() === i) {
											line.data[i] = item[field]
										}
									} else {
										if (d.getHours() === i) {
											cont.data[i] = item[field]
										}
									}
								})
							}
						} else {
							for (const item of data) {
								const x = item.stat_date
								const y = item[field]
								if (y) {
									options.series[0].data.push(y)
									options.categories.push(x)
								}
							}
						}

						this.chartData = []
						this.chartData = options
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getAppAccessTimes(query) {
				const db = uniCloud.database()
				return db.collection('opendb-stat-result')
					.where(query)
					.groupBy('appid')
					.groupField(`sum(page_visit_count) as total_app_access`)
					.get()
			},

			getPageData(query, type) {
				query = stringifyQuery(query)
				const {
					pageCurrent
				} = this.options
				const map = this[`${type}FieldsMap`]
				const field = map[1].field
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery({
					appid: this.query.appid
				})
				const mainTableTemp = db.collection('opendb-stat-app-pages')
					.where(filterAppid)
					.field('_id, title, url')
					.getTemp()
				const subTableTemp = db.collection('opendb-stat-app-page-result')
					.where(query)
					.orderBy(field, 'desc')
					.limit(10)
					.getTemp()

				db.collection(subTableTemp, mainTableTemp)
					.field(
						`${field}, page_id`
					)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						let total_app_access
						this.getAppAccessTimes(query).then(res => {
							const data = res.result.data[0]
							total_app_access = data && data.total_app_access
						}).finally(() => {
							this[`${type}TableData`] = []
							for (const item of data) {
								item.total_app_access = total_app_access
								const lines = item.page_id
								if (Array.isArray(lines)) {
									delete(item.page_id)
									const line = lines[0]
									if (line && Object.keys(line).length) {
										for (const key in line) {
											if (key !== '_id') {
												item[key] = line[key]
											}
										}

									}
								}
								mapfields(map, item, item)
								this[`${type}TableData`].push(item)
							}
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
				const {
					appid,
					platform_id
				} = this.query
				const query = stringifyQuery({
					dimension: "day",
					appid,
					platform_id,
					// start_time: [getTimeOfSomeDayAgo(2), getTimeOfSomeDayAgo(1)]
					start_time: [1611681600000, 1644767999999]
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
