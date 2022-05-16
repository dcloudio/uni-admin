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
				<view class="flex">
<!-- 					<uni-stat-tabs label="日期选择" :current="currentDateTab" :yesterday="false" mode="date"
						@change="changeTimeRange" /> -->
					<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.create_time"
						returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
						:class="{'uni-stat__actived': currentDateTab < 0 && !!query.create_time.length}"
						@change="useDatetimePicker" />
				</view>
			</view>
			<view class="uni-stat--x">
				<!-- <uni-stat-tabs label="平台选择" type="boldLine" :all="false" mode="platform-channel" v-model="query.platform" /> -->
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
							<uni-td v-if="mapper.field === 'error_msg'" :key="mapper.title" align="left">
								<!-- #ifdef MP -->
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								<!-- #endif -->
								<!-- #ifndef MP -->
								<uni-tooltip>
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
									<uni-icons v-if="item.msgTooltip" type="help" color="#666" />
									<template v-if="item.msgTooltip" v-slot:content>
										<view class="uni-stat-tooltip-l">
											{{item.msgTooltip}}
										</view>
									</template>
								</uni-tooltip>
								<!-- #endif -->
							</uni-td>
							<uni-td v-else-if="mapper.field === 'count'" :key="mapper.title" align="center">
								<text class="link-btn" @click="togglePopup(item)">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</text>
							</uni-td>
							<uni-td v-else :key="mapper.title" align="center">
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
					appid: "",
					platform: '',
					version: '',
					create_time: [],
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
				tableData: [],
				networks: [
					"状态未知",
					"未连接",
					"有线",
					"WIFI",
					"2G",
					"3G",
					"4G",
					"5G"
				],

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
			queryStr() {
				let query = JSON.parse(JSON.stringify(this.query))
				let platform = query.platform
				const nativePlatform = uni.getStorageSync('platform_channel_last_data')
				platform && ( query.platform = nativePlatform.find(p => p._id === platform).code)
				return stringifyQuery(query)
			},
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
			},
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					// end = getTimeOfSomeDayAgo(0) - 1
					end = new Date().getTime()
				this.query.create_time = [start, end]
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

			getAllData(query) {
				this.getTableData(query)
			},

			getTableData(query = this.queryStr) {
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				db.collection('uni-stat-app-crash-logs')
					.where(query)
					.orderBy('create_time', 'desc')
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
						const tempData = []
						for (const item of data) {
							item.create_time = parseDateTime(item.create_time, 'dateTime')
							item.device_net = this.networks[Number(item.device_net)]
							item.use_memery_size = this.$formatBytes(item.use_memery_size)
							item.msgTooltip = item.error_msg
							item.error_msg = item.error_msg.substring(0, 100) + '...'
							tempData.push(item)
						}

						this.tableData = []
						this.options.total = count
						tempData.forEach(item => mapfields(fieldsMap, item, item))
						this.tableData = tempData

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getPopupTableData(hash) {
				this.popupTableData = []
				this.popupLoading = true
				const db = uniCloud.database()
				db.collection('uni-stat-error-logs')
					.where(`error_hash == "${hash}"`)
					.orderBy('create_time', 'desc')
					.limit(10)
					.get()
					.then(res => {
						const data = res.result.data
						for (const item of data) {
							item.create_time = parseDateTime(item.create_time, 'dateTime')
						}
						this.popupTableData = data
					})
					.finally(() => {
						this.popupLoading = false
					})
			},

			togglePopup(item) {
				this.getPopupTableData(item.hash)
				this.$refs.popupTable.open()
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

	.uni-stat-tooltip-l {
		width: 600px;
		white-space: normal;
	}
</style>
