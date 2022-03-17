<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">统计首页</view>
				<view class="uni-sub-title"></view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex mb-m">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<uni-stat-panel :items="panelData" :contrast="true" />
			<uni-stat-table :data="tableData" :filedsMap="tableFieldsMap" :loading="loading" />
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
		stringifyField,
		stringifyGroupField,
		getTimeOfSomeDayAgo,
		division,
		format,
		parseDateTime
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				query: {
					// dimension: "hour",
					platform_id: '',
					start_time: [getTimeOfSomeDayAgo(1), new Date().getTime()]
				},
				tableData: [],
				panelData: fieldsMap.filter(f => f.hasOwnProperty('value')),
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				fieldsMap
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
		computed: {
			tableFieldsMap() {
				let tableFields = []
				const today = []
				const yesterday = []
				const other = []
				for (const mapper of fieldsMap) {
					if (mapper.field) {
						if (mapper.hasOwnProperty('value')) {
							const t = JSON.parse(JSON.stringify(mapper))
							const y = JSON.parse(JSON.stringify(mapper))
							if (mapper.field !== 'total_users') {
								t.title = '今日' + mapper.title
								t.field = mapper.field + '_value'
								y.title = '昨日' + mapper.title
								y.field = mapper.field + '_contrast'
								today.push(t)
								yesterday.push(y)
							} else {
								t.field = mapper.field + '_value'
								other.push(t)
							}
						} else {
							tableFields.push(mapper)
						}
					}
				}
				tableFields = [...tableFields, ...today, ...yesterday, ...other]
				return tableFields
			}
		},
		methods: {
			getApps(query, type = "day") {
				console.log('..............query', query);
				this.loading = true
				const db = uniCloud.database()
				const appList = db.collection('opendb-app-list').getTemp()
				const appDaily = db.collection('opendb-stat-result')
					.where(query)
					.getTemp()

				db.collection(appDaily, appList)
					.field(
						`${stringifyField(fieldsMap, '', 'value')},stat_date,appid,dimension`
					)
					.groupBy(`appid,dimension,stat_date`)
					.groupField(stringifyGroupField(fieldsMap, '', 'value'))
					.orderBy('stat_date', 'desc')
					.get()
					.then((res) => {
						let {
							data
						} = res.result
						this.tableData = []
						this.panelData.forEach((panel, index) => {
							if (panel.title) {
								panel.value = 0
								panel.contrast = 0
							}
						})
						if (!data.length) return
						const rowData = {}
						const start = this.query.start_time[0]
						data = data.filter(item => !(item.stat_date === parseDateTime(start, 'date', '') && item.dimension === 'hour'))
						for (const item of data) {
							const {
								appid,
								name
							} = item.appid[0]
							item.appid = appid
							item.name = name
						}
						const keys = this.fieldsMap.map(f => f.field).filter(Boolean)
						// todo: mulit app
						// data = [
						//     {
						//         "appid": "__UNI__HelloUniApp",
						//         "dimension": "hour",
						//         "stat_date": "20220317",
						//         "new_user_count": 1525,
						//         "active_user_count": 8758,
						//         "page_visit_count": 91435,
						//         "total_users": 4452,
						//         "name": "Hello uni-app",
						//     },
						//     {
						//         "appid": "__UNI__HelloUniApp",
						//         "dimension": "day",
						//         "stat_date": "20220316",
						//         "new_user_count": 1864,
						//         "active_user_count": 5356,
						//         "page_visit_count": 115397,
						//         "total_users": 1590,
						//         "name": "Hello uni-app",
						//     },
						// 	{
						// 	    "appid": "__UNI__HelloUniApp111",
						// 	    "dimension": "hour",
						// 	    "stat_date": "20220317",
						// 	    "new_user_count": 1525,
						// 	    "active_user_count": 8758,
						// 	    "page_visit_count": 91435,
						// 	    "total_users": 4452,
						// 	    "name": "Hello uni-app11111",
						// 	},
						// 	{
						// 	    "appid": "__UNI__HelloUniApp111",
						// 	    "dimension": "day",
						// 	    "stat_date": "20220316",
						// 	    "new_user_count": 1864,
						// 	    "active_user_count": 5356,
						// 	    "page_visit_count": 115397,
						// 	    "total_users": 1590,
						// 	    "name": "Hello uni-app1111",
						// 	}
						// ]
						for (const a of data) {
							a.used = true
							for (const b of data) {
								if (data.length === 1 || (!b.used && a.appid === b.appid && a.stat_date !== b.stat_date)) {
									let today, yesterday
									if (data.length < 2) {
										today = data[0]
									} else {
										Number(a.stat_date) > Number(b.stat_date) ? [today, yesterday] = [a, b] : [today, yesterday] = [b, a]
									}
									for (const key of keys) {
										if (key === 'appid' || key === 'name') {
											rowData[key] = today[key]
										} else {
											rowData[key + '_value'] = format(today && today[key] ? today[key] : '')
											rowData[key + '_contrast'] = format(yesterday && yesterday[key] ? yesterday[key] : '')
											for (const panel of this.panelData) {
												if (key === panel.field) {
													panel.value += today && today[key] ? today[key] : 0
													panel.contrast += yesterday && yesterday[key] ? yesterday[key] : 0
												}
											}
										}
									}
									this.tableData.push(rowData)
								}
							}
						}
						for (const panel of this.panelData) {
							panel.value = format(panel.value)
							panel.contrast = format(panel.contrast)
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
