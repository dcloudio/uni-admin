<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">入口页</view>
				<view class="uni-sub-title">入口页数据分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" />
				<uni-stat-select mode="channel" label="渠道选择" v-model="query.channel_id" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<uni-stat-panel :items="panelData" />
			<view class="uni-stat--x p-m">
				<uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" />
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
		format
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
					channel_id: '',
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
				tableData: [],
				panelData: []
			}
		},
		computed: {
			pageSize() {
				const {
					pageSizeRange,
					pageSizeIndex
				} = this.options
				return pageSizeRange[pageSizeIndex]
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					const query = stringifyQuery(val)
					this.getAllData(query)
				}
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData()
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTableData()
			},

			getAllData(query) {
				this.getPanelData(query)
				this.getTableData(query)
			},

			getTableData(query = stringifyQuery(this.query)) {
				const {
					pageCurrent
				} = this.options
				console.log('..............query：', query);
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery({
					appid: this.query.appid
				})
				const mainTableTemp = db.collection('opendb-stat-app-pages').where(filterAppid).getTemp()
				const subTableTemp = db.collection('opendb-stat-app-page-result')
					.where(query)
					.orderBy('start_time ', 'desc ')
					.getTemp()

				db.collection(mainTableTemp, subTableTemp)
					.field(
						'title, url, _id1{"opendb-stat-app-page-result"{access_times,access_users,access_time,share_count,entry_users,entry_count,entry_access_time,dimension,stat_date,bounce_rate}}'
					)
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
						this.tableData = []
						this.options.total = count
						for (const item of data) {
							const lines = item._id["opendb-stat-app-page-result"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								if (line && Object.keys(line).length) {
									mapfields(fieldsMap, line, item)
									this.tableData.push(item)
								}
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

			getPanelData(query = stringifyQuery(this.query)) {
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-app-page-result')
					.where(query)
					.groupBy('appid')
					.groupField(
						'sum(access_times) as total_access_times, sum(access_users) as total_access_users, sum(entry_count) as total_entry_count, sum(bounce_rate) as total_bounce_rate, sum(access_time) as total_access_time'
					)
					.orderBy('start_time', 'desc ')
					.get()
					.then(res => {
						const items = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, items, undefined, 'total_')
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
