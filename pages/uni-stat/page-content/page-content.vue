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
					<view class="uni-stat--sum-item-yesterday">{{item.yesterday}}</view>
				</view>
			</view>

			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')"
				@selection-change="selectionChange">
				<uni-tr>
					<uni-th align="center">APPID</uni-th>
					<uni-th align="center">应用名</uni-th>
					<uni-th align="center">今日新增用户</uni-th>
					<uni-th align="center">今日活跃用户</uni-th>
					<uni-th align="center">今日访问数</uni-th>
					<uni-th align="center">昨日新增用户</uni-th>
					<uni-th align="center">昨日活跃用户</uni-th>
					<uni-th align="center">今日访问数</uni-th>
					<uni-th align="center">总用户数</uni-th>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index" :value="items"
					style="text-align: center; !important">
					<uni-td>{{item.appid}}</uni-td>
					<uni-td>
						<view class="name">{{item.name}}</view>
					</uni-td>
					<uni-td>{{item.today_num_new_visitor}}</uni-td>
					<uni-td>{{item.today_num_visitor}}</uni-td>
					<uni-td>{{item.today_num_page_views}}</uni-td>
					<uni-td>{{item.yesterday_num_new_visitor}}</uni-td>
					<uni-td>{{item.yesterday_num_visitor}}</uni-td>
					<uni-td>{{item.yesterday_num_page_views}}</uni-td>
					<uni-td>{{item.num_total_visitor}}</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary">查看</button>
						</view>
					</uni-td>
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
	import {
		data
	} from '@/mock/uni-stat/apps-detail.json'
	const tableData = data.item
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
					title: '新增用户',
					today: 140,
					yesterday: 150
				}, {
					title: '新增用户',
					today: 140,
					yesterday: 150
				}, {
					title: '新增用户新增用户',
					today: 140,
					yesterday: 150
				}, {
					title: '新增用户',
					today: 140,
					yesterday: 150
				}],
				current: 0,
				tabItems: ['最近七天', '最近30天', '最近90天'],
				activeTab: '最近七天',
				candidates: ['北京', '南京', '东京', '武汉', '天津', '上海', '海口'],
			}
		},
		onLoad() {
			this.selectedIndexs = []
			this.getData(1)
		},
		methods: {

			// 分页触发
			change(e) {
				this.getData(e.current)
			},
			// 搜索
			search() {
				this.getData(1, this.searchVal)
			},
			// 获取数据
			getData(pageCurrent, value = "") {
				this.loading = true
				this.pageCurrent = pageCurrent
				this.request({
					pageSize: this.pageSize,
					pageCurrent: pageCurrent,
					value: value,
					success: (res) => {
						// console.log('data', res);
						this.tableData = res.data
						this.total = res.total
						this.loading = false
					}
				})
			},
			// 伪request请求
			request(options) {
				const {
					pageSize,
					pageCurrent,
					success,
					value
				} = options
				let total = tableData.length
				let data = tableData.filter((item, index) => {
					const idx = index - (pageCurrent - 1) * pageSize
					return idx < pageSize && idx >= 0
				})
				if (value) {
					data = []
					tableData.forEach(item => {
						if (item.name.indexOf(value) !== -1) {
							data.push(item)
						}
					})
					total = data.length
				}

				setTimeout(() => {
					typeof success === 'function' && success({
						data: data,
						total: total
					})
				}, 500)

			}

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
