<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<view class="uni-sub-title hide-on-phone"></view>
			</view>
		</view>
		<view class="uni-container">
			<uni-notice-bar v-if="!tableData.length && !query.platform_id" showGetMore showIcon class="mb-m pointer"
				text="暂无数据, 统计相关功能需开通 uni 统计后才能使用, 如未开通, 点击查看具体流程"
				@click="navTo('https://uniapp.dcloud.io/uni-stat-v2.html')" />
			<view class="uni-stat--x mb-m">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<!-- <uni-stat-panel :items="panelData" :contrast="true" /> -->
			<uni-table :loading="loading" border stripe emptyText="暂无数据">
				<uni-tr>
					<template v-for="(mapper, index) in tableFieldsMap">
						<uni-th v-if="mapper.title" :key="index" align="center">
							{{mapper.title}}
						</uni-th>
					</template>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,i) in tableData" :key="i">
					<template v-for="(mapper, index) in tableFieldsMap">
						<uni-td v-if="mapper.title" :key="index" align="center">
							{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
						</uni-td>
					</template>
					<uni-td align="center">
						<button class="uni-button" size="mini" type="primary"
							@click="navTo('/pages/uni-stat/device/overview/overview', item.appid)">查看</button>
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
		stringifyField,
		stringifyGroupField,
		getTimeOfSomeDayAgo,
		division,
		format,
		parseDateTime,
		getFieldTotal
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	const panelOption = fieldsMap.filter(f => f.hasOwnProperty('value'))
	export default {
		data() {
			return {
				query: {
					platform_id: '',
					start_time: [getTimeOfSomeDayAgo(1), new Date().getTime()]
				},
				tableData: [],
				panelData: panelOption,
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				fieldsMap,
			}
		},
		onReady() {
			this.getApps(this.queryStr)
		},
		watch: {
			query: {
				deep: true,
				handler(newVal) {
					this.getApps(this.queryStr)
				}
			}
		},
		computed: {
			queryStr() {
				const defQuery = `(dimension == "hour" || dimension == "day")`
				return stringifyQuery(this.query) + ' && ' + defQuery
			},

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
							if (mapper.field !== 'total_users' && mapper.field !== 'total_devices') {
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
			getApps(query) {
				this.loading = true
				const db = uniCloud.database()
				const appList = db.collection('opendb-app-list').getTemp()
				const appDaily = db.collection('uni-stat-result')
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
						this.panelData = JSON.parse(JSON.stringify(panelOption))
						if (!data.length) return
						const start = this.query.start_time[0]
						const end = this.query.start_time[1]
						data = data.filter(item => !(item.stat_date === parseDateTime(start, 'date', '') && item
							.dimension === 'hour'))
						data = data.filter(item => !(item.stat_date === parseDateTime(end, 'date', '') && item
							.dimension === 'day'))
						for (const item of data) {
							const {
								appid,
								name
							} = item.appid[0] || {}
							item.appid = appid
							item.name = name
						}
						const keys = this.fieldsMap.map(f => f.field).filter(Boolean)
						// todo: mulit app
						for (const a of data) {
							a.used = true
							for (const b of data) {
								const rowData = {}
								if (data.length === 1 || (!b.used && a.appid === b.appid && a.stat_date !== b
										.stat_date)) {
									let today = {},
										yesterday = {},
										isToday = parseDateTime(getTimeOfSomeDayAgo(0), '', ''),
										isYesterday = parseDateTime(getTimeOfSomeDayAgo(1), '', '')
									if (a.dimension === 'hour' && a.stat_date === isToday) {
										today = a
									}
									if (a.dimension === 'day' && a.stat_date === isYesterday) {
										yesterday = a
									}
									if (b.dimension === 'hour' && b.stat_date === isToday) {
										today = b
									}
									if (b.dimension === 'day' && b.stat_date === isYesterday) {
										yesterday = b
									}
									const appid = a.appid || b.appid
									if (appid) {
										// total_users 不准确，置空后由 getFieldTotal 处理, appid 不存在时暂不处理
										today.total_devices = 0
										const query = JSON.parse(JSON.stringify(this.query))
										query.start_time = [getTimeOfSomeDayAgo(0), new Date().getTime()]
										query.appid = appid
										getFieldTotal.call(this, query).then(users => {
											this.tableData.find(item => item.appid === appid)
												.total_devices_value = users
										})
									}
									for (const key of keys) {
										if (key === 'appid' || key === 'name') {
											rowData[key] = today[key]
										} else {
											const value = today && today[key] ? today[key] : 0
											const contrast = yesterday && yesterday[key] ? yesterday[key] : 0
											rowData[key + '_value'] = format(value)
											rowData[key + '_contrast'] = format(contrast)
											// panel 数据处理
											// for (const panel of this.panelData) {
											// 	if (key === panel.field) {
											// 		panel.value += value
											// 		panel.contrast += contrast
											// 	}
											// }
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

			navTo(url, id) {
				if (url.indexOf('http') > -1) {
					window.open(url)
				} else {
					if (id) {
						url = `${url}?appid=${id}`
					}
					uni.navigateTo({
						url
					})
				}
			}
		}

	}
</script>

<style>
</style>
