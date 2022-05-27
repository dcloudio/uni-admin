<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group hide-on-phone">
				<!-- <view class="uni-title">崩溃分析</view> -->
				<view class="uni-sub-title">开发者可以在这里快速查询原生应用最近出现的具体崩溃内容，了解崩溃概况信息，以便快速修复问题</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc"
					:defItem="1" label="应用选择" v-model="query.appid" :clear="false" />
				<uni-data-select collection="uni-stat-app-versions" :where="versionQuery"
					field="_id as value, version as text" orderby="text asc" label="版本选择" v-model="query.version_id" />
				<uni-stat-tabs label="平台选择" type="boldLine" :all="false" mode="platform-channel"
					v-model="query.platform_id" @change="changePlatform" />
				<view class="flex">
					<uni-stat-tabs label="日期选择" :current="currentDateTab" :yesterday="false" mode="date"
						@change="changeTimeRange" />
					<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.start_time"
						returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
						:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
						@change="useDatetimePicker" />
				</view>
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" />
				<view class="uni-charts-box">
					<qiun-data-charts type="area" :chartData="chartData" :eopts="{notMerge:true}" echartsH5
						echartsApp />
				</view>
			</view>

			<view class="uni-stat--x p-m">
				<view class="flex-between">
					<view class="uni-stat-card-header">信息列表</view>
					<view class="uni-group">
						<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData"
							:type="exportExcel.type" :name="exportExcel.filename">
							<button class="uni-button" type="primary" size="mini">导出 Excel</button>
						</download-excel>
					</view>
				</view>

				<unicloud-db ref="udb" :collection="collectionList"
					field="appid,version,platform,channel,sdk_version,device_id,device_net,device_os,device_os_version,device_vendor,device_model,device_is_root,device_os_name,device_batt_level,device_batt_temp,device_memory_use_size,device_memory_total_size,device_disk_use_size,device_disk_total_size,device_abis,app_count,app_use_memory_size,app_webview_count,app_use_duration,app_run_fore,package_name,package_version,page_url,error_msg,create_time"
					:where="where" page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
					:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
					:options="options" loadtime="manual" @load="onqueryload">
					<uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
						<uni-tr>
							<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'appid')"
								sortable @sort-change="sortChange($event, 'appid')">appid</uni-th>
							<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'version')"
								sortable @sort-change="sortChange($event, 'version')">version</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'platform')" sortable
								@sort-change="sortChange($event, 'platform')">platform</uni-th>
							<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'channel')"
								sortable @sort-change="sortChange($event, 'channel')">channel</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'sdk_version')" sortable
								@sort-change="sortChange($event, 'sdk_version')">sdk_version</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_id')" sortable
								@sort-change="sortChange($event, 'device_id')">device_id</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_net')" sortable
								@sort-change="sortChange($event, 'device_net')">device_net</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_os')" sortable
								@sort-change="sortChange($event, 'device_os')">device_os</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_os_version')" sortable
								@sort-change="sortChange($event, 'device_os_version')">device_os_version</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_vendor')" sortable
								@sort-change="sortChange($event, 'device_vendor')">device_vendor</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_model')" sortable
								@sort-change="sortChange($event, 'device_model')">device_model</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'device_is_root')" sortable
								@sort-change="sortChange($event, 'device_is_root')">device_is_root</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_os_name')" sortable
								@sort-change="sortChange($event, 'device_os_name')">device_os_name</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'device_batt_level')" sortable
								@sort-change="sortChange($event, 'device_batt_level')">device_batt_level</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_batt_temp')" sortable
								@sort-change="sortChange($event, 'device_batt_temp')">device_batt_temp</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'device_memory_use_size')" sortable
								@sort-change="sortChange($event, 'device_memory_use_size')">device_memory_use_size
							</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'device_memory_total_size')" sortable
								@sort-change="sortChange($event, 'device_memory_total_size')">device_memory_total_size
							</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'device_disk_use_size')" sortable
								@sort-change="sortChange($event, 'device_disk_use_size')">device_disk_use_size</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'device_disk_total_size')" sortable
								@sort-change="sortChange($event, 'device_disk_total_size')">device_disk_total_size
							</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'device_abis')" sortable
								@sort-change="sortChange($event, 'device_abis')">device_abis</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'app_count')" sortable
								@sort-change="sortChange($event, 'app_count')">app_count</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'app_use_memory_size')" sortable
								@sort-change="sortChange($event, 'app_use_memory_size')">app_use_memory_size</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'app_webview_count')" sortable
								@sort-change="sortChange($event, 'app_webview_count')">app_webview_count</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'app_use_duration')" sortable
								@sort-change="sortChange($event, 'app_use_duration')">app_use_duration</uni-th>
							<uni-th align="center" filter-type="range"
								@filter-change="filterChange($event, 'app_run_fore')" sortable
								@sort-change="sortChange($event, 'app_run_fore')">app_run_fore</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'package_name')" sortable
								@sort-change="sortChange($event, 'package_name')">package_name</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'package_version')" sortable
								@sort-change="sortChange($event, 'package_version')">package_version</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'page_url')" sortable
								@sort-change="sortChange($event, 'page_url')">page_url</uni-th>
							<uni-th align="center" filter-type="search"
								@filter-change="filterChange($event, 'error_msg')" sortable
								@sort-change="sortChange($event, 'error_msg')">error_msg</uni-th>
							<uni-th align="center" filter-type="timestamp"
								@filter-change="filterChange($event, 'create_time')" sortable
								@sort-change="sortChange($event, 'create_time')">create_time</uni-th>
						</uni-tr>
						<uni-tr v-for="(item,index) in data" :key="index">
							<uni-td align="center">{{item.appid}}</uni-td>
							<uni-td align="center">{{item.version}}</uni-td>
							<uni-td align="center">{{item.platform}}</uni-td>
							<uni-td align="center">{{item.channel}}</uni-td>
							<uni-td align="center">{{item.sdk_version}}</uni-td>
							<uni-td align="center">{{item.device_id}}</uni-td>
							<uni-td align="center">{{item.device_net}}</uni-td>
							<uni-td align="center">{{item.device_os}}</uni-td>
							<uni-td align="center">{{item.device_os_version}}</uni-td>
							<uni-td align="center">{{item.device_vendor}}</uni-td>
							<uni-td align="center">{{item.device_model}}</uni-td>
							<uni-td align="center">{{item.device_is_root}}</uni-td>
							<uni-td align="center">{{item.device_os_name}}</uni-td>
							<uni-td align="center">{{item.device_batt_level}}</uni-td>
							<uni-td align="center">{{item.device_batt_temp}}</uni-td>
							<uni-td align="center">{{item.device_memory_use_size}}</uni-td>
							<uni-td align="center">{{item.device_memory_total_size}}</uni-td>
							<uni-td align="center">{{item.device_disk_use_size}}</uni-td>
							<uni-td align="center">{{item.device_disk_total_size}}</uni-td>
							<uni-td align="center">{{item.device_abis}}</uni-td>
							<uni-td align="center">{{item.app_count}}</uni-td>
							<uni-td align="center">{{item.app_use_memory_size}}</uni-td>
							<uni-td align="center">{{item.app_webview_count}}</uni-td>
							<uni-td align="center">{{item.app_use_duration}}</uni-td>
							<uni-td align="center">{{item.app_run_fore}}</uni-td>
							<uni-td align="center">{{item.package_name}}</uni-td>
							<uni-td align="center">{{item.package_version}}</uni-td>
							<uni-td align="center">{{item.page_url}}</uni-td>
							<uni-td align="center">{{item.error_msg}}</uni-td>
							<uni-td align="center">
								<uni-dateformat :threshold="[0, 0]" :date="item.create_time"></uni-dateformat>
							</uni-td>
						</uni-tr>
					</uni-table>
					<view class="uni-pagination-box">
						<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current"
							:total="pagination.count" @change="onPageChanged" />
					</view>
				</unicloud-db>
			</view>
		</view>

		<uni-popup ref="popupTable" type="center" :maskClick="true">
			<view class="modal">
				<view class="modal-header">
					崩溃设备信息
				</view>
				<scroll-view scroll-y="true">
					<view class="modal-content">
						<view class="uni-form-item-tips">
							注：仅展示最近10条
						</view>
						<uni-stat-table :data="popupTableData" :filedsMap="popupFieldsMap" :loading="popupLoading" />
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
		debounce
	} from '@/js_sdk/uni-stat/util.js'
	import {
		fieldsMap,
		popupFieldsMap
	} from './fieldsMap.js'

	const panelOption = [{
		title: '崩溃总数',
		field: 'count',
		value: 0,
		formatter: ',',
		tooltip: '指原生应用在某个时间段内出现崩溃的总数'
	}, {
		title: '崩溃率',
		field: 'count/app_launch_count',
		computed: 'count/app_launch_count',
		formatter: '%',
		value: 0,
		tooltip: '时间范围内的总崩溃数/原生应用启动次数，如果小于0.01%，默认显示为0'
	}]

	import {
		enumConverter,
		filterToWhere
	} from '@/js_sdk/validator/uni-stat-app-crash-logs.js';

	const db = uniCloud.database()
	// 表查询配置
	const dbOrderBy = '' // 排序字段
	const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
	// 分页配置
	const pageSize = 20
	const pageCurrent = 1

	const orderByMapping = {
		"ascending": "asc",
		"descending": "desc"
	}

	export default {
		data() {
			return {
				fieldsMap,
				popupFieldsMap,
				query: {
					type: "crash",
					dimension: "day",
					appid: "",
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
					name: '崩溃次数'
				}, {
					_id: 'errorRate',
					name: '崩溃率'
				}],

				collectionList: "uni-stat-app-crash-logs",
				schemaQuery: '',
				where: '',
				orderby: dbOrderBy,
				orderByFieldName: "",
				selectedIndexs: [],
				options: {
					pageSize,
					pageCurrent,
					filterData: {},
					...enumConverter
				},
				exportExcel: {
					"filename": "uni-stat-app-crash-logs.xls",
					"type": "xls",
					"fields": {
						"appid": "appid",
						"version": "version",
						"platform": "platform",
						"channel": "channel",
						"sdk_version": "sdk_version",
						"device_id": "device_id",
						"device_net": "device_net",
						"device_os": "device_os",
						"device_os_version": "device_os_version",
						"device_vendor": "device_vendor",
						"device_model": "device_model",
						"device_is_root": "device_is_root",
						"device_os_name": "device_os_name",
						"device_batt_level": "device_batt_level",
						"device_batt_temp": "device_batt_temp",
						"device_memory_use_size": "device_memory_use_size",
						"device_memory_total_size": "device_memory_total_size",
						"device_disk_use_size": "device_disk_use_size",
						"device_disk_total_size": "device_disk_total_size",
						"device_abis": "device_abis",
						"app_count": "app_count",
						"app_use_memory_size": "app_use_memory_size",
						"app_webview_count": "app_webview_count",
						"app_use_duration": "app_use_duration",
						"app_run_fore": "app_run_fore",
						"package_name": "package_name",
						"package_version": "package_version",
						"page_url": "page_url",
						"error_msg": "error_msg",
						"create_time": "create_time"
					}
				},
				exportExcelData: []
			}
		},
		computed: {
			// pageSize() {
			// 	const {
			// 		pageSizeRange,
			// 		pageSizeIndex
			// 	} = this.options
			// 	return pageSizeRange[pageSizeIndex]
			// },
			queryStr() {
				return stringifyQuery(this.query)
				// return 'appid == "__UNI__0609BAF"'
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
					const {
						appid,
						start_time
					} = this.query
					const tableQuery = stringifyQuery({
						appid,
						create_time: start_time
					})
					console.log('..........tableQuery', tableQuery);
					this.where = tableQuery
				}
			},
			chartTab(val) {
				this.getChartData(this.queryStr)
			}
		},
		onLoad() {
			this._filter = {}
		},
		onReady() {
			this.$refs.udb.loadData()
		},
		methods: {
			onqueryload(data) {
				this.exportExcelData = data
			},
			getWhere() {
				const query = this.schemaQuery.trim()
				if (!query) {
					return ''
				}
				const queryRe = new RegExp(query, 'i')
				return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
			},
			loadData(clear = true) {
				this.$refs.udb.loadData({
					clear
				})
			},
			onPageChanged(e) {
				this.selectedIndexs.length = 0
				this.$refs.table.clearSelection()
				this.$refs.udb.loadData({
					current: e.current
				})
			},
			sortChange(e, name) {
				this.orderByFieldName = name;
				if (e.order) {
					this.orderby = name + ' ' + orderByMapping[e.order]
				} else {
					this.orderby = ''
				}
				this.$refs.table.clearSelection()
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			},
			filterChange(e, name) {
				this._filter[name] = {
					type: e.filterType,
					value: e.filter
				}
				let newWhere = filterToWhere(this._filter, db.command)
				if (Object.keys(newWhere).length) {
					this.where = newWhere
				} else {
					this.where = stringifyQuery({
						appid,
						create_time: start_time
					})
				}
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			},
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changePlatform() {
				this.query.version_id = 0
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},
			// changePageCurrent(e) {
			// 	this.options.pageCurrent = e.current
			// 	this.getTableData(this.queryStr)
			// },

			// changePageSize(e) {
			// 	const {
			// 		value
			// 	} = e.detail
			// 	this.options.pageCurrent = 1 // 重置分页
			// 	this.options.pageSizeIndex = value
			// 	this.getTableData(this.queryStr)
			// },

			getAllData(query) {
				this.getPanelData(query)
				this.getChartData(query)
				// this.getTableData(query)
			},

			getPanelData(query) {
				const db = uniCloud.database()
				db.collection('uni-stat-error-result')
					.where(query)
					.field('count as temp_count, app_launch_count as temp_app_launch_count, appid')
					.groupBy('appid')
					.groupField('sum(temp_count) as count, sum(temp_app_launch_count) as app_launch_count')
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						const item = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(panelOption, item)
					})
			},

			getChartData(query, field = 'day_count') {
				this.chartData = {}
				const {
					pageCurrent
				} = this.options
				const db = uniCloud.database()
				db.collection('uni-stat-error-result')
					.where(query)
					.field('count as temp_count, app_launch_count as temp_app_launch_count, start_time')
					.groupBy('start_time')
					.groupField('sum(temp_count) as count, sum(temp_app_launch_count) as app_launch_count')
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
						if (this.chartTab === 'errorCount') {
							const countLine = options.series[0] = {
								name: '崩溃次数',
								data: []
							}
							const xAxis = options.categories
							for (const item of data) {
								let date = item.start_time
								const x = formatDate(date, 'day')
								const countY = item.count
								xAxis.push(x)
								countLine.data.push(countY)
							}
							this.chartData = options
						} else {
							const rateLine = options.series[0] = {
								name: '崩溃率',
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
								const {
									count,
									app_launch_count
								} = item
								let date = item.start_time
								const x = formatDate(date, 'day')
								xAxis.push(x)
								let y = count / app_launch_count
								y = y.toFixed(2)
								rateLine.data.push(y)
							}
							this.chartData = options
						}
					}).finally(() => {})
			}
		}

	}
</script>

<style>
	.flex-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

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
</style>
