<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">统计首页</view>
				<view class="uni-sub-title"></view>
			</view>
		</view>
		<view class="uni-container">
			<uni-notice-bar class="mb-m" text="当日实时统计显示逻辑：3天内未登录统计后台的应用不会处理当日实时统计，再次登录后1小时内会开始进行实时统计。"></uni-notice-bar>
			<uni-stat-panel :items="sumData" />
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
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
				<uni-tr v-for="(item ,index) in tableData" :key="index" style="text-align: center; !important">
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
							<button class="uni-button" size="mini" type="primary" @click="navTo(item.appid)">查看</button>
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
				}]
			}
		},
		onLoad() {
		    this.getData('/appOverview')
		    this.getData('/appsDetail', 1)
		},
		methods: {
			// 分页触发
			change(e) {
				this.getData('/appsDetail', e.current)
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
							total =  tableData.length
							data = tableData.filter((item, index) => {
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
							}
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
	.uni-stat--sum {
		&-x {
			display: flex;
			justify-content: space-around;
			flex-wrap: wrap;
			border-radius: 4px;
			padding: 15px;
			box-shadow: -1px -1px 5px 0 rgba(0, 0, 0, 0.1);
		}

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
</style>
