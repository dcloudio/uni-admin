<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">用户留存</view>
				<view class="uni-sub-title">用户留存趋势分析</view>
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
			<view class="uni-stat--x mb-l" style="padding-top: 0;">
				<view class="mb-m line-bottom">
					<uni-stat-tabs type="boldLine" :tabs="fields" v-model="field"
						style="line-height: 40px; margin-bottom: -17px;" />
				</view>
				<uni-stat-tabs type="box" :tabs="keys" v-model="key" class="mb-l" />
				<view class="p-m">
					<view class="uni-charts-box">
						<qiun-data-charts type="area" :echartsApp="true"
							:opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}" :chartData="chartData" />
					</view>
				</view>
			</view>
			<view class="uni-stat--x">
				<uni-table :loading="loading" :border="false" stripe :emptyText="$t('common.empty')">
					<uni-tr style="background-color: #eee;">
						<template v-for="(mapper, index) in fieldsMap">
							<uni-th v-if="mapper.title" :key="index" align="center">{{mapper.title}}</uni-th>
						</template>
					</uni-tr>
					<uni-tr v-for="(item ,i) in tableData" :key="i">
						<template v-for="(mapper, index) in fieldsMap">
							<uni-td v-if="mapper.title" :key="index" align="center" :class="/[d|w|m]_\d/.test(mapper.field)&&[item[mapper.field] ? 'uni-stat-table-bg' : '']">
								{{item[mapper.field]}}
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
		format
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsFactory from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap: fieldsFactory(),
				query: {
					appid: '61c041fb34458700013e700a',
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
				currentDateTab: 2,
				tableData: [],
				chartData: {},
				field: 'new_user',
				fields: [{
					_id: 'new_user',
					name: '新增留存'
				}, {
					_id: 'active_user',
					name: '活跃留存'
				}],
				key: 1,
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
			fieldName() {
				let name = ''
				this.fields.forEach(item => {
					if (item._id === this.field) {
						name = item.name
					}
				})
				return name
			},
			keyName() {
				return this.keys.forEach(item => {
					if (item._id === this.key) {
						return item.name
					}
				})
			},
			keys() {
				const values = [1, 2, 3, 4, 5, 6, 7, 14, 30]
				return values.map(val => {
					return {
						_id: val,
						name: `${val}天后`
					}
				})
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.getAllData(val)
				}
			},
			key() {
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
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},

			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTabelData(this.query)
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTabelData(this.query)
			},

			createStr(type = "used_count", vals, fields, tail) {
				tail = tail ? ',' + tail : ''
				const value = vals || [1, 2, 3, 4, 5, 6, 7, 14, 30]
				const p = 'd'
				const f = this.fields.map(item => item._id)
				fields = fields || f
				const l = fields.length
				const strArr = value.map(item => {
					return fields.map(field => {
						return `retention.${field}.${p + '_' + item}.${type} as ${l > 1 ? field + '_' + p +'_'+item :  p + '_' + item}${tail}`
					})
				})
				const str = strArr.join()
				console.log(66666666, str);
				return str
			},

			getAllData(query) {
				this.getChartData(query, this.key, this.keyName)
				this.getTabelData(query)
			},

			getChartData(query, key = 1, name = '访问人数') {
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query)
				const groupField = this.createStr("used_count", [key], [this.field])
				console.log('..............Chart query：', query);
				const db = uniCloud.database()
				db.collection('opendb-stat-app-session-result')
					.where(query)
					.field(`${groupField}, stat_date, start_time`)
					.orderBy('start_time', 'asc')
					.get({
						getCount: true
					})
					.then(res => {
						let {
							count,
							data
						} = res.result
						console.log('.......chart:', data);
						const options = {
							categories: [],
							series: [{
								name: `${key}天后${this.fieldName}`,
								data: []
							}]
						}
						this.chartData = []
						for (const item of data) {
							console.log(22222, key);
							const x = item.stat_date
							const y = item[`d_${key}`]
							if (y) {
								options.series[0].data.push(y)
								options.categories.push(x)
							}

						}
						console.log(333333, options);
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
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query)
				const tail = this.field + "_count"
				const groupField = this.createStr('used_rate', '', [this.field], tail)
				console.log('..............Table query：', query);
				this.loading = true
				const db = uniCloud.database()
				db.collection('opendb-stat-app-session-result')
					.where(query)
					.field(`${groupField}, stat_date, start_time`)
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
						const title = tail === 'active_user_count' ? '活跃用户' : '新增用户'
						const maps = [{
							title,
							field: tail
						}]
						this.fieldsMap = fieldsFactory(maps)
						this.options.total = count
						this.tableData = []
						this.tableData = data
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

	.uni-stat-table-bg {
		background-color: #4e82d9;
		color: #fff;
	}
</style>
