<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">受访页</view>
				<view class="uni-sub-title">受访页数据分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.stat_app_id" />
				<uni-stat-select mode="channel" label="渠道选择" v-model="query.channel_id" />
				<uni-stat-select label="版本选择" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" mode="date" v-model="query.stat_time"
					:disabled="!!query.stat_time_range.length" />
				<view style="color: #333; font-size: 14px; margin: 0 30px;">/</view>
				<uni-datetime-picker type="daterange" v-model="query.stat_time_range" returnType="timestamp"
					class="uni-stat-datetime-picker" :class="{'uni-stat__actived': !!query.stat_time_range.length}" />
			</view>
			<uni-stat-panel :items="panelData" />
			<view class="uni-stat--x p-m">
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
					<!-- #ifndef MP -->
					<picker class="select-picker" mode="selector" :value="options.pageSizeIndex"
						:range="options.pageSizeRange" @change="changePageSize">
						<button type="default" size="mini" :plain="true">
							<text>{{pageSize}} 条/页</text>
							<uni-icons class="select-picker-icon" type="arrowdown" size="12" color="#999"></uni-icons>
						</button>
					</picker>
					<!-- #endif -->
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
		stringifyQuery,
		division,
		format
	} from '@/js_sdk/uni-stat/util.js'
	export default {
		data() {
			return {
				tableData: [],
				loading: false,
				query: {
					stat_app_id: '',
					platform_id: '',
					channel_id: '',
					stat_time: 1,
					stat_time_range: []
				},
				options: {
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
					pageSizeIndex: 0,  // 与 pageSizeRange 一起计算得出 pageSize
					pageSizeRange: [1, 10, 20, 50, 100],
				},
				panelData: [{
					title: '访问人数',
					tooltip: '访问人数',
					field: 'total_num_visitor',
					value: 0,
				}, {
					title: '访问次数',
					field: 'total_num_visits',
					value: 0,
				}, {
					title: '退出页次数',
					field: 'total_exit_num_visits',
					value: 0,
				}, {
					title: '退出率',
					field: 'total_exit_rate',
					value: 0,
				}, {
					title: '次均停留时长',
					field: 'avg_visit_avg_time',
					value: 0,
				}, {
					title: '人均停留时长 ',
					field: 'avg_visitor_avg_time',
					value: 0,
				}, {
					title: '分享次数',
					field: 'total_num_share',
					value: 0,
				}]
			}
		},
		onReady() {
			this.getAllData()
		},
		computed: {
			deepCloneQuery() {
				return JSON.parse(JSON.stringify(this.query))
			},

			pageSize() {
				const {
					pageSizeRange,
					pageSizeIndex
				} = this.options
				return pageSizeRange[pageSizeIndex]
			}
		},
		watch: {
			deepCloneQuery: {
				deep: true,
				handler(newVal, oldVal) {
					this.options.pageCurrent = 1 // 重置分页
					if (newVal.stat_time !== oldVal.stat_time && newVal.stat_time_range.length) {
						this.query.stat_time_range = []
						return
					}
					const query = stringifyQuery(newVal)
					this.getAllData(query)
				}
			}
		},
		methods: {
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData()
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTableData()
			},

			getAllData(query) {
				this.getPanelData(query)
				this.getTableData(query)
			},

			getTableData(query = stringifyQuery(this.query)) {
				const {
					pageCurrent
				} = this.options
				const {
					pageSize
				} = this
				console.log('..............query：', query);
				this.loading = true
				const db = uniCloud.database()
				const mainTableTemp = db.collection('uni-stat-app-pages').getTemp()
				const subTableTemp = db.collection('uni-stat-app-page-view-daily')
					.where(query)
					.orderBy('stat_time', 'desc')
					.getTemp()

				db.collection(mainTableTemp, subTableTemp)
					.field(
						'title, url, _id{"uni-stat-app-page-view-daily"{exit_num_visits, num_visitor, num_visits, sum_visit_length, num_share,entry_num_visitor, entry_num_visits, entry_sum_visit_length, stat_time}}'
					)
					.skip((pageCurrent - 1) * pageSize)
					.limit(pageSize)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						this.tableData = []
						this.options.total = count
						for (const item of data) {
							const lines = item._id["uni-stat-app-page-view-daily"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								if (line && Object.keys(line).length) {
									for (const key in line) {
										item[key] = format(line[key])
									}
									const exit_rate = line['exit_num_visits'] / line['num_visits']
									item['exit_rate'] = format(exit_rate, '%')
									const visit_avg_time = line['sum_visit_length'] / line['num_visits']
									item['visit_avg_time'] = format(visit_avg_time, ':')
									const visitor_avg_time = line['sum_visit_length'] / line['num_visitor']
									item['visitor_avg_time'] = format(visitor_avg_time, ':')
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

			getPanelData(query = stringifyQuery(this.query)) {
				const db = uniCloud.database()
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
								const rate = division(exitTimes, visitTimes)
								sum.value = format(rate, '%')
							} else if (sum.field === 'avg_visit_avg_time') {
								const avgDurtion = division(visitDurtion, visitTimes)
								sum.value = format(avgDurtion, ':')
							} else if (sum.field === 'avg_visitor_avg_time') {
								const avgDurtion = division(visitDurtion, visitPeople)
								sum.value = format(avgDurtion, ':')
							} else {
								sum.value = format(items[sum.field])
							}
						})
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
