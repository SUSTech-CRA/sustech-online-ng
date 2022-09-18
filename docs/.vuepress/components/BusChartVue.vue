<template>
  <v-chart class="chart" :option="echartsOption" :autoresize="true"/>
  <img src="https://visitor-badge.laobi.icu/badge?page_id=nikebus" alt="visitor badge"
       class="visitor-badge"/>
</template>

<script>
import axios from 'axios';
import {along, length, nearestPoint, nearestPointOnLine, point, rhumbBearing} from '@turf/turf'
import ECharts from 'vue-echarts'
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {
  ScatterChart,
  LinesChart
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  // LegendComponent,
  GridComponent,
} from "echarts/components";

use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  // LegendComponent,
  GridComponent,
  ScatterChart,
  LinesChart
]);

export default {
  name: 'BusChartVue',
  components: {
    'v-chart': ECharts,
  },
  data: () => ({
    bus_plate_hash: {
      "8371": {"plate": "粤BDF371", 'route': 1},//确定
      "8421": {"plate": "粤BDF421", 'route': 1},//确定
      "8471": {"plate": "粤BDF471", 'route': 1},//确定
      "8147": {"plate": "粤BDF147", 'route': 1},//确定
      "8335": {"plate": "粤BDF335", 'route': 1},//确定
      "8345": {"plate": "粤BDF345", 'route': 1},//确定
      "8365": {"plate": "粤BDF365", 'route': 1},//确定
      "8411": {"plate": "粤BDF411", 'route': 1},//确定
      "8447": {"plate": "粤BDE447", 'route': 1},//确定
      "18447": {"plate": "粤BDF447", 'route': 1},//确定
      "8458": {"plate": "粤BDF458", 'route': 1},//确定
      "8267": {"plate": "粤BDF267", 'route': 1},
      "8338": {"plate": "粤BDF338", 'route': 1},
      "8330": {"plate": "粤BDF330", 'route': 1},
      "298": {"plate": "粤BDF298", 'route': 1},
      "363": {"plate": "粤BDF363", 'route': 1},
      "8040": {"plate": "粤BDF040", 'route': 1},
      "8430": {"plate": "粤BDF430", 'route': 1},
      "8470": {"plate": "粤BDF470", 'route': 1}//确定
    },
    lines: [],
    stops1: [],
    stops2: [],
    historyBusData: [],
    echartsOption: {
      tooltip: {
        show: false,
      },
      title: [{
        // text: '南科大校巴实时位置',
        subtext: 'By bilibili@交通数据小旭学长\nGitHub@ni1o1',
        sublink: 'https://github.com/ni1o1/nikebus',
        textAlign: 'right',
        bottom: '5%',
        left: '95%'
      }],
      grid: [{
        top: '10%',
        bottom: '0%',
        left: '0%',
        right: '3%',
      }],
      yAxis: [{
        inverse: true,
        min: -100,
        max: 4500,
        type: 'value',
        boundaryGap: false,
        show: false,
        splitLine: {
          show: false
        }
      }],
      xAxis: [{
        position: 'top',
        verticalAlign: 'top',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {interval: 0},
        type: 'category',
        data: ['1号线\n工学院方向',
          '1号线\n欣园方向',
          '2号线\n科研楼方向',
          '2号线\n欣园方向'],
        splitLine: {
          show: false
        }

      }],
      series: [{
        type: 'scatter',
        label: {
          fontSize: 10,
          show: true,
          color: '#999',
          position: 'right',
          formatter: '{b}'
        },
        data: []
      }, {
        type: 'lines',
        coordinateSystem: 'cartesian2d',
        data: []
      }, {
        label: {
          fontSize: 11,
          show: true,
          fontWeight: 'bold',
          position: 'right',
          distance: -5,
          formatter: '{b}'
        },
        type: 'scatter',
        name: 'bus',
        data: []
      }
      ],
      stateAnimation: {
        duration: 500
      }
    },
    timer: {},
    second: 0
  }),
  methods: {
    setEchartsOption(appendOption) {
      this.echartsOption = Object.assign({}, this.echartsOption, appendOption)
    },
    //加载线路与站点信息
    load_data() {
      axios.all([
        axios.get('/bus_echart/line1.json'),
        axios.get('/bus_echart/line1_dir2.json'),
        axios.get('/bus_echart/line2.json'),
        axios.get('/bus_echart/stop1.json'),
        axios.get('/bus_echart/stop2.json'),
      ])
          .then(axios.spread((line1, line1_dir2, line2, stop1, stop2) => {
            const line1data = line1.data
            const line1data2 = line1_dir2.data
            const line2data = line2.data
            const stop1data = stop1.data
            const stop2data = stop2.data
            this.lines = [line1data, line2data, line1data2];
            this.stops1 = stop1data;
            this.stops2 = stop2data;
            const line1dir1 = stop1data.features.map(f => {
              return {
                value: [1, nearestPointOnLine(line1data['features'][0], f).properties.location * 1000],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: {color: '#ff881b', opacity: 1}
              }
            })
            const line1dir2 = stop1data.features.map(f => {
              return {
                value: [0, length(line1data2['features'][0]) * 1000 - nearestPointOnLine(line1data2['features'][0], f).properties.location * 1000],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: {color: '#ff881b', opacity: 1}
              }
            })
            const line2dir1 = stop2data.features.map(f => {
              return {
                value: [3, nearestPointOnLine(line2data['features'][0], f).properties.location * 1000],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: {color: '#379ff4', opacity: 1}
              }
            })
            const line2dir2 = stop2data.features.map(f => {
              return {
                value: [2, length(line2data['features'][0]) * 1000 - nearestPointOnLine(line2data['features'][0], f).properties.location * 1000],
                name: f.properties.name,
                symbolSize: 8,
                itemStyle: {color: '#379ff4', opacity: 1}
              }
            })
            const echartsOptionAppend = {
              series: [{
                data: [...line1dir1, ...line1dir2, ...line2dir1, ...line2dir2]
              }, {
                data: [
                  {
                    coords: [[0, 0], [0, length(line1data2['features'][0]) * 1000]],
                    lineStyle: {color: '#ff881b', width: 2, opacity: 1}
                  },
                  {
                    coords: [[1, 0], [1, length(line1data['features'][0]) * 1000]],
                    lineStyle: {color: '#ff881b', width: 2, opacity: 1}
                  },
                  {
                    coords: [[2, 0], [2, length(line2data['features'][0]) * 1000]],
                    lineStyle: {color: '#379ff4', width: 2, opacity: 1}
                  },
                  {
                    coords: [[3, 0], [3, length(line2data['features'][0]) * 1000]],
                    lineStyle: {color: '#379ff4', width: 2, opacity: 1}
                  }
                ]
              }]
            }
            this.setEchartsOption(echartsOptionAppend)
          }));
    },
    updateBusPos() {
      if (this.lines.length > 0) {
        axios.get('https://bus.sustcra.com/api/v2/monitor_osm/').then(response => {
          const res = response.data
          const busData = res.filter(f => f.it == 0).map(f => {
                //哪条线路
                let thisRoute = 0
                if (f.route_code == 202) {
                  thisRoute = 1
                }
                //判断是在哪个方向上
                const mcp = point([f.lng, f.lat])
                let thisLine = this.lines[thisRoute]['features'][0]
                //线上最近点
                let p_nearest = nearestPointOnLine(thisLine, mcp)
                let p_nearest_loc = p_nearest.properties.location
                //线上最近点+1米处的点
                const p_next = along(thisLine, p_nearest_loc + 0.0001);
                //计算切线角度
                let bearing = rhumbBearing(p_nearest, p_next);
                if (bearing < 0) {
                  bearing += 360
                }
                //通过车辆方向角判断车辆行进方向
                let route_dir = 2
                const angle = parseInt(f.course) - parseInt(bearing)
                if ((angle < 20) && (angle > -20)) {
                  route_dir = 1
                  return {
                    value: [route_dir + thisRoute * 2, p_nearest_loc * 1000],
                    name: this.bus_plate_hash[f.id].plate, itemStyle: {color: '#222'},
                    symbol: 'image://https://bus.sustcra.com/bus-top-view.png',
                    symbolSize: 30,
                    symbolRotate: 180,
                    speed: f.speed
                  }
                } else if ((angle < -160) || (angle > 160)) {
                  route_dir = 0
                  let dist = length(thisLine) * 1000 - p_nearest_loc * 1000
                  //如果是线路1的另一个方向，则重新计算距离
                  if (thisRoute == 0) {
                    thisLine = this.lines[2]['features'][0]
                    p_nearest = nearestPointOnLine(thisLine, mcp)
                    p_nearest_loc = p_nearest.properties.location
                    dist = length(thisLine) * 1000 - p_nearest_loc * 1000
                  }
                  return {
                    value: [route_dir + thisRoute * 2, dist],
                    name: this.bus_plate_hash[f.id].plate, itemStyle: {color: '#222'},
                    symbol: 'image://https://bus.sustcra.com/bus-top-view.png',
                    symbolSize: 30,
                    symbolRotate: 180,
                    speed: f.speed
                  }
                } else {
                  //从历史信息里找到这辆车的信息
                  if (this.historyBusData.length > 0) {
                    const historyBusData_this = this.historyBusData.filter(p => {
                          if (typeof (p) != 'undefined') {
                            return p.name == this.bus_plate_hash[f.id].plate
                          }
                        }
                    )
                    if (historyBusData_this.length > 0) {
                      return historyBusData_this[0]
                    }
                  }
                }
              }
          )
          this.historyBusData = busData.filter(p => typeof (p) != 'undefined')
          const echartsOptionAppend = {series: [{}, {}, {data: busData}]}
          this.setEchartsOption(echartsOptionAppend)
        })
      }
    },
    refresh() {
      this.second += 1
      //5秒校准一次正确位置
      if (this.second % 10 === 0) {
        this.updateBusPos()
      } else {
        //0.5秒通过速度推测一次车辆的位置
        const newdata = this.historyBusData.map(f => {
          if (typeof (f) != 'undefined') {
            let routedir = 2
            if (f.value[0] == 1) {
              routedir = 0
            }
            if (f.value[0] == 2) {
              routedir = 1
            }
            if (f.value[0] == 3) {
              routedir = 1
            }
            if (f.value[0] == 0) {
              routedir = 2
            }
            let next_dist = f.value[1] + f.speed * 0.5 * 1000 / 7200
            if (next_dist > length(this.lines[routedir]['features'][0]) * 1000
            ) {
              next_dist = length(this.lines[routedir]['features'][0]) * 1000
            }
            return {...f, value: [f.value[0], next_dist]}
          }
        })
        this.historyBusData = newdata.filter(p => typeof (p) != 'undefined');
        this.setEchartsOption({series: [{}, {}, {data: newdata}]})
        //获取定位
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            let lat = pos.coords.latitude,
                lng = pos.coords.longitude;
            //标记出最近的站点
            const p = point([lng, lat])
            const nearest_line1 = nearestPoint(p, this.stops1);
            const line1_pos_dir1 = nearestPointOnLine(this.lines[0]['features'][0], nearest_line1).properties.location * 1000
            const line1_pos_dir2 = length(this.lines[2]['features'][0]) * 1000 - nearestPointOnLine(this.lines[2]['features'][0], nearest_line1).properties.location * 1000
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
                itemStyle: {color: '#ff881b'},
                coord: [1, line1_pos_dir1]
              },
              {
                name: '最近' + bustext_0,
                itemStyle: {color: '#ff881b'},
                coord: [0, line1_pos_dir2]
              }]

            data2 = [{
              name: '最近' + bustext_3,
              itemStyle: {color: '#379ff4'},
              coord: [3, line2_pos_dir1]
            },
              {
                name: '最近' + bustext_2,
                itemStyle: {color: '#379ff4'},
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
    }
  },
  watch: {
    lines: 'updateBusPos'
  },
  mounted() {
    this.load_data();
    this.timer = setInterval(() => {
      this.refresh();
    }, 5000);
  },
  unmounted() {
    clearInterval(this.timer);
  }
}
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
