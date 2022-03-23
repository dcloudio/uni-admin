<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">用户忠诚度</view>
				<view class="uni-sub-title">用户忠诚度用户对您应用的访问深度及访问频次情况。助您了解用户对应用的粘度，尤其在对内容改进后，效果是否有所提升</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id"
					@change="changePlatform" />
				<uni-stat-select mode="channel" label="渠道选择" :query="channelQuery" v-model="query.channel_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x mb-l" style="padding-top: 0;">
				<view class="mb-m line-bottom">
					<uni-stat-tabs type="boldLine" :tabs="types" v-model="type"
						style="line-height: 40px; margin-bottom: -17px;" />
				</view>
				<uni-stat-panel v-if="type === 'visit_depth_data'" :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" :tabs="fields" v-model="field" class="mb-l" />
				<view class="p-m">
					<view class="uni-charts-box">
						<qiun-data-charts type="column" :chartData="chartData" echartsH5 echartsApp />
					</view>
				</view>
			</view>
			<view class="uni-stat--x p-m">
				<uni-stat-table :data="tableData" :filedsMap="fieldsMap" :loading="loading" />
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
					// dimension: "hour",
					appid: '__UNI__HelloUniApp',
					platform_id: '',
					channel_id: '',
					start_time: [],
				},
				loading: false,
				currentDateTab: 0,
				// currentChartTab: ,
				tableData: [],
				panelData: [],
				chartData: {},
				type: 'visit_depth_data',
				types: [{
					_id: 'visit_depth_data',
					name: '访问深度'
				}, {
					_id: 'duration_data',
					name: '访问时长'
				}],
				field: 'visit_users',
				fields: [{
					_id: 'visit_users',
					name: '访问人数'
				}, {
					_id: 'visit_times',
					name: '访问次数'
				}],
				options: {
					visit_depth_data: {
						prefix: 'p',
						title: '页',
						value: [1, 2, 3, 4, 5, 10]
					},
					duration_data: {
						prefix: 's',
						title: '秒',
						value: [0, 3, 6, 11, 21, 31, 51, 100]
					}
				}
			}
		},
		computed: {
			fieldName() {
				return this.fields.forEach(item => {
					if (item._id === this.field) {
						return item.name
					}
				})
			},		
			channelQuery() {
				const platform_id = this.query.platform_id
				return stringifyQuery({
					platform_id
				})
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.getAllData(val)
				}
			},
			type() {
				this.getAllData(this.query)
			},
			field() {
				this.getAllData(this.query)
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changePlatform() {
				this.query.channel_id = ''
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},

			createStr(fields, type = "visit_depth_data") {
				const l = fields.length
				const p = this.options[type].prefix
				const value = this.options[type].value
				const strArr = value.map(item => {
					return fields.map(field => {
						return `sum(${type}.${field}.${p + '_' + item}) as ${l > 1 ? field + '_' + p +'_'+item :  p + '_' + item}`
					})
				})
				const str = strArr.join()
				return str
			},

			parseChars(str) {
				str = str.split('_')
				const option = this.options[this.type]
				let chars = option.title
				const strArr = option.value.forEach((val, i) => {
					const next = option.value[i + 1]
					if (val === Number(str[str.length - 1])) {
						if (!next) {
							chars = val + '+' + chars
 						} else if (val + 1 === next) {
							chars = val + chars
						} else {
							chars = val + '-' + (next - 1) + chars
						}
					}
				})
				return chars
			},

			getAllData(query) {
				this.getPanelData(query)
				this.getChartData(query, this.field, this.fieldName)
				this.getTabelData(query)
			},

			getChartData(query, field = this.field, name = this.fields.find(f => f._id === this.field).name) {
				this.chartData = {}
				query = stringifyQuery(query)
				const groupField = this.createStr([field], this.type)
				console.log('..............Chart query：', query);
				const db = uniCloud.database()
				db.collection('opendb-stat-loyalty-result')
					.where(query)
					.groupBy('appid')
					.groupField(groupField)
					.orderBy('start_time', 'asc')
					.get({
						getCount: true
					})
					.then(res => {
						let {
							count,
							data
						} = res.result
						data = data[0]
						console.log('.......chart:', data);
						const options = {
							categories: [],
							series: [{
								name,
								data: []
							}]
						}
						for (const key in data) {
							if (key !== 'appid') {
								const x = this.parseChars(key)
								const y = data[key]
								if (y) {
									options.series[0].data.push(y)
									options.categories.push(x)
								}
							}
						}
						this.chartData = options
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getTabelData(query) {
				query = stringifyQuery(query)
				const groupField = this.createStr(['visit_users', 'visit_times'], this.type)
				console.log('..............Table query：', query);
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-loyalty-result')
					.where(query)
					.groupBy('appid')
					.groupField(groupField)
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
						const type = this.type
						const rows = []
						let splitor = this.options[type].prefix
						splitor = `_${splitor}_`
						for (const item of data) {
							for (const key in item) {
								if (key !== 'appid') {
									const row = {}
									const keys = key.split(splitor)
									row.name = keys[1]
									row[keys[0]] = item[key]
									rows.push(row)
								}
							}
						}
						const tableData = []
						const reducer = (previousValue, currentValue) => previousValue + currentValue;
						const total = {}

						let users = rows.filter(row => row.visit_users)
							.map(row => row.visit_users)
						users = users.length ? users.reduce(reducer) : 0
						let times = rows.filter(row => row.visit_times)
							.map(row => row.visit_times)
						times = times.length ? times.reduce(reducer) : 0
						total.visit_times = times
						total.visit_users = users
						this.options[type].value.forEach(val => {
							const item = {}
							item.name = val + 'p'
							rows.forEach(row => {
								if (Number(row.name) === val) {
									for (const key in row) {
										if (key !== name) {
											item[key] = row[key]
											item['total_' + key] = total[key]
										}
									}
								}
							})
							item.name = this.parseChars(String(val))
							tableData.push(item)
						})
						console.log(33333, tableData)
						for (const item of tableData) {
							mapfields(fieldsMap, item, item)
						}
						console.log(4444444, tableData)
						// this.options.total = count
						this.tableData = []
						this.tableData = tableData
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getPanelData(query) {
				query = stringifyQuery(query)
				console.log('..............Panel query：', query);
				const db = uniCloud.database()
				const subTable = db.collection('opendb-stat-result')
					.where(query)
					.groupBy('appid')
					.groupField(
						'sum(page_visit_count) as total_visit_times, max(total_users) as total_visit_users'
					)
					.orderBy('start_time', 'desc')
					.get({
						getCount: true
					})
					.then(res => {
						console.log('.......table:', res);
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

<style lang="scss">
	.flex {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.label-text {
		font-size: 14px;
		color: #666;
		margin: auto 0;
		margin-right: 5px;
	}

	.line-bottom {
		border-bottom: 2px solid #eee;
	}

	.uni-stat-panel {
		box-shadow: unset;
		border-bottom: 1px solid #eee;
		padding: 0;
		margin: 0 15px;
	}
</style>
