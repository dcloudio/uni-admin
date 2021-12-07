<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">受访页</view>
				<view class="uni-sub-title">受访页数据分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x uni-stat--tab mb-m">
				<view v-for="(item, index) in tabItems" key="index" class="uni-stat--tab-item">
					{{item}}
				</view>
			</view>
			<view class="uni-stat--x flex mb-m">
				<uni-datetime-picker type="datetimerange" style="max-width: 400px; margin-right: 30px;" />
				<view class="label-text">渠道:</view>
				 <uni-combox :candidates="candidates" placeholder="请选择" style="max-width: 400px;" ></uni-combox>
			</view>
			<view class="uni-stat--x uni-stat--sum mb-m">
				<view v-for="(item, index) in sumData" key="index" class="uni-stat--sum-item">
					<view class="uni-stat--sum-item-title" >
						{{item.title}}
						<span v-if="item.title" class="uni-icons-help"></span>
					</view>
					<view class="uni-stat--sum-item-today">{{item.today}}</view>
					<!-- <view class="uni-stat--sum-item-yesterday">{{item.yesterday}}</view> -->
				</view>
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
				current: 0,
				tabItems: ['昨天', '最近七天', '最近30天', '最近90天'],
				activeTab: '最近七天',
				candidates: ['北京', '南京', '东京', '武汉', '天津', '上海', '海口'],
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
		    	fetch(url)
		    		.then(response => response.json())
		    		.then(res => {
		    			console.log('........', res);
						let data, total
						if (res.item) {
							const tableData = res.item
							total =  tableData.length
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
		margin-right: 5px;
	}

	.uni-stat {
		&--x {
			border-radius: 4px;
			padding: 15px;
			box-shadow: -1px -1px 5px 0 rgb(0 0 0 / 10%);
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
				margin-right: 30px;
				padding: 2px 0;

				&-active {
					color: $uni-color-primary;
					border-bottom: 1px solid $uni-color-primary;
				}
			}

		}
	}
</style>
