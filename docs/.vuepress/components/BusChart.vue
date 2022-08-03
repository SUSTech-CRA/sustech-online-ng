<template>
  <!-- <v-chart class="chart" :option="option" /> -->
  <vue-echarts :option="option" style="height: 500px" ref="chart"/>
</template>

<script>
import {VueEcharts} from "vue3-echarts";
import axios from "axios";
import * as turf from '@turf/turf'

export default {
  name: "Echarts",
  components: {
    VueEcharts,
  },
  methods: {
    //更新车辆位置
    updatebuspos() {
      if (lines.length > 0) {
        axios.get('https://bus.sustcra.com/api/v2/monitor_osm/').then(response => {
          const res = response.data
          const busdata = res.filter(f => f.it == 0).map(f => {

                //哪条线路
                let thisroute = 0
                if (f.route_code == 202) {
                  thisroute = 1
                }
                //判断是在哪个方向上
                const mcp = turf.point([f.lng, f.lat])
                let thisline = this.lines[thisroute]['features'][0]
                //线上最近点
                let p_nearest = turf.nearestPointOnLine(thisline, mcp)
                let p_nearest_loc = p_nearest.properties.location
                //线上最近点+1米处的点
                const p_next = turf.along(thisline, p_nearest_loc + 0.0001);
                //计算切线角度
                let bearing = turf.rhumbBearing(p_nearest, p_next);
                if (bearing < 0) {
                  bearing += 360
                }
                //通过车辆方向角判断车辆行进方向
                let route_dir = 2
                const angle = parseInt(f.course) - parseInt(bearing)
                if ((angle < 20) && (angle > -20)) {
                  route_dir = 1
                  return {
                    value: [route_dir + thisroute * 2, p_nearest_loc * 1000],
                    name: this.bus_plate_hash[f.id].plate, itemStyle: {color: '#222'},
                    symbol: 'image://https://bus.sustcra.com/bus-top-view.png',
                    symbolSize: 30,
                    symbolRotate: 180,
                    speed: f.speed
                  }
                } else if ((angle < -160) || (angle > 160)) {
                  route_dir = 0
                  let dist = turf.length(thisline) * 1000 - p_nearest_loc * 1000
                  //如果是线路1的另一个方向，则重新计算距离
                  if (thisroute == 0) {
                    thisline = lines[2]['features'][0]
                    p_nearest = turf.nearestPointOnLine(thisline, mcp)
                    p_nearest_loc = p_nearest.properties.location
                    dist = turf.length(thisline) * 1000 - p_nearest_loc * 1000
                  }
                  return {
                    value: [route_dir + thisroute * 2, dist],
                    name: bus_plate_hash[f.id].plate, itemStyle: {color: '#222'},
                    symbol: 'image://https://bus.sustcra.com/bus-top-view.png',
                    symbolSize: 30,
                    symbolRotate: 180,
                    speed: f.speed
                  }
                } else {
                  //从历史信息里找到这辆车的信息
                  if (historybusdata.length > 0) {
                    const historybusdata_this = historybusdata.filter(p => {
                          if (typeof (p) != 'undefined') {
                            return p.name == bus_plate_hash[f.id].plate
                          }
                        }
                    )
                    if (historybusdata_this.length > 0) {
                      return historybusdata_this[0]
                    }
                  }

                }

              }
          )

          this.historybusdata = busdata.filter(p => typeof (p) != 'undefined')
          this.option.series =
          {
            series: [{}, {}, {data: busdata}]
          }
        })
      }
    }
  },
  data() {
    return {
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
      historybusdata: [],
      option: {
        tooltip: {
          show: false,
        },
        /*       title: [{
                text: '南科大校巴实时位置',
                subtext: 'bilibili@交通数据小旭学长'
              }], */
        grid: [{
          top: '13%',
          bottom: '0%',
          left: '3%',
          right: '6%',
        }],
        yAxis: [{
          inverse: true,
          min: -100,
          max: 5000,
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
      }
    }
  },
  mounted() {
    axios.get('/bus_data_ni1o1/line1.json').then(responseline1 => {
      axios.get('/bus_data_ni1o1/line1_dir2.json').then(responseline1_dir2 => {
        axios.get('/bus_data_ni1o1/line2.json').then(responseline2 => {
          axios.get('/bus_data_ni1o1/stop1.json').then(responsestop1 => {
            axios.get('/bus_data_ni1o1/stop2.json').then(responsestop2 => {
              const line1data = responseline1.data
              const line1data2 = responseline1_dir2.data
              const line2data = responseline2.data
              const stop1data = responsestop1.data
              const stop2data = responsestop2.data
              this.lines = [line1data, line2data, line1data2]
              this.stops1 = stop1data
              this.stops2 = stop2data
              const line1dir1 = stop1data.features.map(f => {
                return {
                  value: [1, turf.nearestPointOnLine(line1data['features'][0], f).properties.location * 1000],
                  name: f.properties.name,
                  symbolSize: 8,
                  itemStyle: {color: '#ff881b', opacity: 1}
                }
              })
              const line1dir2 = stop1data.features.map(f => {
                return {
                  value: [0, turf.length(line1data2['features'][0]) * 1000 - turf.nearestPointOnLine(line1data2['features'][0], f).properties.location * 1000],
                  name: f.properties.name,
                  symbolSize: 8,
                  itemStyle: {color: '#ff881b', opacity: 1}
                }
              })
              const line2dir1 = stop2data.features.map(f => {
                return {
                  value: [3, turf.nearestPointOnLine(line2data['features'][0], f).properties.location * 1000],
                  name: f.properties.name,
                  symbolSize: 8,
                  itemStyle: {color: '#379ff4', opacity: 1}
                }
              })
              const line2dir2 = stop2data.features.map(f => {
                return {
                  value: [2, turf.length(line2data['features'][0]) * 1000 - turf.nearestPointOnLine(line2data['features'][0], f).properties.location * 1000],
                  name: f.properties.name,
                  symbolSize: 8,
                  itemStyle: {color: '#379ff4', opacity: 1}
                }
              })
              this.option.series = [{
                data: [...line1dir1, ...line1dir2, ...line2dir1, ...line2dir2]
              }, {
                data: [
                  {
                    coords: [[0, 0], [0, turf.length(line1data2['features'][0]) * 1000]],
                    lineStyle: {color: '#ff881b', width: 2, opacity: 1}
                  },
                  {
                    coords: [[1, 0], [1, turf.length(line1data['features'][0]) * 1000]],
                    lineStyle: {color: '#ff881b', width: 2, opacity: 1}
                  },
                  {
                    coords: [[2, 0], [2, turf.length(line2data['features'][0]) * 1000]],
                    lineStyle: {color: '#379ff4', width: 2, opacity: 1}
                  },
                  {
                    coords: [[3, 0], [3, turf.length(line2data['features'][0]) * 1000]],
                    lineStyle: {color: '#379ff4', width: 2, opacity: 1}
                  }
                ]
              }]
            })
          })
        })
      })
    })
  },
};
</script>

<style scoped>
.chart {
  height: 100vh;
}
</style>

<style>
body {
  margin: 0;
}
</style>