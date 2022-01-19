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
				<view v-for="(item,index) in dayChartsData" class="uni-stat--x uni-charts-box">
					<view class="label-text">{{dayChartsData[index].title}}</view>
					<qiun-data-charts type="ring" :opts="{legend:{position:'left'}}" :chartData="dayChartsData[index]"
						:echartsApp="true" />
				</view>

				<view v-for="(item,index) in monChartsData" class="uni-stat--x uni-charts-box">
					<view class="label-text">{{monChartsData[index].title}}</view>
					<qiun-data-charts type="ring" :opts="{legend:{position:'left'}}" :chartData="monChartsData[index]"
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
				platforms: [],
				dayChartsData: [],
				monChartsData: []
			}
		},
		mounted() {
			this.getChartData(this.query)
			this.getRangeCountData(this.query, 'month')
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.getChartData(val)
					this.getRangeCountData(val, 'month')
				}
			}
		},

		methods: {
			getChartData(query, type = 'day') {
				query = stringifyQuery(query)
				console.log('.............query:', query);
				const db = uniCloud.database()
				db.collection('opendb-stat-app-session-result')
					.where(query)
					.field(
						`active_user_count,new_user_count,total_users,platform_id`
					)
					.groupBy(`platform_id`)
					.groupField(
						`sum(active_user_count) as ${type}_active_user_count, sum(new_user_count) as ${type}_new_user_count, max(total_users) as ${type}_total_users`
					)
					.get()
					.then(res => {
						console.log(111111, res);
						const data = res.result.data
						this.initChartOption(data, 'dayChartsData')
					})
			},
			getRangeCountData(query, type) {
				const {
					pageCurrent
				} = this.options
				query = stringifyQuery(query)
				const db = uniCloud.database()
				const sub = db.collection('opendb-stat-app-session-result')
					.where(query)
					.field(
						`active_user_count, new_user_count, platform_id, ${type}(add(new Date(0),start_time), "Asia/Shanghai") as ${type},year(add(new Date(0),start_time), "Asia/Shanghai") as year`
					)
					.groupBy(`year, ${type ? type + ',' : ''}platform_id`)
					.groupField(
						`sum(active_user_count) as ${type}_active_user_count, sum(new_user_count) as ${type}_new_user_count`
					)
					.orderBy(`year asc, ${type} asc`)
					.get()
					.then(res => {
						console.log(2222222, res);
						const data = res.result.data
						this.initChartOption(data, 'monChartsData', 'month')
					})

			},

			initChartOption(data, goal, type = 'day') {
				const db = uniCloud.database()
				db.collection('opendb-stat-app-platforms').get().then(res => {
					const options = [{
						field: `${type}_new_user_count`,
						title: `${type === 'day' ? '日' : '月'}新增用户对比`,
						series: [{
							data: []
						}]
					}, {
						field: `${type}_active_user_count`,
						title: `${type === 'day' ? '日' : '月'}活跃用户对比`,
						series: [{
							data: []
						}]
					}]

					if (type === 'day') {
						options.unshift({
							field: `day_total_users`,
							title: `总用户数对比`,
							series: [{
								data: [],
							}]
						})
					}

					this[goal] = options
					const platformsData = res.result.data
					const platforms = {}
					platformsData.forEach(p => {
						platforms[p._id] = p.name
					})

					for (const chart of this[goal]) {
						const pie = chart.series[0].data
						const p = JSON.parse(JSON.stringify(platforms))
						for (const item of data) {
							for (const key in item) {
								if (chart.field === key) {
									const id = item.platform_id
									const slice = {
										name: p[id],
										value: item[key]
									}
									pie.push(slice)
									delete p[id]
								}
							}
						}
						for (const key in p) {
							const slice = {
								name: p[key],
								value: 0
							}
							pie.push(slice)
						}
					}
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
