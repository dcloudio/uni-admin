<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">受访页</view>
				<view class="uni-sub-title">受访页数据分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex uni-stat--tab mb-m">
				<span class="label-text">应用选择：</span>
				<uni-stat-select mode="app" v-model="query.stat_app_id" />
				<view class="label-text ml-l">渠道选择：</view>
				<uni-stat-select mode="channel" v-model="query.channel_id" />
				<view class="label-text ml-l">版本选择：</view>
				<uni-stat-select />
			</view>
			<view class="uni-stat--x flex mb-m">
				<span class="label-text">平台选择：</span>
				<uni-stat-tabs type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex mb-m">
				<span class="label-text">日期选择：</span>
				<uni-stat-tabs mode="date" v-model="query.stat_time" :disabled="!!stat_time_range.length" />
				<view style="color: #333; margin-right: 30px;">/</view>
				<uni-datetime-picker type="daterange" v-model="stat_time_range" returnType="timestamp"
					:class="{'uni-stat__actived': !!stat_time_range.length}"
					style="max-width: 400px; margin-right: 30px;" />
			</view>
			<uni-stat-panel :items="panelData" />
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th align="center">受访页</uni-th>
					<uni-th align="center">页面名称</uni-th>
					<uni-th align="center">访问人数</uni-th>
					<uni-th align="center">访问次数</uni-th>
					<uni-th align="center">退出页次数</uni-th>
					<uni-th align="center">退出率</uni-th>
					<uni-th align="center">次均停留时长</uni-th>
					<uni-th align="center">人均停留时长</uni-th>
					<uni-th align="center">分享次数</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index" style="text-align: center; !important">
					<uni-td>{{item.url}}</uni-td>
					<uni-td>{{item.title}}</uni-td>
					<uni-td>{{item.num_visitor}}</uni-td>
					<uni-td>{{item.num_visits}}</uni-td>
					<uni-td>{{item.exit_num_visits}}</uni-td>
					<uni-td>{{item.exit_rate}}</uni-td>
					<uni-td>{{item.visit_avg_time}}</uni-td>
					<uni-td>{{item.visitor_avg_time}}</uni-td>
					<uni-td>{{item.num_share}}</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total"
					@change="change" />
			</view>
		</view>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				query: {
					stat_app_id: '',
					platform_id: '',
					channel_id: '',
					stat_time: 1,
				},
				test: 0,
				stat_time_range: [],
				tableData: [],
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				panelData: [{
					title: '访问人数',
					tooltip: '访问人数',
					field: 'total_num_visitor',
					value: 140,
				}, {
					title: '访问次数',
					field: 'total_num_visits',
					value: 140,
				}, {
					title: '退出页次数',
					field: 'total_exit_num_visits',
					value: 140,
				}, {
					title: '退出率',
					field: 'total_exit_rate',
					value: 140,
				}, {
					title: '次均停留时长',
					field: 'avg_visit_avg_time',
					value: '00:02:00',
				}, {
					title: '人均停留时长 ',
					field: 'avg_visitor_avg_time',
					value: '00:02:00',
				}, {
					title: '分享次数',
					field: 'total_num_share',
					value: 140,
				}],
				apps: ['Hello uni-app (__UNI__HelloUniApp)', 'uni-admin (__UNI__uniAdmin)'],
				candidates: ['北京', '南京', '东京', '武汉', '天津', '上海', '海口'],
			}
		},
		onReady() {
			this.getApps(this.stringifyQuery(this.query))
		},
		computed: {
			deepCloneQuery() {
				return JSON.parse(JSON.stringify(this.query))
			}
		},
		watch: {
			deepCloneQuery: {
				deep: true,
				handler(newVal, oldVal) {
					console.log('..........newVal', newVal);
					if (newVal.stat_time !== oldVal.stat_time && this.stat_time_range.length) {
						this.stat_time_range = []
						return
					}
					this.getApps(this.stringifyQuery(newVal))
				}
			},
			stat_time_range(newVal) {
				this.getApps(this.stringifyQuery(this.query))
			}
		},
		methods: {
			defQuery() {
				return ''
			},
			// 获取指定日期当天或 n 天前零点的时间戳，丢弃时分秒
			getTimeOfSomeDayAgo(days = 0, date = Date.now()) {
				const d = new Date(date)
				const oneDayTime = 24 * 60 * 60 * 1000
				let ymd = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')
				ymd = ymd + ' 00:00:00'
				const someDaysAgoTime = new Date(ymd).getTime() - oneDayTime * days
				return someDaysAgoTime
			},
			stringifyQuery(query, defQuery) {
				const queryArr = []
				if (defQuery && typeof defQuery === 'string') {
					queryArr.push(defQuery)
				}
				const range = this.stat_time_range
				const keys = Object.keys(query)
				keys.forEach(key => {
					let val = query[key]
					if (val) {
						if (typeof val === 'string') {
							val = `"${val}"`
						}
						if (key === 'stat_time') {
							if (Array.isArray(range) && range.length === 2) {
								queryArr.push(`stat_time >= ${range[0]} && stat_time <= ${range[1]}`)
							} else {
								queryArr.push(`stat_time >= ${this.getTimeOfSomeDayAgo(val)}`)
							}

						} else {
							queryArr.push(`${key} == ${val}`)
						}
					}
				})
				const queryStr = queryArr.join(' && ')

				return queryStr || {}
			},
			getApps(query) {
				console.log('..............query：', query);
				this.loading = true
				const db = uniCloud.database()
				const mainTableTemp = db.collection('uni-stat-app-pages').getTemp()
				const subTableTemp = db.collection('uni-stat-app-page-view-daily')
					.where(query)
					.orderBy('stat_time', 'desc')
					.getTemp()

				const subTable = db.collection('uni-stat-app-page-view-daily')
					.where(query)
					.groupBy('stat_app_id')
					.groupField(
						'sum(num_visits) as total_num_visits, sum(num_visitor) as total_num_visitor, sum(exit_num_visits) as total_exit_num_visits, sum(num_share) as total_num_share, sum(sum_visit_length) as total_sum_visit_length'
					)
					.orderBy('stat_time', 'desc')
					.get()
					.then(res => {
						console.log('.......res.', res);
						const items = res.result.data[0]
						this.panelData.forEach((sum, index) => {
							if (sum.title) {
								sum.value = 0
							}
							if (!items) return
							const exitTimes = items.total_exit_num_visits
							const visitTimes = items.total_num_visits
							const visitDurtion = items.total_sum_visit_length
							const visitPeople = items.total_num_visitor
							if (sum.field === 'total_exit_rate') {
								const rate = this.division(exitTimes, visitTimes)
								sum.value = this.format(rate, '%')
							} else if (sum.field === 'avg_visit_avg_time') {
								const avgDurtion = this.division(visitDurtion, visitTimes)
								sum.value = this.format(avgDurtion, ':')
							} else if (sum.field === 'avg_visitor_avg_time') {
								const avgDurtion = this.division(visitDurtion, visitPeople)
								sum.value = this.format(avgDurtion, ':')
							} else {
								sum.value = this.format(items[sum.field], ',')
							}
						})
					})


				db.collection(mainTableTemp, subTableTemp)
					.field(
						'title, url, _id{"uni-stat-app-page-view-daily"{exit_num_visits, num_visitor, num_visits, sum_visit_length, num_share,entry_num_visitor, entry_num_visits, entry_sum_visit_length, stat_time}}'
					)
					.get()
					.then(res => {
						const {
							data
						} = res.result
						this.tableData = []
						for (const item of data) {
							const lines = item._id["uni-stat-app-page-view-daily"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								if (line && Object.keys(line)) {
									for (const key in line) {
										item[key] = line[key] ? line[key] : ''
									}
									const exit_rate = line['exit_num_visits'] / line['num_visits']
									const visit_avg_time = line['sum_visit_length'] / line['num_visits']
									const visitor_avg_time = line['sum_visit_length'] / line['num_visitor']
									item['exit_rate'] = exit_rate.toFixed(4)
									item['visit_avg_time'] = Math.ceil(visit_avg_time)
									item['visitor_avg_time'] = Math.ceil(visitor_avg_time)
								}
							}
							this.tableData.push(item)
						}
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			division(dividend, divisor) {
				if (divisor) {
					return dividend / divisor
				} else {
					return 0
				}
			},

			format(num, type) {
				if (typeof num !== 'number') return num
				if (type === '%') {
					return num.toFixed(4) * 100 + type
				} else if (type === ':') {
					num = Math.ceil(3660)
					let h, m, s
					h = m = s = 0
					if (num >= 60) {
						m = Math.floor(num / 60)
					}
					if (m >= 60) {
						h = Math.floor(num / 60)
					}
					// if (mun >= 3600) {
					// 	h = Math.floor(num / 3600)
					// 	m = 
					// }
					m = m % 60
					s = num % 60
					const hms = [h,m,s].map(i => i < 10 ? '0' + i : i )
					return hms.join(type)
				} else if (type === ',') {
					return num.toLocaleString()
				}
			},

			getPanelData() {
				const db = uniCloud.database()
				const mainTable = db.collection('uni-stat-app-pages').getTemp()
				const subTable = db.collection('uni-stat-app-page-view-daily')
					.where(query)
					.orderBy('stat_time', 'desc')
					.getTemp()

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
