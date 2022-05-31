<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<!-- <view class="uni-title">渠道（app）</view> -->
				<view class="uni-sub-title hide-on-phone">
					<uni-link href="https://ask.dcloud.net.cn/article/35974"
						text="支持Android App多渠道统计。设置App渠道包的方法，请参考 https://ask.dcloud.net.cn/article/35974。"></uni-link>
				</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc"
					:defItem="1" label="应用选择" v-model="query.appid" :clear="false" />
				<uni-data-select collection="uni-stat-app-versions" :storage="false" :where="versionQuery"
					field="_id as value, version as text" orderby="text asc" label="版本选择" v-model="query.version_id" />
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform-channel" :all="false"
					v-model="query.platform_id" @change="changePlatform" />
				<view class="flex">
					<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
					<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.start_time"
						returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
						:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
						@change="useDatetimePicker" />
				</view>
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" @change="changeChartTab" />
				<view class="uni-charts-box">
					<qiun-data-charts type="area" :chartData="chartData" echartsH5 echartsApp />
				</view>
			</view>

			<view class="uni-stat--x p-m">
				<view class="mb-m">
					<uni-link color="" href="https://ask.dcloud.net.cn/article/35974" text="如何自定义渠道包?"></uni-link>
				</view>
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
		formatDate,
		getFieldTotal,
		debounce
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
				currentDateTab: 1,
				days: 0,
				tableData: [],
				panelData: fieldsMap.filter(f => f.hasOwnProperty('value')),
				chartData: {},
				chartTab: 'new_device_count',
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
				return stringifyQuery(this.query, true)
			},
			dimension() {
				if (maxDeltaDay(this.query.start_time, 1)) {
					return 'hour'
				} else {
					return 'day'
				}
			},
			versionQuery() {
				const {
					appid,
					platform_id
				} = this.query
				const query = stringifyQuery({
					appid,
					platform_id
				})
				return query
			}
		},
		created() {
			this.debounceGet = debounce(() => this.getAllData(this.queryStr))
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.debounceGet()
				}
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changePlatform() {
				this.query.version_id = 0
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const day = 24 * 60 * 60 * 1000
				let start, end
				start = getTimeOfSomeDayAgo(id)
				if (!id) {
					end = getTimeOfSomeDayAgo(0) + day - 1
				} else {
					end = getTimeOfSomeDayAgo(0) - 1
				}
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

			getChartData(query, field = this.chartTab) {
				this.chartData = {}
				const {
					pageCurrent
				} = this.options
				const db = uniCloud.database()
				db.collection('uni-stat-result')
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
									name: c && c.channel_name || '未知',
									data: []
								}
								if (this.dimension === 'hour') {
									for (let i = 0; i < 24; ++i) {
										line.data[i] = 0
									}
								}
								let mapper = fieldsMap.filter(f => f.field === field)
								mapper = JSON.parse(JSON.stringify(mapper))
								delete mapper[0].value
								mapper[0].formatter = ''
								for (const item of data) {
									mapfields(mapper, item, item)
									let date = item.start_time
									const x = formatDate(date, this.dimension)
									let y = item[field]
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
					}).finally(() => {})
			},

			getChannels() {
				const db = uniCloud.database()
				return db.collection('uni-stat-app-channels')
					.get()
			},

			getTableData(query) {
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				db.collection('uni-stat-result')
					.where(query)
					.field(`${stringifyField(fieldsMap)},appid, channel_id`)
					.groupBy('appid, channel_id')
					.groupField(stringifyGroupField(fieldsMap))
					.orderBy('new_device_count', 'desc')
					.skip((pageCurrent - 1) * this.pageSize)
					.limit(this.pageSize)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result

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

			getPanelData() {
				let cloneQuery = JSON.parse(JSON.stringify(this.query))
				cloneQuery.dimension = 'day'
				let query = stringifyQuery(cloneQuery)
				const db = uniCloud.database()
				const subTable = db.collection('uni-stat-result')
					.where(query)
					.field(stringifyField(fieldsMap))
					.groupBy('appid')
					.groupField(stringifyGroupField(fieldsMap))
					.orderBy('start_time', 'desc')
					.get()
					.then(res => {
						const item = res.result.data[0]
						item && (item.total_devices = 0)
						getFieldTotal.call(this, query)
						this.panelData = []
						this.panelData = mapfields(fieldsMap, item)
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
				db.collection('uni-stat-app-channels')
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
