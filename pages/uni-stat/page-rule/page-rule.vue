<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">页面规则</view>
				<view class="uni-sub-title">生成内容统计 url 的规则。通过设置页面有效参数，通过带参数的 url 对内容进行标识</view>
			</view>
		</view>
		<view class="uni-container">
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th align="center">页面标题</uni-th>
					<uni-th align="center">页面 URL</uni-th>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index" style="text-align: center; !important">
					<uni-td>{{item.name}}</uni-td>
					<uni-td>{{item.url}}</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary">编辑规则</button>
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
			}
		},
		onLoad() {
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
				this.request('/pageRule', {
					pageSize: this.pageSize,
					pageCurrent: pageCurrent,
					value: value,
					success: (res) => {
						this.tableData = res.data
						this.total = res.total
						this.loading = false
					}
				})
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
						const tableData = res.item
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
					})
			},
		}

	}
</script>

<style lang="scss">

</style>
