<template>
  <v-chart class="chart" :option="echartsOption" :autoresize="true" />
  <img
    src="https://visitor-badge.laobi.icu/badge?page_id=nikebus"
    alt="visitor badge"
    class="visitor-badge"
  />
</template>

<script>
import axios from "axios";
import {
  along,
  length,
  nearestPoint,
  nearestPointOnLine,
  point,
  rhumbBearing,
} from "@turf/turf";
import ECharts from "vue-echarts";
import { use } from "echarts/core";
// import {CanvasRenderer} from "echarts/renderers";
import { SVGRenderer } from "echarts/renderers";
import { ScatterChart, LinesChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  MarkPointComponent,
  // MarkPointComponent,
  GridComponent,
} from "echarts/components";

use([
  // CanvasRenderer
  SVGRenderer,
  TitleComponent,
  TooltipComponent,
  MarkPointComponent,
  // LegendComponent,
  GridComponent,
  ScatterChart,
  LinesChart,
]);

export default {
  name: "BusChartVue",
  components: {
    "v-chart": ECharts,
  },
  data: () => ({
    lines: [],
    stops1: [],
    stops2: [],
    historyBusData: [],
    echartsOption: {
      tooltip: {
        show: false,
      },
      title: [
        {
          // text: '南科大校巴实时位置',
          subtext: "By bilibili@交通数据小旭学长\nGitHub@ni1o1",
          sublink: "https://github.com/ni1o1/nikebus",
          textAlign: "right",
          bottom: "2%",
          left: "98%",
        },
      ],
      grid: [
        {
          top: "10%",
          bottom: "0%",
          left: "26px",
          right: "14px",
        },
      ],
      yAxis: [
        {
          inverse: true,
          min: -100,
          max: 4500,
          type: "value",
          boundaryGap: false,
          show: false,
          splitLine: {
            show: false,
          },
        },
      ],
      xAxis: [
        {
          position: "top",
          verticalAlign: "top",
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: { interval: 0 },
          type: "category",
          data: [
            "1号线\n工学院方向",
            "1号线\n欣园方向",
            "2号线\n科研楼方向",
            "2号线\n欣园方向",
          ],
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          type: "scatter",
          label: {
            fontSize: 10,
            show: true,
            color: "#999",
            position: "right",
            formatter: "{b}",
          },
          data: [],
        },
        {
          type: "lines",
          coordinateSystem: "cartesian2d",
          data: [],
        },
        {
          label: {
            fontSize: 11,
            show: true,
            color: "#000",
            textBorderColor: "#fff",
            textBorderWidth: 2,
            fontWeight: "bold",
            position: "right",
            distance: -5,
            formatter: "{b}",
          },
          type: "scatter",
          name: "bus",
          data: [],
        },
      ],
      stateAnimation: {
        duration: 500,
      },
    },
    timer: {},
    second: 0,
  }),
  methods: {
    setEchartsOption(appendOption) {
      this.echartsOption = appendOption;
    },
    //加载线路与站点信息
    load_data() {
      axios
        .all([
          axios.get("/bus_echart/line1.json"),
          axios.get("/bus_echart/line2.json"),
          axios.get("/bus_echart/stop1.json"),
          axios.get("/bus_echart/stop2.json"),
        ])
        .then(
          axios.spread((line1,  line2, stop1, stop2) => {
            const line1data = line1.data;
            const line2data = line2.data;
            const stop1data = stop1.data;
            const stop2data = stop2.data;
            this.lines = [line1data, line2data];
            this.stops1 = stop1data;
            this.stops2 = stop2data;
            const line1dir1 = stop1data.features.map((f) => {
              return {
                value: [
                  1,
                  nearestPointOnLine(line1data["features"][0], f).properties
                    .location * 1000,
                ],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: { color: "#ff881b", opacity: 1 },
              };
            });
            const line1dir2 = stop1data.features.map((f) => {
              return {
                value: [
                  0,
                  length(line1data["features"][0]) * 1000 -
                    nearestPointOnLine(line1data["features"][0], f).properties
                      .location *
                      1000,
                ],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: { color: "#ff881b", opacity: 1 },
              };
            });
            const line2dir1 = stop2data.features.map((f) => {
              return {
                value: [
                  3,
                  nearestPointOnLine(line2data["features"][0], f).properties
                    .location * 1000,
                ],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: { color: "#379ff4", opacity: 1 },
              };
            });
            const line2dir2 = stop2data.features.map((f) => {
              return {
                value: [
                  2,
                  length(line2data["features"][0]) * 1000 -
                    nearestPointOnLine(line2data["features"][0], f).properties
                      .location *
                      1000,
                ],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: { color: "#379ff4", opacity: 1 },
              };
            });
            const echartsOptionAppend = {
              series: [
                {
                  data: [
                    ...line1dir1,
                    ...line1dir2,
                    ...line2dir1,
                    ...line2dir2,
                  ],
                },
                {
                  data: [
                    {
                      coords: [
                        [0, 0],
                        [0, length(line1data["features"][0]) * 1000],
                      ],
                      lineStyle: { color: "#ff881b", width: 2, opacity: 1 },
                    },
                    {
                      coords: [
                        [1, 0],
                        [1, length(line1data["features"][0]) * 1000],
                      ],
                      lineStyle: { color: "#ff881b", width: 2, opacity: 1 },
                    },
                    {
                      coords: [
                        [2, 0],
                        [2, length(line2data["features"][0]) * 1000],
                      ],
                      lineStyle: { color: "#379ff4", width: 2, opacity: 1 },
                    },
                    {
                      coords: [
                        [3, 0],
                        [3, length(line2data["features"][0]) * 1000],
                      ],
                      lineStyle: { color: "#379ff4", width: 2, opacity: 1 },
                    },
                  ],
                },
              ],
            };
            this.setEchartsOption(echartsOptionAppend);
          })
        );
    },
    updateBusPos() {
      if (this.lines.length > 0) {
        axios
          .get("https://bus.sustcra.com/api/v2/monitor_osm/")
          .then((response) => {
            const res = response.data;
            const busData = res
              .filter((f) => (f.is_operating == 1))
              .map((f) => {
                //哪条线路
                let thisRoute = 0;
                if (f.route_code == "XYBS2") {
                  thisRoute = 1;
                } else if (f.route_code == "XYBS1") {
                  thisRoute = 0;
                }

                //线上最近点
                const mcp = point([f.lng, f.lat]);
                let thisLine = this.lines[thisRoute]["features"][0];
                let p_nearest = nearestPointOnLine(thisLine, mcp);
                let p_nearest_loc = p_nearest.properties.location;

                let dist = p_nearest_loc * 1000
                if (f.route_dir>0){
                  dist = length(thisLine) * 1000 - p_nearest_loc * 1000;
                }
                
                //如果距离大于50米，则不显示
                if ((p_nearest.properties.dist * 1000 > 50)|(dist<50)) {
                  return {
                    value: [-1, 0],
                    name: f.id,
                    itemStyle: { color: "#222", show: false },
                    symbol: "image://https://bus.sustcra.com/bus-top-view.png",
                    symbolSize: 30,
                    symbolRotate: 180,
                    speed: f.speed,
                  };
                }
                return {
                  value: [1- f.route_dir + thisRoute * 2, dist],
                  name: f.id,
                  itemStyle: { color: "#222" },
                  symbol: "image://https://bus.sustcra.com/bus-top-view.png",
                  symbolSize: 30,
                  symbolRotate: 180,
                  speed: f.speed,
                };
              });
            this.historyBusData = busData.filter(
              (p) => typeof p != "undefined"
            );
            const echartsOptionAppend = { series: [{}, {}, { data: busData }] };
            this.setEchartsOption(echartsOptionAppend);
          });
      }
    },
    refresh() {
      this.second += 1;
      //5秒校准一次正确位置
      if (this.second % 10 === 0) {
        this.updateBusPos();
      }else{
       if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(pos => {
            let lat = pos.coords.latitude
            let lng = pos.coords.longitude
   
            //标记出最近的站点
            const p = point([lng, lat])
            const nearest_line1 = nearestPoint(p, this.stops1);
            const line1_pos_dir1 = nearestPointOnLine(this.lines[0]['features'][0], nearest_line1).properties.location * 1000
            const line1_pos_dir2 = length(this.lines[0]['features'][0]) * 1000 - nearestPointOnLine(this.lines[0]['features'][0], nearest_line1).properties.location * 1000
            const nearest_line2 = nearestPoint(p, this.stops2);

            const line2_pos_dir1 = nearestPointOnLine(this.lines[1]['features'][0], nearest_line2).properties.location * 1000
            const line2_pos_dir2 = length(this.lines[1]['features'][0]) * 1000 - nearestPointOnLine(this.lines[1]['features'][0], nearest_line2).properties.location * 1000
            //计算下一趟车大概多久到
            //0
            const buspos_0 = this.historyBusData.filter(f => (f.value[0] === 0) && (f.value[1] <= line1_pos_dir2)).map(f => parseInt((line1_pos_dir2 - f.value[1]) / 250))
            //1
            const buspos_1 = this.historyBusData.filter(f => (f.value[0] === 1) && (f.value[1] <= line1_pos_dir1)).map(f => parseInt((line1_pos_dir1 - f.value[1]) / 250))
            //2
            const buspos_2 = this.historyBusData.filter(f => (f.value[0] === 2) && (f.value[1] <= line2_pos_dir2)).map(f => parseInt((line2_pos_dir2 - f.value[1]) / 250))
            //3
            const buspos_3 = this.historyBusData.filter(f => (f.value[0] === 3) && (f.value[1] <= line2_pos_dir1)).map(f => parseInt((line2_pos_dir1 - f.value[1]) / 250))
            const bustext_0 = buspos_0.length > 0 ? '\n 约' + Math.min(...buspos_0) + '分钟' : ''
            const bustext_1 = buspos_1.length > 0 ? '\n  约' + Math.min(...buspos_1) + '分钟' : ''
            const bustext_2 = buspos_2.length > 0 ? '\n   约' + Math.min(...buspos_2) + '分钟' : ''
            const bustext_3 = buspos_3.length > 0 ? '\n    约' + Math.min(...buspos_3) + '分钟' : ''
            let data1 = [];
            let data2 = [];

            data1 = [
              {
                name: '最近' + bustext_1,
                itemStyle: { color: '#ff881b' },
                coord: [1, line1_pos_dir1]
              },
              {
                name: '最近' + bustext_0,
                itemStyle: { color: '#ff881b' },
                coord: [0, line1_pos_dir2]
              }]

            data2 = [{
              name: '最近' + bustext_3,
              itemStyle: { color: '#379ff4' },
              coord: [3, line2_pos_dir1]
            },
            {
              name: '最近' + bustext_2,
              itemStyle: { color: '#379ff4' },
              coord: [2, line2_pos_dir2]
            }
            ]
            this.setEchartsOption({
              series: [{
                markPoint: {
                  symbol: 'arrow',
                  symbolRotate: -90,
                  symbolOffset: ['-50%', 0],
                  symbolSize: 10,
                  label: {
                    fontSize: 10,
                    show: true,
                    color: '#666',
                    position: 'left', formatter: '{b}'
                  },
                  data: [
                    ...data1,
                    ...data2
                  ]
                }
              }, {}, {}]
            })
          })
        }
      }
    },
  },
  watch: {
    lines: "updateBusPos",
  },
  mounted() {
    this.load_data();
    this.updateBusPos();
    this.timer = setInterval(() => {
      this.refresh();
    }, 500); //0.5秒刷新一次位置，每10次刷新中，9次为推测的位置，1次为抓取的位置
  },
  unmounted() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped>
.chart {
  height: 70vh;
  width: 100%;
}

.visitor-badge {
  display: none;
}
</style>
