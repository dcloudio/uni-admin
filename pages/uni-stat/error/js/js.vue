<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group hide-on-phone">
				<!-- <view class="uni-title">错误分析</view> -->
				<view class="uni-sub-title">开发者可以在这里快速查询应用最近出现的具体错误内容，了解错误概况信息，以便快速修复问题</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc"
					:defItem="1" label="应用选择" v-model="query.appid" :clear="false" />
				<uni-data-select collection="opendb-app-versions" :where="versionQuery"
					field="_id as value, version as text" orderby="text asc" label="版本选择" v-model="query.version_id" />
				<view class="flex">
					<uni-stat-tabs label="日期选择" :current="currentDateTab" :yesterday="false" mode="date"
						@change="changeTimeRange" />
					<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.start_time"
						returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
						:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
						@change="useDatetimePicker" />
				</view>
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id"
					@change="changePlatform" />
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" />
				<view class="uni-charts-box">
					<qiun-data-charts type="area" :chartData="chartData" :eopts="{notMerge:true}" echartsH5 echartsApp
						tooltipFormat="tooltipCustom" />
				</view>
			</view>

			<view class="uni-stat--x p-m">
				<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')" style="overflow-y: scroll;">
					<uni-tr>
						<template v-for="(mapper, index) in fieldsMap">
							<uni-th v-if="mapper.title" :key="index" align="center">
								<!-- #ifdef MP -->
								{{mapper.title}}
								<!-- #endif -->
								<!-- #ifndef MP -->
								<uni-tooltip>
									{{mapper.title}}
									<uni-icons v-if="mapper.tooltip" type="help" color="#666" />
									<template v-if="mapper.tooltip" v-slot:content>
										<view class="uni-stat-tooltip-s">
											{{mapper.tooltip}}
										</view>
									</template>
								</uni-tooltip>
								<!-- #endif -->
							</uni-th>
						</template>
					</uni-tr>
					<uni-tr v-for="(item ,i) in tableData" :key="i">
						<template v-for="(mapper, index) in fieldsMap">
							<uni-td v-if="mapper.field === 'count'" :key="'key1'+i+index" align="center">
								<text class="link-btn" @click="navTo('detail', item)">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</text>
							</uni-td>
							<uni-td v-else :key="'key2'+i+index" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</template>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon show-page-size :page-size="options.pageSize"
						:current="options.pageCurrent" :total="options.total" @change="changePageCurrent"
						@pageSizeChange="changePageSize" />
				</view>
			</view>
		</view>

		<uni-popup ref="errMsg" type="center" :animation="false" :maskClick="true">
			<view class="modal black-theme">
				<view class="modal-header">
					错误详情
				</view>
				<scroll-view scroll-x="true" scroll-y="true">
					<view class="modal-content" style="padding: 20px 30px;">
						<view v-if="msgLoading" style="margin: 150px 0;height: 90%;text-align: center;font-size: 14px;">
							<uni-load-more class="mb-m" :showText="false" status="loading" />
							<view>正在解析，请稍等...</view>
						</view>
						<pre>{{errMsg}}</pre>
					</view>
				</scroll-view>
			</view>
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
		getTimeOfSomeDayAgo,
		division,
		format,
		formatDate,
		parseDateTime,
		debounce,
		getAllDateCN
	} from '@/js_sdk/uni-stat/util.js'
	import {
		fieldsMap,
		popupFieldsMap
	} from './fieldsMap.js'

	const panelOption = [{
		title: '错误总数',
		value: 0,
		tooltip: '指应用在某个时间段内出现错误的总数'
	}, {
		title: '错误率',
		value: 0,
		tooltip: '时间范围内的总错误数/应用启动次数，如果小于0.01%，默认显示为0'
	}]

	export default {
		data() {
			return {
				fieldsMap,
				popupFieldsMap,
				query: {
					// type: "js",
					dimension: "day",
					appid: "",
					platform_id: '',
					uni_platform: '',
					version_id: '',
					start_time: [],
				},
				options: {
					pageSize: 20,
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
				},
				loading: false,
				popupLoading: false,
				currentDateTab: 0,
				// currentChartTab: ,
				tableData: [],
				popupTableData: [],
				panelData: JSON.parse(JSON.stringify(panelOption)),
				chartData: {},
				chartTab: 'errorCount',
				chartTabs: [{
					_id: 'errorCount',
					name: '错误次数'
				}, {
					_id: 'errorRate',
					name: '错误率'
				}],
				errMsg: '',
				msgLoading: false
			}
		},
		computed: {
			queryStr() {
				return stringifyQuery(this.query)
			},
			versionQuery() {
				const {
					appid,
					uni_platform
				} = this.query
				const query = stringifyQuery({
					appid,
					uni_platform,
					type: 'native_app'
				})
				return query
			}
		},
		created() {
			this.parsedErrors = {}
			this.debounceGet = debounce(() => this.getAllData(this.queryStr))
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.debounceGet()
				}
			},
			chartTab(val) {
				this.getChartData(this.queryStr)
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changePlatform(id, index, name, item) {
				this.query.version_id = 0
				this.query.uni_platform = item.code
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData(this.queryStr)
			},

			changePageSize(pageSize) {
				this.options.pageSize = pageSize
				this.options.pageCurrent = 1 // 重置分页
				this.getTableData(this.queryStr)
			},

			getAllData(query) {
				this.getChartData(query)
				this.getTableData(query)
			},

			getChartData(query, field = 'day_count') {
				let querystr = stringifyQuery(this.query, false, ['uni_platform'])
				this.chartData = {}
				const {
					pageCurrent
				} = this.options
				const db = uniCloud.database()
				const [start_time, end_tiem] = this.query.start_time
				const timeAll = getAllDateCN(new Date(start_time), new Date(end_tiem))
				db.collection('uni-stat-error-result')
					.where(querystr)
					.groupBy('start_time')
					.groupField('sum(count) as total_day_count')
					.orderBy('start_time', 'asc')
					.get({
						getCount: true
					})
					.then(async res => {
						const count = res.result.count
						const resData = res.result.data
						let data = []

						console.log(timeAll);
						console.log(resData);
						timeAll.forEach(v => {
							let item = resData.find(item => item.start_time === v)
							console.log(item);
							if (item) {
								data.push(item)
							} else {
								data.push({
									start_time: v,
									total_day_count: 0
								})
							}
						})

						console.log('----data', data);
						const options = {
							categories: [],
							series: [{
								name: '暂无数据',
								data: []
							}]
						}
						if (this.chartTab === 'errorCount') {
							const countLine = options.series[0] = {
								name: '错误次数',
								data: []
							}
							const xAxis = options.categories
							for (const item of data) {
								let date = item.start_time
								const x = formatDate(date, 'day')
								const countY = item[`total_${field}`]
								xAxis.push(x)
								countLine.data.push(countY)
							}
							this.chartData = options
						} else {
							let dayAppLaunchs = await this.getDayLaunch(querystr)
							console.log('++++', dayAppLaunchs);
							const rateLine = options.series[0] = {
								name: '错误率(%)',
								data: [],
								lineStyle: {
									color: '#EE6666',
									width: 1,
								},
								itemStyle: {
									borderWidth: 1,
									borderColor: '#EE6666',
									color: '#EE6666'
								},
								areaStyle: {
									color: {
										colorStops: [{
											offset: 0,
											color: '#EE6666', // 0% 处的颜色
										}, {
											offset: 1,
											color: '#FFFFFF' // 100% 处的颜色
										}]
									}
								}
							}
							const xAxis = options.categories
							for (const item of data) {
								let date = item.start_time
								const x = formatDate(date, 'day')
								const countY = item[`total_${field}`]
								xAxis.push(x)
								if (dayAppLaunchs.length) {
									const day = dayAppLaunchs.find(day => day.start_time === item.start_time)
									const index = xAxis.indexOf(x)
									if (day) {
										let rateY = (countY * 100) / day.day_app_launch_count
										rateY = rateY.toFixed(2)
										rateLine.data[index] = rateY
									} else {
										rateLine.data[index] = 0
									}
								}
							}
							this.chartData = options
						}

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {})
			},

			getTotalCount(query) {
				const db = uniCloud.database()
				return db.collection('uni-stat-error-result')
					.where(query)
					.groupBy('appid')
					.groupField('sum(count) as total_count')
					.get()
			},

			getTotalLaunch(query) {
				const db = uniCloud.database()
				return db.collection('uni-stat-result')
					.where(query)
					.groupBy('appid')
					.groupField('sum(app_launch_count) as total_app_launch_count')
					.get()
			},

			/**
			 * 从结果表里获取范围时间内的启动次数
			 * @param {Object} query
			 */
			async getDayLaunch(query) {
				console.log(query);
				const db = uniCloud.database()
				const res = await db.collection('uni-stat-result')
					.where(query)
					.groupBy('start_time')
					.groupField('sum(app_launch_count) as day_app_launch_count')
					.orderBy('start_time', 'asc')
					.get()
				return res.result.data || []
			},

			getTableData(query = stringifyQuery(this.query)) {

				let querystr = stringifyQuery(this.query, false, ['uni_platform'])
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery({
					appid: this.query.appid
				})
				const mainTableTemp = db.collection('uni-stat-error-result').where(querystr).getTemp()
				const versions = db.collection('opendb-app-versions')
					.where(filterAppid)
					.orderBy('start_time ', 'desc ')
					.getTemp()

				const platforms = db.collection('uni-stat-app-platforms')
					.getTemp()

				db.collection(mainTableTemp, versions, platforms)
					.orderBy('last_time', 'desc')
					.skip((pageCurrent - 1) * this.options.pageSize)
					.limit(this.options.pageSize)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						const tempData = []
						this.panelData = JSON.parse(JSON.stringify(panelOption))
						for (const item of data) {
							item.last_time = parseDateTime(item.last_time, 'dateTime')
							item.msgTooltip = item.msg
							item.msg = item.msg.substring(0, 100) + '...'
							const v = item.version_id[0]
							const p = item.platform_id[0]
							item.version = v && v.version
							item.platform = p && p.name
							tempData.push(item)
						}
						this.getTotalCount(querystr).then(res => {
							const total = res.result.data[0]
							const total_count = total && total.total_count
							if (total_count) {
								tempData.forEach(item => item.total_count = Number(total_count))
								this.panelData[0].value = total_count
							}
							let launch_count = ''
							this.getTotalLaunch(querystr).then(res => {
								const total = res.result.data[0]
								launch_count = total && total.total_app_launch_count
								if (total_count && launch_count) {
									let errorRate = total_count / launch_count
									errorRate = (errorRate * 100).toFixed(2) + '%'
									this.panelData[1].value = errorRate
								}
							})

						}).finally(() => {
							this.tableData = []
							this.options.total = count
							tempData.forEach(item => mapfields(fieldsMap, item, item))
							this.tableData = tempData
						})

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			navTo(url, item) {
				if (url.indexOf('http') > -1) {
					window.open(url)
				} else {
					if (item) {
						url = `${url}?error_hash=${item.hash}&create_time=${item.start_time}`
					}
					uni.navigateTo({
						url
					})
				}
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
			openErrPopup(err) {
				if (this.msgLoading) return
				this.$refs.errMsg.open()
				if (!err) {
					this.errMsg = '暂无错误数据'
				}
				this.errMsg = ''
				const oldMsg = this.parsedErrors[err]
				if (!oldMsg || oldMsg === err) {
					this.msgLoading = true
					this.parseError(err)
				} else {
					this.errMsg = oldMsg
				}
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

	.uni-stat-tooltip-s {
		width: 160px;
		white-space: normal;
	}

	.black-theme {
		background-color: #333;
		color: #fff;
	}
</style>
