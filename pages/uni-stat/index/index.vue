<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">统计首页</view>
				<view class="uni-sub-title"></view>
			</view>
		</view>
		<view class="uni-container">
			<uni-notice-bar class="mb-m" text="当日实时统计显示逻辑：3天内未登录统计后台的应用不会处理当日实时统计，再次登录后1小时内会开始进行实时统计。"></uni-notice-bar>
			<view class="uni-stat--x flex mb-m">
				<span class="label-text">平台选择：</span>
				<uni-stat-tabs type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<uni-stat-panel :items="sumData" />
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th align="center">APPID</uni-th>
					<uni-th align="center">应用名</uni-th>
					<uni-th align="center">今日新增用户</uni-th>
					<uni-th align="center">今日活跃用户</uni-th>
					<uni-th align="center">今日访问数</uni-th>
					<uni-th align="center">昨日新增用户</uni-th>
					<uni-th align="center">昨日活跃用户</uni-th>
					<uni-th align="center">昨日访问数</uni-th>
					<uni-th align="center">总用户数</uni-th>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index" style="text-align: center; !important">
					<uni-td>{{item.appid}}</uni-td>
					<uni-td>
						<view class="name">{{item.name}}</view>
					</uni-td>
					<uni-td>{{item.today_num_new_visitor}}</uni-td>
					<uni-td>{{item.today_num_visitor}}</uni-td>
					<uni-td>{{item.today_num_page_views}}</uni-td>
					<uni-td>{{item.yesterday_num_new_visitor}}</uni-td>
					<uni-td>{{item.yesterday_num_visitor}}</uni-td>
					<uni-td>{{item.yesterday_num_page_views}}</uni-td>
					<uni-td>{{item.today_num_total_visitor}}</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary" @click="navTo(item.appid)">查看</button>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="tableData.length" />
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
					platform_id: ''
				},
				tableData: [],
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				sumData: [{
					field: '',
					title: '',
					today: '今天',
					yesterday: '昨天'
				}, {
					field: 'num_new_visitor',
					title: '新增用户',
					today: 0,
					yesterday: 0
				}, {
					field: 'num_visitor',
					title: '活跃用户',
					today: 0,
					yesterday: 0
				}, {
					field: 'num_page_views',
					title: '访问次数',
					today: 0,
					yesterday: 0
				}, {
					field: 'num_total_visitor',
					title: '总用户数',
					today: 0,
					yesterday: 0
				}]
			}
		},

		onReady() {
			this.getApps(this.stringifyQuery(this.query, this.defQuery()))
		},
		watch: {
			query: {
				deep: true,
				handler(newVal) {
					this.getApps(this.stringifyQuery(newVal, this.defQuery()))
				}
			}
		},
		methods: {
			defQuery() {
				const yesterday = this.getSomeDayAgoTime(1)
				return `stat_time >= ${yesterday}`
			},
			// 获取指定日期当天或 n 天前零点的时间戳，丢弃时分秒
			getSomeDayAgoTime( days = 0, date = Date.now()) {
				const d = new Date(date)
				const oneDayTime = 24*60*60*1000
				let ymd = [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')
				ymd = ymd + ' 00:00:00'
				const someDaysAgoTime = new Date(ymd).getTime() - oneDayTime * days
				return someDaysAgoTime
 			},
			stringifyQuery(query, defQuery) {
				if (typeof query !== 'object' && !defQuery) return {}
				const keys = Object.keys(query)
				if (keys.length === 1 && !query[keys[0]]) return defQuery || {}
				const queryArr = []
				keys.forEach(key => {
					let val = query[key]
					if (val) {
						if (typeof val === 'string') {
							val = `"${val}"`
						}
						queryArr.push(`${key} == ${val}`)
					}
				})
				let queryStr = queryArr.length ? queryArr.join('&&') : ''
				if (defQuery) {
					queryStr = queryStr + ' && ' + defQuery
				}
				return queryStr
			},
			getApps(query) {
				console.log('..............query', query);
				this.loading = true
				const db = uniCloud.database()
				const appList = db.collection('opendb-app-list').getTemp()
				const appDaily = db.collection('uni-stat-app-visit-daily')
					.where(query)
					.orderBy('stat_time', 'desc')
					.getTemp()

				db.collection(appList, appDaily)
					.field(
						'appid, name, _id{"uni-stat-app-visit-daily"{num_new_visitor, num_visitor, num_page_views, num_total_visitor, stat_date, stat_time}}'
					)
					.get()
					.then((res) => {
						const {
							data
						} = res.result
						this.tableData = []
						this.sumData = [{
							field: '',
							title: '',
							today: '今天',
							yesterday: '昨天'
						}, {
							field: 'num_new_visitor',
							title: '新增用户',
							today: 0,
							yesterday: 0
						}, {
							field: 'num_visitor',
							title: '活跃用户',
							today: 0,
							yesterday: 0
						}, {
							field: 'num_page_views',
							title: '访问次数',
							today: 0,
							yesterday: 0
						}, {
							field: 'num_total_visitor',
							title: '总用户数',
							today: 0,
							yesterday: 0
						}]
						for (const item of data) {
							const lines = item._id["uni-stat-app-visit-daily"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const today = lines[0] || []
								const yesterday = lines[1] || []
								for (const key in today) {
									item['today_' + key] = today[key] ? today[key] : ''
									item['yesterday_' + key] = yesterday[key] ? yesterday[key] : ''

									for (const sum of this.sumData) {
										if (key === sum.field) {
											sum['today'] += today[key] ? today[key] : 0
											sum['yesterday'] += yesterday[key] ? yesterday[key] : 0
										}
									}
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
		align-items: center;
	}

	.label-text {
		font-size: 14px;
		color: #666;
		margin: auto 0;
		margin-right: 5px;
	}

	.uni-stat {
		&--x {
			border-radius: 4px;
			padding: 15px;
			box-shadow: -1px -1px 5px 0 rgba(0, 0, 0, 0.1);
		}
	}
</style>
