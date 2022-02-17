<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">统计首页</view>
				<view class="uni-sub-title"></view>
			</view>
		</view>
		<view class="uni-container">
			<uni-notice-bar class="mb-m" text="当日实时统计显示逻辑：3天内未登录统计后台的应用不会处理当日实时统计，再次登录后1小时内会开始进行实时统计。"></uni-notice-bar>
			<view class="uni-stat--x flex mb-m">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<uni-stat-panel :items="panelData" :contrast="true" />
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
					<uni-td>{{item.today_new_user_count}}</uni-td>
					<uni-td>{{item.today_active_user_count}}</uni-td>
					<uni-td>{{item.today_page_visit_count}}</uni-td>
					<uni-td>{{item.yesterday_new_user_count}}</uni-td>
					<uni-td>{{item.yesterday_active_user_count}}</uni-td>
					<uni-td>{{item.yesterday_page_visit_count}}</uni-td>
					<uni-td>{{item.today_total_users}}</uni-td>
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
	import {
		stringifyQuery,
		getTimeOfSomeDayAgo,
		division,
		format
	} from '@/js_sdk/uni-stat/util.js'
	export default {
		data() {
			return {
				query: {
					dimension: "day",
					platform_id: '',
					// start_time: [getTimeOfSomeDayAgo(2), getTimeOfSomeDayAgo(1)],
					start_time: [1611681600000, 1644767999999]
				},
				tableData: [],
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				panelData: [{
					field: '',
					title: '',
					tooltip: '',
					value: '今天',
					contrast: '昨天'
				}, {
					field: 'new_user_count',
					title: '新增用户',
					tooltip: '首次访问应用的用户数（以设备为判断标准，去重）',
					value: 0,
					contrast: 0
				}, {
					field: 'active_user_count',
					title: '活跃用户',
					tooltip: '访问过应用内任意页面的总用户数（去重）',
					value: 0,
					contrast: 0
				}, {
					field: 'page_visit_count',
					title: '访问次数',
					tooltip: '访问过应用内任意页面总次数，多个页面之间跳转、同一页面的重复访问计为多次访问',
					value: 0,
					contrast: 0
				}, {
					field: 'total_users',
					title: '总用户数',
					tooltip: '从添加统计到当前选择时间的总用户数（去重）',
					value: 0,
					contrast: 0
				}]
			}
		},

		onReady() {
			this.getApps(stringifyQuery(this.query))
		},
		watch: {
			query: {
				deep: true,
				handler(newVal) {
					this.getApps(stringifyQuery(newVal))
				}
			}
		},
		methods: {
			getApps(query) {
				console.log('..............query', query);
				this.loading = true
				const db = uniCloud.database()
				const appList = db.collection('opendb-app-list').getTemp()
				const appDaily = db.collection('opendb-stat-result')
					.where(query)
					.orderBy('start_time', 'desc')
					.getTemp()

				db.collection(appList, appDaily)
					.field(
						'appid, name, _id{"opendb-stat-result"{new_user_count, active_user_count, page_visit_count, total_users, stat_date, stat_time}}'
					)
					.get()
					.then((res) => {
						const {
							data
						} = res.result
						console.log(222222, data);
						this.tableData = []
						this.panelData.forEach((sum, index) => {
							if (sum.title) {
								sum.value = 0
								sum.contrast = 0
							}
						})
						for (const item of data) {
							const lines = item._id["opendb-stat-result"]
							if (Array.isArray(lines) && lines.length) {
								delete(item._id)
								const today = lines[0] || []
								const yesterday = lines[1] || []
								for (const key in today) {
									item['today_' + key] = format(today[key] ? today[key] : '')
									item['yesterday_' + key] = format(yesterday[key] ? yesterday[key] : '')

									for (const sum of this.panelData) {
										if (key === sum.field) {
											sum.value += today[key] ? today[key] : 0
											sum.contrast += yesterday[key] ? yesterday[key] : 0
										}
									}
								}
								this.tableData.push(item)
							}
						}
						for (const sum of this.panelData) {
							const val = sum.value
							const con = sum.contrast
							if (val) {
								sum.value = format(val)
							}
							if (con) {
								sum.contrast = format(con)
							}
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

<style>
</style>
