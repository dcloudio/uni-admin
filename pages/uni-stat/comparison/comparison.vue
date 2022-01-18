<template>
	<view class="fix-top-window">
		<view class="uni-header hide-on-phone">
			<view class="uni-group">
				<view class="uni-title">平台对比</view>
				<view class="uni-sub-title">多个指标在不同平台数据的占比，可以直观看出各个平台引流的效果</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex mb-m">
				<uni-stat-select mode="app" label="应用选择" v-model="query.appid" />
				<view class="flex ml-m">
					<view class="label-text">日期选择:</view>
					<uni-datetime-picker type="date" v-model="query.start_time" returnType="timestamp"
						:clearIcon="false" class="uni-stat-datetime-picker"
						:class="{'uni-stat__actived': !!query.start_time}" />
				</view>
			</view>
			<view class="flex">
				<view class="uni-stat--x uni-charts-box">
					<view class="label-text">日新增用户对比</view>
					<qiun-data-charts type="ring" :opts="{legend:{position:'left'}}" :chartData="chartData"
						:echartsApp="true" />
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
	export default {
		data() {
			return {
				query: {
					dimension: "day",
					appid: '',
					start_time: 1642089600000,
				},
				chartData: {}
			}
		},
		mounted() {
			this.getChartData(this.query)
			// this.getRangeCountData(this.query, 'month')
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.getChartData(val)
				}
			}
		},

		methods: {
			getChartData(query, type='') {
				const options = {
					series: [{
						data: []
					}]
				}
				query = stringifyQuery(query)
				console.log('.............query:', query);
				const db = uniCloud.database()

				const main = db.collection('opendb-stat-app-platforms').getTemp()
				const sub = db.collection('opendb-stat-app-session-result')
					.where(query)
					.getTemp()

				db.collection(main, sub)
					.field(
						`name, _id{"opendb-stat-app-session-result"{${type ? type + '_' : ''}active_user_count, ${type ? type + '_' : ''}new_user_count${!type ? ',total_users' : ''}}}`
						)
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
						this.chartData = options

						for (const item of data) {
							const lines = item._id["opendb-stat-app-session-result"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								const name = item.name
								let value = line && line.active_user_count ? line.active_user_count : 0
								options.series[0].data.push({
									name,
									value
								})
								// mapfields(fieldsMap, line, item)
							}
						}
						console.log(111111111, options);
						this.chartData = options
					}).catch((err) => {
						console.error(err)
					})
			},
			getRangeCountData(query, type) {
				const options = {
					series: [{
						data: []
					}]
				}
				const {
					pageCurrent
				} = this.options
				const db = uniCloud.database()
				query = stringifyQuery(query)
				const main = db.collection('opendb-stat-app-platforms').getTemp()

				const sub = db.collection('opendb-stat-app-session-result')
					.where(query)
					.field(
						`active_user_count, platform_id, ${type}(add(new Date(0),start_time), "Asia/Shanghai") as ${type},year(add(new Date(0),start_time), "Asia/Shanghai") as year`
					)
					.groupBy(`year, ${type}, platform_id`)
					.groupField(`sum(active_user_count) as ${type}_active_user_count`)
					.orderBy(`year asc, ${type} asc`)
					.getTemp()

				db.collection(main, sub)
					.field(
						`name, _id{"opendb-stat-app-session-result"{${type ? type + '_' : ''}active_user_count, ${type ? type + '_' : ''}new_user_count${type ? ',total_users' : ''}}}`
						)
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
						this.chartData = options

						for (const item of data) {
							const lines = item._id["opendb-stat-app-session-result"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								const name = item.name
								let value = line && line.active_user_count ? line.active_user_count : 0
								options.series[0].data.push({
									name,
									value
								})
								// mapfields(fieldsMap, line, item)
							}
						}
						console.log(111111111, options);
						this.chartData = options
					}).catch((err) => {
						console.error(err)
					})
			},





			jointTable(main, sub, type='') {
				const options = {
					series: [{
						data: []
					}]
				}
				const db = uniCloud.database()
				db.collection(main, sub)
					.field(
						`name, _id{"opendb-stat-app-session-result"{${type ? type + '_' : ''}active_user_count, ${type ? type + '_' : ''}new_user_count ${type ? ',total_users' : ''}}}`
						)
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
						this.chartData = options

						for (const item of data) {
							const lines = item._id["opendb-stat-app-session-result"]
							if (Array.isArray(lines)) {
								delete(item._id)
								const line = lines[0]
								const name = item.name
								let value = line && line.active_user_count ? line.active_user_count : 0
								options.series[0].data.push({
									name,
									value
								})
								// mapfields(fieldsMap, line, item)
							}
						}
						console.log(111111111, options);
						this.chartData = options
					}).catch((err) => {
						console.error(err)
					})
			}

		}

	}
</script>

<style lang="scss">
	.uni-charts-box {
		padding: 15px;
		width: calc((50% - 37.5px));
		height: 350px;
		margin-bottom: 15px;
	}

	.uni-charts-box:nth-last-child(2n-1) {
		margin-right: 15px;
	}
</style>
