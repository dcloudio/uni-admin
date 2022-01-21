<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">用户忠诚度</view>
				<view class="uni-sub-title">用户忠诚度用户对您应用的访问深度及访问频次情况。助您了解用户对应用的粘度，尤其在对内容改进后，效果是否有所提升</view>
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
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x mb-l" style="padding-top: 0;">
				<view class="mb-m line-bottom">
					<uni-stat-tabs type="boldLine" :tabs="items" style="line-height: 40px; margin-bottom: -17px;" />
				</view>
				<uni-stat-panel :items="panelData" style="box-shadow: unset; border-bottom: 1px solid #eee;" />
				<uni-stat-tabs type="box" :tabs="vitalities" class="mb-l" />
				<view class="p-m">
					<view class="uni-charts-box">
						<qiun-data-charts type="column" :echartsApp="true"
							:opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}"
							:chartData="linearareadata" />
					</view>
				</view>
			</view>
			<view class="uni-stat--x p-m">
				<uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" />
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
					appid: '',
					platform_id: '',
					channel_id: '',
					start_time: [],
				},
				items: [{
					_id: 1,
					name: '访问深度'
				}, {
					_id: 2,
					name: '访问时长'
				}],
				vitalities: [{
					_id: 1,
					name: '访问人数'
				}, {
					_id: 1,
					name: '访问次数'
				}],
				loading: false,
				currentDateTab: 1,
				// currentChartTab: ,
				tableData: [],
				panelData: [],
				chartData: {},
				defaultChart: {
					field: 'new_user_count',
					name: '新增用户'
				},
				linearareadata: {
					categories: [
						"2021-12-03",
						"2021-12-04",
						"2021-12-05",
						"2021-12-06",
						"2021-12-07",
						"2021-12-08"
					],
					series: [{
						name: "日活",
						"data": [
							866,
							620,
							566,
							884,
							905,
							643
						]
					}]
				}
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
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},

			changeChartTab(id, index, name) {
				this.getChartData(this.query, id, name)
			},

			getAllData(query) {
				// this.getPanelData(query)
				// this.getChartData(query)
				this.getTabelData(query)
			},

			getChartData(query, field = 'new_user_count', name = '新增用户') {
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query)
				console.log('..............Chart query：', query);
				const db = uniCloud.database()
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
				query = stringifyQuery(query)
				console.log('..............Table query：', query);
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-loyalty-result')
					.where(query)
					.field('visit_depth_data')
					.orderBy('start_time', 'asc')
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						console.log('.......table:', data);
						const rows = []
						for (const item of data) {
							if (typeof item === 'object') {
								for (const fields in item) {
									const field = item[fields]
									const subs = [],
										x = ''
									if (typeof field === 'object') {
										for (const f in field) {
											x = f
											for (const key in field[f]) {
												const sub = {}
												sub[fields] = key
												sub[f] = field[f][key]
												subs.push(sub)
											}
										}
									}
									const titles = []
									subs.forEach( s => {
										const t = s[fields]
										if (titles.indexOf(t)=== -1) {
											titles.push(t)
										}
									})
									console.log(22222222, subs, titles);
									titles.forEach(title => {
										const row = {}
										row[fields] = title
										for(const sub of subs) {
											if (sub[fields] === title) {
												for (const key in sub) {
													if (key !== fields)
													row[key] = sub[key]
												}

											}
										}
										rows.push(row)
									})
								}
							}
						}
						console.log(111111, rows);
						// this.tableData = []
						// this.options.total = count
						// this.tableData = data
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getPanelData(query) {
				query = stringifyQuery(query)
				console.log('..............Panel query：', query);
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-app-session-result')
					.where(query)
					.groupBy('appid')
					.groupField(
						'sum(page_visit_count) as total_page_visit_count, max(total_users) as total_total_users'
					)
					.orderBy('start_time', 'desc')
					.get({
						getCount: true
					})
					.then(res => {
						console.log('.......table:', res);
						const items = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, items, undefined, 'total_')
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

<style lang="scss">
	.flex {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.label-text {
		font-size: 14px;
		color: #666;
		margin: auto 0;
		margin-right: 5px;
	}

	.line-bottom {
		border-bottom: 2px solid #eee;
	}
</style>
