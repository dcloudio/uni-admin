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
        <uni-card :is-shadow="true"> 今日新增：300 </uni-card>
      </uni-col>
      <uni-col :span="8">
        <uni-card :is-shadow="true"> 活跃用户：300 </uni-card>
      </uni-col>
      <uni-col :span="8">
        <uni-card :is-shadow="true"> 总用户数： 300 </uni-card>
      </uni-col>
    </uni-row>
    <uni-card :is-shadow="true">
      <qiun-data-charts
        type="demotype"
        :opts="{ xAxis: { boundaryGap: 'justify' } }"
        :chartData="chartsDataLine2"
      />
    </uni-card>
    <!-- <uni-row class="demo-uni-row">
      <uni-col :span="8">
        <uni-card :is-shadow="true">
          <qiun-data-charts
            type="rose"
            :opts="{
              legend: { position: 'bottom' },
              extra: { rose: { type: 'radius' } },
            }"
            :chartData="chartsDataRose2"
          />
        </uni-card>
      </uni-col>
      <uni-col :span="8">
        <uni-card :is-shadow="true">
          <qiun-data-charts
            type="radar"
            :opts="{
              legend: { position: 'bottom' },
              extra: { radar: { border: true } },
            }"
            :chartData="chartsDataRadar1"
          />
        </uni-card>
      </uni-col>
      <uni-col :span="8">
        <uni-card :is-shadow="true">
          <qiun-data-charts
            type="column"
            :opts="{ extra: { column: { type: 'stack' } } }"
            :chartData="chartsDataColumn2"
          />
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
export default {
  data() {
    return {
      chartsDataLine2: {},
      chartsDataRose2: {},
      chartsDataRadar1: {},
      chartsDataColumn2: {},
      chartsDataColumn5: {},
    };
  },
  mounted() {
    setTimeout(() => {
      this.chartsDataLine2 = JSON.parse(JSON.stringify(demodata.Line));
      this.chartsDataRose2 = JSON.parse(JSON.stringify(demodata.PieA));
      this.chartsDataRadar1 = JSON.parse(JSON.stringify(demodata.Radar));
      this.chartsDataColumn2 = JSON.parse(JSON.stringify(demodata.Column));
      this.chartsDataColumn5 = JSON.parse(JSON.stringify(demodata.Column));
    }, 1000);
  },
  methods: {},
};
</script>

<style>
.demo-uni-row {
  margin-top: 30px;
}
</style>
