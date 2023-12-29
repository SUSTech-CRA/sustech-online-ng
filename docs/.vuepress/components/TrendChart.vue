<template>
  <div>
    <v-chart class="echarts" :option="chartData" />
  </div>

  <div id="bustable">
    <!-- <object-selector :objs="{
      '工作日 Workday': true,
      '节假日 Holiday': false
    }" v-slot="weekdayProps">
      <br />
      <object-selector :objs="weekdayProps.selected ? {
        'Line 1 号线 │ 工学院方向 To COE': '/bus_times/one_down.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up.json',
        'Line 2 号线 │ 科研楼方向 To Research Bldg.': '/bus_times/two_down.json',
        'Line 2 号线 │ 欣园方向 To Joy Highland': '/bus_times/two_up.json',
      } : {
        'Line 1 号线 │ 工学院方向  To COE': '/bus_times/one_down_holiday.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up_holiday.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up_holiday.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up_holiday.json',
      }" v-slot="routeProps">
        <data-request :path="routeProps.selected" v-slot="{ data }">
          <bus-timer v-if="data" v-bind="data"></bus-timer>
          <grid-list v-if="data" :data="data.times">
          </grid-list>
        </data-request>
      </object-selector>
    </object-selector> -->
  </div>
</template>
  
<script>
import axios from "axios";

import { defineComponent } from 'vue';
import ECharts from 'vue-echarts';
import { use } from 'echarts/core';

import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, DataZoomComponent } from 'echarts/components';

import BusTimer from "./bus/BusTimer.vue";
import ObjectSelector from "./bus/ObjectSelector.vue";
import DataRequest from "./bus/DataRequest.vue";
import GridList from "./bus/GridList.vue";

