<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<view class="uni-sub-title hide-on-phone"></view>
			</view>
		</view>
		<view class="uni-container">
			<uni-notice-bar v-if="!deviceTableData.length && !userTableData.length && !query.platform_id" showGetMore
				showIcon class="mb-m pointer" text="暂无数据, 统计相关功能需开通 uni 统计后才能使用, 如未开通, 点击查看具体流程"
				@click="navTo('https://uniapp.dcloud.io/uni-stat-v2.html')" />
			<view class="uni-stat--x mb-m">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<!-- <uni-stat-panel :items="panelData" :contrast="true" /> -->
			<view class="uni-stat--x p-m">
				<view class="uni-stat-card-header">设备概览</view>
				<uni-table :loading="loading" border stripe emptyText="暂无数据">
					<uni-tr>
						<!-- <uni-th align="center">操作</uni-th> -->
						<template v-for="(mapper, index) in deviceTableFields">
							<uni-th v-if="mapper.title" :key="index" align="center">
								{{mapper.title}}
							</uni-th>
						</template>
					</uni-tr>
					<uni-tr v-for="(item ,i) in deviceTableData" :key="i">
						<template v-for="(mapper, index) in deviceTableFields">
							<uni-td v-if="mapper.field === 'appid'" align="center">
								<view v-if="item.appid" @click="navTo('/pages/uni-stat/device/overview/overview', item.appid)"
									class="link-btn-color">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</view>
								<view v-else @click="navTo('/pages/system/app/add')" class="link-btn-color">
									需添加此应用的 appid
								</view>
							</uni-td>
							<uni-td v-else :key="index" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</template>
					</uni-tr>
				</uni-table>
			</view>
			<view class="uni-stat--x p-m">
				<view class="uni-stat-card-header">注册用户概览</view>
				<uni-table :loading="loading" border stripe emptyText="暂无数据">
					<uni-tr>
						<template v-for="(mapper, index) in userTableFields">
							<uni-th v-if="mapper.title" :key="index" align="center">
								{{mapper.title}}
							</uni-th>
						</template>
					</uni-tr>
					<uni-tr v-for="(item ,i) in userTableData" :key="i">
						<template v-for="(mapper, index) in userTableFields">
							<uni-td v-if="mapper.field === 'appid'" align="center">
								<view v-if="item.appid" @click="navTo('/pages/uni-stat/user/overview/overview', item.appid)"
									class="link-btn-color">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</view>
								<view v-else @click="navTo('/pages/system/app/add')" class="link-btn-color">
									需添加此应用的 appid
								</view>
							</uni-td>
							<uni-td v-else :key="index" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</template>
					</uni-tr>
				</uni-table>
			</view>
			<!-- <view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="tableData.length" />
			</view> -->
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

	import {
		deviceFeildsMap,
		userFeildsMap
	} from './fieldsMap.js'

	export default {
		data() {
			return {
				query: {
					platform_id: '',
					start_time: [getTimeOfSomeDayAgo(1), new Date().getTime()]
				},
				deviceTableData: [],
				userTableData: [],
				// panelData: panelOption,
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				// fieldsMap,
			}
		},
		onReady() {
			this.getApps(this.queryStr, deviceFeildsMap, 'device')
			this.getApps(this.queryStr, userFeildsMap, 'user')
		},
		watch: {
			query: {
				deep: true,
				handler(newVal) {
					this.getApps(this.queryStr, deviceFeildsMap, 'device')
					this.getApps(this.queryStr, userFeildsMap, 'user')
				}
			}
		},
		computed: {
			queryStr() {
				const defQuery = `(dimension == "hour" || dimension == "day")`
				return stringifyQuery(this.query) + ' && ' + defQuery
			},

			deviceTableFields() {
				return this.tableFieldsMap(deviceFeildsMap)
			},
			userTableFields() {
				return this.tableFieldsMap(userFeildsMap)
			}
		},
		methods: {
			tableFieldsMap(fieldsMap) {
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
			},

			getApps(query, fieldsMap, type = "device") {
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
					.orderBy(`appid`, 'desc')
					.get()
					.then((res) => {
						let {
							data
						} = res.result
						this[`${type}TableData`] = []
						if (!data.length) return
						let appids = [],
							todays = [],
							yesterdays = [],
							isToday = parseDateTime(getTimeOfSomeDayAgo(0), '', ''),
							isYesterday = parseDateTime(getTimeOfSomeDayAgo(1), '', '')
						for (const item of data) {
							const {
								appid,
								name
							} = item.appid && item.appid[0] || {}
							item.appid = appid
							item.name = name

							if (appids.indexOf(item.appid) < 0) {
								appids.push(item.appid)
							}
							if (item.dimension === 'hour' && item.stat_date === isToday) {
								todays.push(item)
							}
							if (item.dimension === 'day' && item.stat_date === isYesterday) {
								yesterdays.push(item)
							}
						}
						const keys = fieldsMap.map(f => f.field).filter(Boolean)
						for (const appid of appids) {
							const rowData = {}
							const t = todays.find(item => item.appid === appid)
							const y = yesterdays.find(item => item.appid === appid)
							for (const key of keys) {
								if (key === 'appid' || key === 'name') {
									rowData[key] = t && t[key]
								} else {
									const value = t && t[key]
									const contrast = y && y[key]
									rowData[key + '_value'] = format(value)
									rowData[key + '_contrast'] = format(contrast)
								}
							}
							this[`${type}TableData`].push(rowData)

							if (appid) {
								// total_users 不准确，置空后由 getFieldTotal 处理, appid 不存在时暂不处理
								t[`total_${type}s`] = 0
								const query = JSON.parse(JSON.stringify(this.query))
								query.start_time = [getTimeOfSomeDayAgo(0), new Date().getTime()]
								query.appid = appid
								getFieldTotal.call(this, query, `total_${type}s`).then(total => {
									this[`${type}TableData`].find(item => item.appid === appid)[
										`total_${type}s_value`] = total
								})
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
	.uni-stat-card-header {
		display: flex;
		justify-content: space-between;
		color: #555;
		font-size: 14px;
		font-weight: 600;
		padding: 10px 0;
		margin-bottom: 15px;
	}

	.link-btn-color {
		color: #007AFF;
		cursor: pointer;
	}
</style>
