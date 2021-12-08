<template>
	<view>
		overview
		<view class="charts-box">
			<!-- 注意：这里的opts是uCharts的配置，eopts是ECharts的配置，不要搞混，如果不需要用在各种小程序端，是不需要传uCharts的opts的，只需要传eopts即可！！！这里加opts是为了覆盖uCharts的rose图的默认图例配置的位置 -->
			<qiun-data-charts type="area"
				
				:chartData="linearareadata" :echartsH5="true" :echartsApp="true" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				//渐变色区域图
				linearareadata: {}
			}
		},
		mounted() {
			setTimeout(() => {
				this.linearareadata = {
					categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
					series: [{
						name: "成交量A",
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
						data: [100, 80, 95, 150, 112, 132]
					}]
				}
			}, 3000)
		},
		methods: {

		}
	}
</script>

<style>
	.charts-box {
		width: 100%;
		height: 300px;
		background-color: #F0AD4E;
	}
</style>
