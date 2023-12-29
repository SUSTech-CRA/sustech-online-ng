<template>
  <div id="bustable">
    <object-selector :objs="{
      '中心餐厅': true,
      '十栋餐厅': false
    }" v-slot="canteenProps">
      <br />
      <object-selector :objs="canteenProps.selected ? {
        '麻辣烫 ': 11,
        '大众菜左': 12,
        '大众菜右': 13,
        '特色菜左': 14,
        '特色菜中': 15,
        '特色菜右': 16
      } : { '大众菜左': 21, '大众菜右': 22 }
        " v-slot="boothProps">
        <div v-for="meal in [0, 1, 2]" :key="meal">
          <data-request :path="getUrl(boothProps.selected, meal)" v-slot="{ data }">
            <v-chart class="echarts" :option="getChartData(data, meal)" />
          </data-request>
        </div>
      </object-selector>

    </object-selector>
  </div>
</template>

<script>
import ECharts from 'vue-echarts';
import { use } from 'echarts/core';

import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, DataZoomComponent } from 'echarts/components';

import ObjectSelector from "./bus/ObjectSelector.vue";
import DataRequest from "./bus/DataRequest.vue";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent
]);

export default {
  name: "TrendChart",
  components: {
    'data-request': DataRequest,
    'object-selector': ObjectSelector,
    'v-chart': ECharts
  },

  data() {
    return {
    }
  },

  setup() {

  },

  methods: {
    getUrl(boothId, meal) {
      const date = "20231113"; // TODO
      return `http://localhost:8102/api/v1/traffic/booths/${boothId}?date=${date}&meal=${meal}`;
    },

    getChartData(trafficList, meal) {
      if (trafficList) {
        trafficList = trafficList.data;
        const chartData = {
          title: {
            text: ["早餐 Breakfast", "午餐 Lunch", "晚餐 Dinner"][meal],
          },
          xAxis: {
            type: 'category',
            data: trafficList.map(item => item.time.slice(11, 16)), // 提取小时和分钟
          },
          yAxis: {
            type: 'value',
            name: '人数 Number',
          },
          series: [{
            data: trafficList.map(item => item.number),
            type: 'line',
            lineStyle: {
              color: "rgb(90,120,200)"
            }
          }],
          dataZoom: [{
            type: 'slider',
            xAxisIndex: 0,
            start: 50,
            end: 100
          }]
        };
        return chartData;
      }
    }
  }


}

</script>


<style>
.echarts {
  width: 100%;
  height: 300px;
}
</style>
