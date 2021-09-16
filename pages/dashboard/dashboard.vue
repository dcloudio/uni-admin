<template>
	<view class="fix-top-window">
		<!-- <view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">dashboard</view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">

			</view>
		</view> -->
		<uni-row class="">
			<uni-col :span="8">
				<uni-card :is-shadow="true">
					<view class="uni-group">
						<view class="uni-icons-personadd-filled" style="font-size: 30px; color: rgb(24,121,254);">
						</view>
						<view class="flex-cl ml-30">今日新增 <text class="stress ml-30">80</text></view>
					</view>
					<!-- <view class="flex-cl mt-20">作日新增 <text class="ml-30">30</text></view> -->
				</uni-card>
			</uni-col>
			<uni-col :span="8">
				<uni-card :is-shadow="true">
					<view class="uni-group">
						<view class="uni-icons-person" style="font-size: 30px; color: rgb(129, 195, 98);"></view>
						<view class="flex-cl ml-30">今日活跃 <text class="stress ml-30">100</text></view>
					</view>
					<!-- <view class="flex-cl mt-20">作日活跃 <text class="ml-30">120</text></view> -->
				</uni-card>
			</uni-col>
			<uni-col :span="8">
				<uni-card :is-shadow="true">
					<view class="uni-group">
						<view class="uni-icons-person-filled" style="font-size: 30px;color: rgb(248,190,71);"></view>
						<view class="flex-cl ml-30">总用户数 <text class="stress ml-30">3000</text></view>
					</view>
					<!-- <view class="flex-cl mt-20">作日总用户数 <text class="ml-30">60</text></view> -->
				</uni-card>
			</uni-col>
		</uni-row>
		<uni-row class="flex-cl card-style">
			<uni-datetime-picker type="datetimerange"></uni-datetime-picker>
			<!-- <uni-card :is-shadow="true">
				<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="text"
					style="width: 500px; font-size: 14px !important;"></uni-segmented-control>
			</uni-card> -->
		</uni-row>
		<uni-row>
			<uni-col :span="16">
				<uni-card :is-shadow="true">
					<qiun-data-charts type="demotype" color="#000" :opts="{ xAxis: { boundaryGap: 'justify' } }"
						:chartData="chartsDataLine2" />
				</uni-card>
			</uni-col>
			<uni-col :span="8">
				<uni-card :is-shadow="true">
					<qiun-data-charts type="rose" :opts="{
				  legend: { position: 'bottom' },
				  extra: { rose: { type: 'radius' } },
				}" :chartData="chartsDataRose2" />
				</uni-card>
			</uni-col>
		</uni-row>

		<!-- <uni-row class="demo-uni-row">
			<uni-col :span="12">
				<uni-card :is-shadow="true">
					<qiun-data-charts type="rose" :opts="{
              legend: { position: 'bottom' },
              extra: { rose: { type: 'radius' } },
            }" :chartData="chartsDataRose2" />
				</uni-card>
			</uni-col>
			<uni-col :span="8">
				<uni-card :is-shadow="true">
					<qiun-data-charts type="radar" :opts="{
              legend: { position: 'bottom' },
              extra: { radar: { border: true } },
            }" :chartData="chartsDataRadar1" />
				</uni-card>
			</uni-col>
			<uni-col :span="12">
				<uni-card :is-shadow="true">
					<qiun-data-charts type="column" :opts="{ extra: { column: { type: 'stack' } } }"
						:chartData="chartsDataColumn2" />
				</uni-card>
			</uni-col>
		</uni-row> -->

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import demodata from "@/mockdata/demodata.json";

	const mockdata = {
		"PieA": {
			"series": [{
				"data": [{
					"name": "app(ios)",
					"value": 50
				}, {
					"name": "微信小程序",
					"value": 30
				}, {
					"name": "H5",
					"value": 20
				}, {
					"name": "app(andriod)",
					"value": 18
				}, {
					"name": "支付宝小程序",
					"value": 8
				}]
			}]
		},
		"Line": {
			"categories": ["202104", "202105", "202106", "202107", "202108", "202109"],
			"series": [{
				"name": "新增用户",
				"data": [35, 8, 25, 37, 4, 20]
			}, {
				"name": "活跃用户",
				"data": [70, 40, 65, 100, 44, 68]
			}]
		},
		"Column": {
			"categories": ["202104", "202105", "202106", "202107", "202108", "202109"],
			"series": [{
				"name": "总用户",
				"data": [35, 36, 31, 33, 13, 34]
			}, {
				"name": "活跃用户",
				"data": [18, 27, 21, 24, 6, 28]
			}]
		}

	}
	export default {
		data() {
			return {
				current: 5,
				items: ['最近7天', '最近30天', '最近3个月', '最近6个月'],
				chartsDataLine2: {},
				chartsDataRose2: {},
				chartsDataRadar1: {},
				chartsDataColumn2: {},
				chartsDataColumn5: {},
			};
		},
		mounted() {
			setTimeout(() => {
				this.chartsDataLine2 = JSON.parse(JSON.stringify(mockdata.Line));
				this.chartsDataRose2 = JSON.parse(JSON.stringify(mockdata.PieA));
				this.chartsDataRadar1 = JSON.parse(JSON.stringify(demodata.Radar));
				this.chartsDataColumn2 = JSON.parse(JSON.stringify(mockdata.Column));
				this.chartsDataColumn5 = JSON.parse(JSON.stringify(mockdata.Column));
			}, 1000);
		},
		methods: {
			onClickItem() {}
		},
	};
</script>

<style>
	.demo-uni-row {
		margin-top: 30px;
	}

	.mt-20 {
		margin-top: 20px;
	}

	.ml-30 {
		margin-left: 30px;
	}

	.stress {
		font-size: 30px;
		font-weight: 400;
	}
	.card-style {
		
	}
</style>
