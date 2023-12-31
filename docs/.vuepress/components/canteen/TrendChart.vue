<template>
  <div id="bustable">
    <object-selector :objs="{
      '中心餐厅 | Center Cafeteria': true,
      '十栋餐厅 | Building 10 No.2 Cafeteria': false
    }" v-slot="canteenProps">
      <br />
      <br />
      <object-selector :objs="canteenProps.selected ? {
        '麻辣烫 | Spicy Hot Pot': 11,
        '大众菜左 | Popular Dishes': 12,
        '大众菜右 | Popular Dishes': 13,
        '风味面食 | Noodles': 14,
        '潮汕卤味套餐 | Chiu Chow-style Brino Meat': 15,
        '铁锅拌饭 | Rice with Mixed Vegetables': 16
      } : { '大众菜左 | Popular Dishes': 21, '大众菜右 | Popular Dishes': 22 }
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

import ObjectSelector from "../bus/ObjectSelector.vue";
import DataRequest from "../bus/DataRequest.vue";

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
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const date = `${year}${month}${day}`;

      return `https://susteen.itbill.cn/api/v1/traffic/booths/${boothId}?date=${date}&meal=${meal}`;
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
  height: 250px;
}
</style>
