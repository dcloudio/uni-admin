<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">今日概况</view>
				<view class="uni-sub-title">今日概况</view>
			</view>
		</view>
		<view class="uni-container">
			<uni-stat-panel :items="sumData" />
			<view class="uni-stat--x mb-m">
				<uni-stat-tabs :tabs="dates" />
			</view>
			<view class="uni-stat--x mb-l">
				<view class="label-text mb-l">
					趋势图
				</view>
				<uni-stat-tabs type="box" :tabs="vitalities" class="mb-l" />
				<qiun-data-charts type="area" :echartsApp="true"
					:opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}" :chartData="linearareadata" />
			</view>
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th align="center">受访页</uni-th>
					<uni-th align="center">页面名称</uni-th>
					<uni-th align="center">访问人数</uni-th>
					<uni-th align="center">访问次数</uni-th>
					<uni-th align="center">退出页次数</uni-th>
					<uni-th align="center">退出率</uni-th>
					<uni-th align="center">次均停留时长</uni-th>
					<uni-th align="center">人均停留时长</uni-th>
					<uni-th align="center">分享次数</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index" style="text-align: center; !important">
					<uni-td>{{item.url}}</uni-td>
					<uni-td>{{item.name}}</uni-td>
					<uni-td>{{item.num_visitor}}</uni-td>
					<uni-td>{{item.num_visits}}</uni-td>
					<uni-td>{{item.exit_num_visits}}</uni-td>
					<uni-td>{{item.exit_rate}}</uni-td>
					<uni-td>{{item.visit_avg_time}}</uni-td>
					<uni-td>{{item.visitor_avg_time}}</uni-td>
					<uni-td>{{item.num_share}}</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total"
					@change="change" />
			</view>
		</view>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tableData: [],
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				sumData: [{
					title: '',
					today: '今天',
					yesterday: '昨天'
				}, {
					title: '访问人数',
					today: 140,
					yesterday: 150
				}, {
					title: '访问次数',
					today: 140,
					yesterday: 150
				}, {
					title: '退出页次数',
					today: 140,
					yesterday: 150
				}, {
					title: '退出率',
					today: 140,
					yesterday: 150
				}, {
					title: '分享次数',
					today: 140,
					yesterday: 150
				}],
				vitalities: [
					'新增用户',
					'活跃用户',
					'访问次数',
					'启动次数',
					'次均停留时长',
					'人均停留时长',
					'跳出率',
					'总用户数'
				],
				dates: ['最近七天', '最近30天', '最近90天'],
				candidates: ['北京', '南京', '东京', '武汉', '天津', '上海', '海口'],
				linearareadata: {
					categories: [
						"2021-11-08",
						"2021-11-09",
						"2021-11-10",
						"2021-11-11",
						"2021-11-12",
						"2021-11-13",
						"2021-11-14",
						"2021-11-15",
						"2021-11-16",
						"2021-11-17",
						"2021-11-18",
						"2021-11-19",
						"2021-11-20",
						"2021-11-21",
						"2021-11-22",
						"2021-11-23",
						"2021-11-24",
						"2021-11-25",
						"2021-11-26",
						"2021-11-27",
						"2021-11-28",
						"2021-11-29",
						"2021-11-30",
						"2021-12-01",
						"2021-12-02",
						"2021-12-03",
						"2021-12-04",
						"2021-12-05",
						"2021-12-06",
						"2021-12-07",
						"2021-12-08"
					],
					series: [{
						name: "日活",
						smooth: true,
						areaStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [{
									offset: 0,
									color: '#1890FF' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#FFFFFF' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							}
						},
						"data": [
							1520,
							1523,
							1462,
							1445,
							1433,
							972,
							768,
							1421,
							1581,
							1613,
							1549,
							1517,
							989,
							839,
							1579,
							1539,
							1574,
							1518,
							1584,
							1043,
							853,
							1498,
							1553,
							1170,
							909,
							866,
							620,
							566,
							884,
							905,
							643
						]
					}]
				}
			}
		},
		onLoad() {
			this.getData('/pageRes', 1)
		},

		methods: {

			// 分页触发
			change(e) {
				this.getData('/pageRes', e.current)
			},
			// 搜索
			search() {
				this.getData(1, this.searchVal)
			},
			// 获取数据
			getData(url, pageCurrent, value = "") {
				if (pageCurrent) {
					this.loading = true
					this.pageCurrent = pageCurrent
					this.request(url, {
						pageSize: this.pageSize,
						pageCurrent: pageCurrent,
						value: value,
						success: (res) => {
							this.tableData = res.data
							this.total = res.total
							this.loading = false
						}
					})
				} else {
					this.request(url, {
						success: (res) => {
							console.log('.........else', res);

						}
					})
				}
			},
			// 伪request请求
			request(path, options) {
				const {
					pageSize,
					pageCurrent,
					success,
					value
				} = options
				const origin = 'http://localhost:5000'
				const url = origin + path
				this.$fetch(url)
					
					.then(res => {
						console.log('........', res);
						let data, total
						if (res.item) {
							const tableData = res.item
							total = tableData.length
							data = tableData.filter((item, index) => {
								const idx = index - (pageCurrent - 1) * pageSize
								return idx < pageSize && idx >= 0
							})
						} else {
							data = res
						}

						setTimeout(() => {
							typeof success === 'function' && success({
								data: data,
								total: total
							})
						}, 500)
					})
			},
		}

	}
</script>

<style lang="scss">
	.flex {
		display: flex;
		align-items: center;
	}

	.label-text {
		font-size: 14px;
		color: #666;
		margin: auto 0;
		margin-right: 5px;
	}

	.uni-stat {
		&--x {
			border-radius: 4px;
			padding: 15px;
			box-shadow: -1px -1px 5px 0 rgba(0, 0, 0, 0.1);
		}

		&--sum {
			display: flex;
			justify-content: space-around;
			flex-wrap: wrap;

			&-item {
				text-align: center;
				margin: 10px 30px;
			}

			&-item-title {
				min-height: 17px;
				font-size: 12px;
				color: #666;
			}

			&-item-today {
				font-size: 24px;
				line-height: 48px;
				font-weight: 700;
				color: #333;
			}

			&-item-yesterday {
				font-size: 14px;
				color: #666;
			}
		}

		&--tab {
			display: flex;

			&-item {
				font-size: 14px;
				color: #666;
				text-align: center;
				cursor: pointer;
				box-sizing: border-box;

				&-line {
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 1px solid transparent;

					&-active {
						color: $uni-color-primary;
						border-bottom: 1px solid $uni-color-primary;
					}
				}

				&-line-bold {
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 2px solid transparent;

					&-active {
						color: $uni-color-primary;
						box-sizing: border-box;
						border-bottom: 2px solid $uni-color-primary;
					}
				}

				&-box {
					padding: 5px 15px;
					border: 1px solid #eee;
					margin: 0;

					&:not(:last-child) {
						border-right-color: transparent;
					}


					&-active {
						box-sizing: border-box;
						border: 1px solid $uni-color-primary !important;
					}
				}
			}

		}
	}
</style>
