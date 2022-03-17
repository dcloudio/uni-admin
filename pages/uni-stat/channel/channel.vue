<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">渠道（app）</view>
				<view class="uni-sub-title">
					<uni-link href="https://ask.dcloud.net.cn/article/35974"
						text="支持Android App多渠道统计。设置App渠道包的方法，请参考 https://ask.dcloud.net.cn/article/35974。"></uni-link>
				</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" />
				<uni-stat-select mode="version" label="版本选择" v-model="query.version_id" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform-channel" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
				<qiun-data-charts type="area" :echartsApp="true" :chartData="chartData"
					:opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}" />
			</view>

			<view class="uni-stat--x p-m">
				<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
					<uni-tr>
						<template v-for="(mapper, index) in fieldsMap.slice(0, fieldsMap.length-1)">
							<uni-th v-if="mapper.title" :key="index" align="center">
								{{mapper.title}}
							</uni-th>
						</template>
					</uni-tr>
					<uni-tr v-for="(item ,i) in tableData" :key="i">
						<template v-for="(mapper, index) in fieldsMap.slice(0, fieldsMap.length-1)">
							<uni-td v-if="mapper.title && index === 1" :key="mapper.title" class="uni-stat-edit--x">
								{{item[mapper.field] ? item[mapper.field] : '-'}}
								<uni-icons type="compose" color="#2979ff" size="25" class="uni-stat-edit--btn"
									@click="inputDialogToggle(item.channel_code, item.channel_name)" />
							</uni-td>
							<uni-td v-else="mapper.title" :key="mapper.title" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</template>
					</uni-tr>
				</uni-table>
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
		<uni-popup ref="inputDialog" type="dialog" :maskClick="true">
			<uni-popup-dialog ref="inputClose" mode="input" title="请编辑名称" v-model="updateValue" placeholder="请输入内容"
				@confirm="editName"></uni-popup-dialog>
		</uni-popup>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		mapfields,
		stringifyQuery,
		stringifyField,
		stringifyGroupField,
		maxDeltaDay,
		getTimeOfSomeDayAgo,
		division,
		format,
		formatDate
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					dimension: "day",
					appid: "__UNI__HelloUniApp",
					platform_id: '',
					version_id: '',
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
				days: 0,
				tableData: [],
				panelData: [],
				chartData: {},
				queryId: '',
				updateValue: ''
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
					const {
						field: _id,
						title: name
					} = item
					const isTab = item.hasOwnProperty('value')
					if (_id && name && isTab) {
						tabs.push({
							_id,
							name
						})
					}
				})
				return tabs
			},
			queryStr() {
				let defaultQuery = ''
				if (!this.query.platform_id) {
					const nativePlatform = [
						"6221e59b428244000187a11d",
						"6221e59b428244000187a11e"
					]
					defaultQuery = nativePlatform.map(p => `platform_id == "${p}"`).join(' || ')
					defaultQuery = `(${defaultQuery})`
				}
				const query = JSON.parse(JSON.stringify(this.query))
				const days = this.days
				if (days < 2) {
					const date = getTimeOfSomeDayAgo(days)
					const day = 24 * 60 * 60 * 1000
					const start = date
					const end = date + day - 1
					query.start_time = [start, end]
					query.dimension = 'hour'
				}
				return stringifyQuery(this.query, true) + ' && ' + defaultQuery
			},
			dimension() {
				if (maxDeltaDay(this.query.start_time, 1)) {
					return 'hour'
				} else {
					return 'day'
				}
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.getAllData(this.queryStr)
				}
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				this.days = id
				console.log(111111111, this.days);
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData(this.queryStr)
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTableData(this.queryStr)
			},

			changeChartTab(id, index, name) {
				this.getChartData(this.queryStr, id, name)
			},

			getAllData(query) {
				this.getPanelData(query)
				this.getChartData(query)
				this.getTableData(query)
			},

			getChartData(query, field = 'new_user_count') {
				this.chartData = {}
				const {
					pageCurrent
				} = this.options
				console.log('..............Chart query：', query);
				console.log('..............Chart stringifyGroupField(fieldsMap, field)：', stringifyGroupField(fieldsMap,
					field));
				const db = uniCloud.database()
				db.collection('opendb-stat-result')
					.where(query)
					.field(`${stringifyField(fieldsMap, field)}, start_time, channel_id`)
					.groupBy('channel_id,start_time')
					.groupField(stringifyGroupField(fieldsMap, field))
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
								name: '暂无数据',
								data: []
							}]
						}
						const xAxis = options.categories
						if (this.dimension === 'hour') {
							for (let i = 0; i < 24; ++i) {
								const hour = i < 10 ? '0' + i : i
								const x = `${hour}:00 ~ ${hour}:59`
								xAxis.push(x)
							}
						}
						const hasChannels = []
						data.forEach(item => {
							if (hasChannels.indexOf(item.channel_id) < 0) {
								hasChannels.push(item.channel_id)
							}
						})
						let allChannels = []
						this.getChannels().then(res => {
							allChannels = res.result.data
						}).finally(() => {
							hasChannels.forEach((channel, index) => {
								const c = allChannels.find(item => item._id === channel)
								const line = options.series[index] = {
									name: c && c.channel_code || '未知',
									data: []
								}
								for (let i = 0; i < 24; ++i) {
									line.data[i] = 0
								}

								for (const item of data) {
									let date = item.start_time
									const x = formatDate(date, this.dimension)
									const y = item[field]
									const dateIndex = xAxis.indexOf(x)
									if (channel === item.channel_id) {
										if (dateIndex < 0) {
											xAxis.push(x)
											line.data.push(y)
										} else {
											line.data[dateIndex] = y
										}
									}

								}
							})
							this.chartData = options
						})
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getChannels() {
				const db = uniCloud.database()
				return db.collection('opendb-app-channels')
					.get()
			},

			getTableData(query) {
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-result')
					.where(query)
					.groupBy('appid, channel_id')
					.groupField(
						'sum(new_user_count) as total_new_user_count, sum(active_user_count) as total_active_user_count, sum(page_visit_count) as total_page_visit_count, sum(app_launch_count) as total_app_launch_count, avg(avg_session_time) as total_avg_session_time, avg(avg_user_time) as total_avg_user_time, avg(bounce_rate) as total_bounce_rate'
					)
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
						console.log('.......table:', data);

						this.getChannels().then(res => {
							const channels = res.result.data
							for (const item of data) {
								channels.forEach(channel => {
									if (item.channel_id === channel._id) {
										item.channel_code = channel.channel_code
										item.channel_name = channel.channel_name
									}
								})
							}
						}).finally(() => {
							for (const item of data) {
								mapfields(fieldsMap, item, item, 'total_')
							}
							this.tableData = []
							this.options.total = count
							this.tableData = data
						})

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			createStr(maps, fn, prefix = 'total_') {
				const strArr = []
				maps.forEach(mapper => {
					if (field.hasOwnProperty('value')) {
						const fieldName = mapper.field
						strArr.push(`${fn}(${fieldName}) as ${prefix + fieldName}`)
					}
				})
				return strArr.join()
			},

			getPanelData(query) {
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-result')
					.where(query)
					.groupBy('appid')
					.groupField(
						'sum(new_user_count) as total_new_user_count, sum(active_user_count) as total_active_user_count, sum(page_visit_count) as total_page_visit_count, sum(app_launch_count) as total_app_launch_count, avg(avg_session_time) as total_avg_session_time, avg(avg_user_time) as total_avg_user_time, avg(bounce_rate) as total_bounce_rate, max(total_users) as total_total_users'
					)
					.orderBy('start_time', 'desc')
					.get({
						getCount: true
					})
					.then(res => {
						const items = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, items, undefined, 'total_')
					})
			},

			inputDialogToggle(queryId, updateValue) {
				this.queryId = queryId
				this.updateValue = updateValue
				this.$refs.inputDialog.open()
			},

			editName(value) {
				// 使用 clientDB 提交数据
				const db = uniCloud.database()
				db.collection('opendb-app-channels')
					.where({
						channel_code: this.queryId
					})
					.update({
						channel_name: value
					})
					.then((res) => {
						uni.showToast({
							title: '修改成功'
						})
						this.getTableData(this.queryStr)
					}).catch((err) => {
						uni.showModal({
							content: err.message || '请求服务失败',
							showCancel: false
						})
					}).finally(() => {
						uni.hideLoading()
					})
			}

		}

	}
</script>

<style>
	.uni-stat-panel {
		box-shadow: unset;
		border-bottom: 1px solid #eee;
		padding: 0;
		margin: 0 15px;
	}

	.uni-stat-edit--x {
		display: flex;
		justify-content: space-between;
	}

	.uni-stat-edit--btn {
		cursor: pointer;
	}
</style>