// 注册必须的组件
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
    BusTimer,
    ObjectSelector,
    DataRequest,
    GridList,
    'v-chart': ECharts,
  },
  data() {
    return {
      trafficList: [
        {
            "time": "2023-11-13T11:00:00.000+08:00",
            "number": 2
        },
        {
            "time": "2023-11-13T11:01:00.000+08:00",
            "number": 0
        },
        {
            "time": "2023-11-13T11:02:00.000+08:00",
            "number": 0
        },
        {
            "time": "2023-11-13T11:03:00.000+08:00",
            "number": 0
        },
        {
            "time": "2023-11-13T11:04:00.000+08:00",
            "number": 1
        },
        {
            "time": "2023-11-13T11:05:00.000+08:00",
            "number": 0
        },
        {
            "time": "2023-11-13T11:06:00.000+08:00",
            "number": 0
        },
        {
            "time": "2023-11-13T11:07:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T11:08:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T11:09:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:10:00.000+08:00",
            "number": 10
        },
        {
            "time": "2023-11-13T11:11:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:12:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T11:13:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T11:14:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T11:15:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T11:16:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T11:17:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T11:18:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T11:19:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T11:20:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T11:21:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T11:22:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:23:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:24:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:25:00.000+08:00",
            "number": 16
        },
        {
            "time": "2023-11-13T11:26:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:27:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T11:28:00.000+08:00",
            "number": 10
        },
        {
            "time": "2023-11-13T11:29:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T11:30:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T11:31:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:32:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:33:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T11:34:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:35:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T11:36:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:37:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T11:38:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T11:39:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T11:40:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T11:41:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T11:42:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T11:43:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T11:44:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T11:45:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T11:46:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T11:47:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T11:48:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T11:49:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:50:00.000+08:00",
            "number": 15
        },
        {
            "time": "2023-11-13T11:51:00.000+08:00",
            "number": 18
        },
        {
            "time": "2023-11-13T11:52:00.000+08:00",
            "number": 14
        },
        {
            "time": "2023-11-13T11:53:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T11:54:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T11:55:00.000+08:00",
            "number": 16
        },
        {
            "time": "2023-11-13T11:56:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T11:57:00.000+08:00",
            "number": 16
        },
        {
            "time": "2023-11-13T11:58:00.000+08:00",
            "number": 10
        },
        {
            "time": "2023-11-13T11:59:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T12:00:00.000+08:00",
            "number": 16
        },
        {
            "time": "2023-11-13T12:01:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T12:02:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:03:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T12:04:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T12:05:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:06:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T12:07:00.000+08:00",
            "number": 14
        },
        {
            "time": "2023-11-13T12:08:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T12:09:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T12:10:00.000+08:00",
            "number": 16
        },
        {
            "time": "2023-11-13T12:11:00.000+08:00",
            "number": 17
        },
        {
            "time": "2023-11-13T12:12:00.000+08:00",
            "number": 15
        },
        {
            "time": "2023-11-13T12:13:00.000+08:00",
            "number": 17
        },
        {
            "time": "2023-11-13T12:14:00.000+08:00",
            "number": 10
        },
        {
            "time": "2023-11-13T12:15:00.000+08:00",
            "number": 12
        },
        {
            "time": "2023-11-13T12:16:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:17:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T12:18:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:19:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:20:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:21:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T12:22:00.000+08:00",
            "number": 2
        },
        {
            "time": "2023-11-13T12:23:00.000+08:00",
            "number": 11
        },
        {
            "time": "2023-11-13T12:24:00.000+08:00",
            "number": 10
        },
        {
            "time": "2023-11-13T12:25:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:26:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:27:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T12:28:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T12:29:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:30:00.000+08:00",
            "number": 2
        },
        {
            "time": "2023-11-13T12:31:00.000+08:00",
            "number": 2
        },
        {
            "time": "2023-11-13T12:32:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T12:33:00.000+08:00",
            "number": 2
        },
        {
            "time": "2023-11-13T12:34:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:35:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:36:00.000+08:00",
            "number": 10
        },
        {
            "time": "2023-11-13T12:37:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T12:38:00.000+08:00",
            "number": 9
        },
        {
            "time": "2023-11-13T12:39:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:40:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:41:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T12:42:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T12:43:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T12:44:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T12:45:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T12:46:00.000+08:00",
            "number": 8
        },
        {
            "time": "2023-11-13T12:47:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:48:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:49:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:50:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:51:00.000+08:00",
            "number": 4
        },
        {
            "time": "2023-11-13T12:52:00.000+08:00",
            "number": 5
        },
        {
            "time": "2023-11-13T12:53:00.000+08:00",
            "number": 6
        },
        {
            "time": "2023-11-13T12:54:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T12:55:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:56:00.000+08:00",
            "number": 7
        },
        {
            "time": "2023-11-13T12:57:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T12:58:00.000+08:00",
            "number": 3
        },
        {
            "time": "2023-11-13T12:59:00.000+08:00",
            "number": 3
        }
    ],
      chartData: null
    };
  },
  mounted() {
    // function toggleButtonBasedOnDate(holidata) {
    //   // JSON is from https://github.com/NateScarlet/holiday-cn
    //   // need to update by year.
    //   // Download the JSON to path "docs/.vuepress/public/YYYY.json"
    //   var dayMap = {};
    //   for (let i = 0; i < holidata.days.length; i++) {
    //     dayMap[holidata.days[i].date] = holidata.days[i].isOffDay;
    //   }
    //   var nowDate = new Date();
    //   var ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(nowDate);
    //   var mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(nowDate);
    //   var da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(nowDate);
    //   var dayKey = `${ye}-${mo}-${da}`;
    //   var isHoliday;
    //   if (dayMap[dayKey] == null) {
    //     // 不在国家假日调整表里
    //     console.log("Not in GOV declaration");
    //     var dayInWeek = nowDate.getDay();
    //     var isWeekend = (dayInWeek == 6) || (dayInWeek == 0);
    //     // 6 = Saturday, 0 = Sunday
    //     isHoliday = isWeekend;
    //   } else {
    //     console.log("In GOV declaration");
    //     isHoliday = dayMap[dayKey];
    //   }
    //   if (isHoliday) {
    //     console.log("节假日");
    //     const busDiv = document.getElementById("bustable");
    //     const thisDayBtn = busDiv.getElementsByTagName("button")[1];
    //     thisDayBtn.click();
    //   } else {
    //     console.log("工作日");
    //     const busDiv = document.getElementById("bustable");
    //     const thisDayBtn = busDiv.getElementsByTagName("button")[0];
    //     thisDayBtn.click();
    //   }
    // }

    // axios.get("/2023.json").then(response => {
    //   toggleButtonBasedOnDate(response.data);
    // });

    this.getTrafficList();
    this.getChartData();

  },
  methods: {
    getTrafficList() {

    },

    getChartData() {
      this.chartData = {
        xAxis: {
          type: 'category',
          data: this.trafficList.map(item => item.time.slice(11, 16)), // 提取小时和分钟
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: this.trafficList.map(item => item.number),
          type: 'line'
        }],
        dataZoom: [{
          type: 'slider',
          xAxisIndex: 0,
          start: 50,
          end: 100
        }]
      };
    }
  }
}
</script>
  
<style scoped>
.echarts {
  width: 100%;
  height: 400px;
}
</style>
  