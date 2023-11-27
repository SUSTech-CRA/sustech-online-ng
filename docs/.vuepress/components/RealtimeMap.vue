<template>

  <div class="map-container" ref="myMap"></div>
  <span>Time drift: {{ time_difference }} sec.</span>
  <!--  <div id="map-style-menu">-->
  <!--    <input id="osm-street" type="radio" name="rtoggle" value="light">-->
  <!--    <label for="osm-street">light</label>-->
  <!--    <input id="osm-blue" type="radio" name="rtoggle" value="dark">-->
  <!--    <label for="osm-blue">dark</label>-->
  <!--  </div>-->
</template>

<script>
import maplibre from 'maplibre-gl';
import axios from "axios";
import * as turf from '@turf/turf';


export default {
  name: "MyMap",

  data: () => ({
    map_style_url: "https://mirrors.sustech.edu.cn/osm-tile/styles/osm-bright/style.json",
    map_text_colour: "#000000",
    bus_location_data_api: [],
    bus_location_data_display: [],
    bus_plate_hash: {
      "298": {"plate": "粤BDF298"},
      "363": {"plate": "粤BDF363"},
      "8040": {"plate": "粤BDF040"},
      "8147": {"plate": "粤BDF147"},
      "8267": {"plate": "粤BDF267"},
      "8330": {"plate": "粤BDF330"},
      "8335": {"plate": "粤BDF335"},
      "8338": {"plate": "粤BDF338"},
      "8345": {"plate": "粤BDF345"},
      "8365": {"plate": "粤BDF365"},
      "8371": {"plate": "粤BDF371"},
      "8411": {"plate": "粤BDF411"},
      "8421": {"plate": "粤BDF421"},
      "8430": {"plate": "粤BDF430"},
      "8447": {"plate": "粤BDE447"},
      "8458": {"plate": "粤BDF458"},
      "8470": {"plate": "粤BDF470"},
      "8471": {"plate": "粤BDF471"},
      "18447": {"plate": "粤BDF447"}
    },
    geojson_line_1: [[113.99739584160139, 22.610765716856296], [113.99773288526481, 22.610577804306548], [113.99824514560808, 22.609808813574297], [113.99899240486543, 22.608186143427105], [113.99899684055141, 22.608138484311375], [113.99876376465981, 22.606584405046835], [113.9987454049567, 22.606539955896604], [113.9983737643716, 22.606046923598996], [113.99771305207776, 22.60586005946536], [113.996462081496, 22.60628164325351], [113.99540699384544, 22.60655007340282], [113.99537457846512, 22.606374521317747], [113.99533345805837, 22.60631869878032], [113.99491868014185, 22.60615102642152], [113.99446803578164, 22.605922922486105], [113.993628105381, 22.605432281601264], [113.99361283376653, 22.605399929510398], [113.99427914343141, 22.604297776694622], [113.99455101208882, 22.604066349285663], [113.99481121659123, 22.60381079129223], [113.99549648383878, 22.60304833084697], [113.99570726599393, 22.60298417975627], [113.99623267681147, 22.60298349183956], [113.99686127008054, 22.603078201644227], [113.9977201426685, 22.603401409146592], [113.99788215074415, 22.603408536156227], [113.99794417914393, 22.60338145776082], [113.9980463074806, 22.603268395934986], [113.99816665521513, 22.602614977726315], [113.99835030416712, 22.60216721735362], [113.99856193554633, 22.601842951121434], [113.99881928525701, 22.6015215956419], [113.9988344317295, 22.601194082723367], [113.99895072783376, 22.600790214181995], [113.9990602569799, 22.600602634774226], [113.99921879840926, 22.600476730796977], [113.99919877407567, 22.60043325336671], [113.99802751236375, 22.600038565633355], [113.99775839514615, 22.599792681543633], [113.99730187808832, 22.598960946075003], [113.99590977592047, 22.5977773063799], [113.99576459924215, 22.59751983095157], [113.99543299558397, 22.59717440812865], [113.9951938686417, 22.5966914370548], [113.99501583215859, 22.59639577584673], [113.99463229185628, 22.596104860560743], [113.99420385593578, 22.595969591352997], [113.99378584507669, 22.595967937443213], [113.99320018866534, 22.59621976224022], [113.99265363550316, 22.596738860232236], [113.99200633643709, 22.59716671060916], [113.99157366427197, 22.5971462468509], [113.99088482201618, 22.596941863390235], [113.99038484213679, 22.596998494112995], [113.99032102143205, 22.597043977909916], [113.99019829041364, 22.59753578294312], [113.99030286538937, 22.59863964935582], [113.99048378356784, 22.59907317753902], [113.99052006299269, 22.59911721823263], [113.99075599101839, 22.599276010611053], [113.99126127611241, 22.599535900836155], [113.9917686585336, 22.6000105337692], [113.99191211157755, 22.60053218120178], [113.99183362959826, 22.601016496848214], [113.99144872111891, 22.60153952301182], [113.99077751816642, 22.602118998056795], [113.99043902651476, 22.60239072790739], [113.99010219314502, 22.60332391993846]],
    geojson_line_2: [[113.9973489079054, 22.61067741494136], [113.9976555155949, 22.61051444868976], [113.9981618912118, 22.60975341767644], [113.9988979465801, 22.60815331611633], [113.9986648706885, 22.60659923685179], [113.9983207115444, 22.60613169032316], [113.9977156537446, 22.60596002561628], [113.9964905851169, 22.6063775771138], [113.9953277666447, 22.60667341560261], [113.995278497141, 22.60640224097063], [113.9934784038899, 22.60548092977822], [113.99386414857948, 22.604784676421257], [113.99419945106074, 22.60426804504929], [113.99385306765333, 22.603677155592816], [113.99298710913483, 22.60350336409337], [113.99279885728298, 22.603280910653833], [113.99233952276445, 22.60296808489611], [113.99204584987558, 22.60262745159568], [113.9915262747645, 22.601612498395962], [113.9917196221943, 22.601431625928], [113.9919172423369, 22.60102266627295], [113.9920105698998, 22.6005318195689], [113.9918969233072, 22.59993661748595], [113.9914596783045, 22.59960492109923]],
    gate_geojson: {},
    stations_geojson: {
      "type": "FeatureCollection", "features": [
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99020, 22.60336]},
          "properties": {"name": "工学院 COE"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99153, 22.599643]},
          "properties": {"name": "科研楼 Research Building"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.990399, 22.597132]},
          "properties": {"name": "七号门 Gate7"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.992403, 22.597011]},
          "properties": {"name": "行政楼 Administration Building"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99440,22.59618]},
          "properties": {"name": "1号门 Gate1 (下行DN)"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99381,22.59604]},
          "properties": {"name": "1号门 Gate1 (上行UP)"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99585,22.59788]},
          "properties": {"name": "2号门 Gate2"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99878,22.60041]},
          "properties": {"name": "3号门 Gate3"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.998329, 22.601975]},
          "properties": {"name": "专家公寓 Guest Houses"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.997811, 22.603325]},
          "properties": {"name": "教工餐厅 Faculty Cafteria"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.995981, 22.60293]},
          "properties": {"name": "社康中心 C.Health.Center"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.993824, 22.604854]},
          "properties": {"name": "学生宿舍 Stu. Dormitories"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.995238, 22.606518]},
          "properties": {"name": "荔园 Lychee Hill"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.996732, 22.606278]},
          "properties": {"name": "创园 Chuang Yuan"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.998372, 22.606102]},
          "properties": {"name": "慧园 Hui Yuan"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.997473, 22.610667]},
          "properties": {"name": "欣园 Joy Highland"}
        }
      ]
    },
    bus_marker_arr: [],
    map: [],
    time_difference: 0,
    timer: {}
  }),

  async created() {
    //fetch bus location (current no need)
    // const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v1/bus/monitor_osm/`)
    // this.bus_location_data_api = realtime_location_api_data.data;
    // console.log("fetch complete")

    // fetch geojson
    const bldg_geojson = await axios.get(`https://bus.sustcra.com/geojson/sustech_bldg.json`)
    this.bldg_geojson = bldg_geojson.data;
    const gate_geojson = await axios.get(`https://bus.sustcra.com/geojson/sustech_gate.json`)
    this.gate_geojson = gate_geojson.data;
    console.log("Fetch geojson of sustech complete")

  },


  //update data
  methods: {
    async fetch_bus() {
      const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v2/monitor_osm/`)
      this.bus_location_data_api = realtime_location_api_data.data;
      const d = new Date();
      console.log("bus location data fetched at " + parseInt(d.getTime() / 1000,));
      //console log the diff of report time and display time
      if (typeof this.bus_location_data_api[0].time_mt != "undefined") {
        this.time_difference = parseInt(d.getTime() / 1000 - this.bus_location_data_api[0].time_mt);
        // log current time and report time
        console.log("The clock drift is " + this.time_difference + " seconds");
      }
      this.update_location()
    },
    calculateBusAngle(startLat, startLng, destLat, destLng) {
      // 创建 Turf.js 的点
      const startPoint = turf.point([startLng, startLat]);
      const endPoint = turf.point([destLng, destLat]);

      // 计算方位角
      const bearing = turf.rhumbBearing(startPoint, endPoint);

      // Turf.js 返回的方位角是从北顺时针的角度
      return bearing;
    },
    findNearestPointOnSegment(point, segmentStart, segmentEnd) {
      const A = point[0] - segmentStart[0];
      const B = point[1] - segmentStart[1];
      const C = segmentEnd[0] - segmentStart[0];
      const D = segmentEnd[1] - segmentStart[1];

      const dot = A * C + B * D;
      const len_sq = C * C + D * D;
      const param = (len_sq !== 0) ? dot / len_sq : -1;

      let xx, yy;

      if (param < 0) {
        xx = segmentStart[0];
        yy = segmentStart[1];
      } else if (param > 1) {
        xx = segmentEnd[0];
        yy = segmentEnd[1];
      } else {
        xx = segmentStart[0] + param * C;
        yy = segmentStart[1] + param * D;
      }

      return [xx, yy];
    },
    findNearestSegment(busLocation, geojsonLine) {
      let closestSegmentStart = geojsonLine[0];
      let closestSegmentEnd = geojsonLine[1];
      let minDistance = Number.MAX_VALUE;

      // 遍历 GeoJSON 线路的每个线段
      for (let i = 0; i < geojsonLine.length - 1; i++) {
        const segmentStart = geojsonLine[i];
        const segmentEnd = geojsonLine[i + 1];
        const nearestPoint = this.findNearestPointOnSegment(busLocation, segmentStart, segmentEnd);
        const distance = this.calculateDistance(busLocation, nearestPoint);

        // 更新最近线段
        if (distance < minDistance) {
          minDistance = distance;
          closestSegmentStart = segmentStart;
          closestSegmentEnd = segmentEnd;
        }
      }

      // 确保线段的顺序与 GeoJSON 中的一致
      return [closestSegmentStart, closestSegmentEnd];
    },
    calculateDistance(point1, point2) {
      return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
    },
    update_location() {
      // 清除所有现有的标记
      this.bus_marker_arr.forEach((marker) => marker.remove());
      this.bus_marker_arr = [];

      // 重新计算并添加新的标记
      for (let i = 0; i < this.bus_location_data_api.length; i++) {
        const busData = this.bus_location_data_api[i];
        // 如果当前时间 - 报告时间 < 300秒，则显示
        if ((new Date().getTime() / 1000) - busData.time_mt < 150) {
          const busLocation = [busData.lng, busData.lat];
          let busHeadingAngle = 0;
          const isRoute1 = busData.route_code.slice(-1) === '1';
          busData.route_geojson = isRoute1 ? this.geojson_line_1 : this.geojson_line_2;
          const closestSegment = this.findNearestSegment(busLocation, busData.route_geojson);
          busHeadingAngle = this.calculateBusAngle(
              closestSegment[0][1], closestSegment[0][0],
              closestSegment[1][1], closestSegment[1][0]
          );
          busHeadingAngle = busData.route_dir === 1 ? busHeadingAngle : busHeadingAngle - 180;

          // 创建标记元素
          const busMarker = document.createElement('div');
          busMarker.className = 'marker';
          busMarker.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          busMarker.style.width = '30px';
          busMarker.style.height = '30px';
          busMarker.style.backgroundSize = 'cover';
          busMarker.style.cursor = "pointer";

          // 创建并添加标记到地图
          const marker = new maplibre.Marker({ element: busMarker })
              .setLngLat(busLocation)
              .setPopup(this.createPopup(busData)) // 创建并设置弹窗
              .setRotation(parseInt(busHeadingAngle))
              .addTo(this.map);

          // 保存新标记以便后续清除
          this.bus_marker_arr.push(marker);
        }
      }
    },

    createPopup(busData) {
      // 创建弹窗内容
      const routeDirText = busData.route_dir === 0 ? '上行 UP' : '下行 DOWN';
      const LineColour = busData.route_code.slice(-1) === '1' ? '#f7911d': '#29abe2';
      const htmlContent = `
    <div style="line-height: 1.2;">
      <p class="car-plate" style="margin: 0; line-height: 1.2;">
        粤B${busData.id.slice(2,)}
      </p>
      <p style="margin: 0; line-height: 1.2;">
        ${busData.speed} km/h
      </p>
      <p style="margin: 0; line-height: 1.4;">
        <span style="background-color: ${LineColour}; color: white; padding: 2px 4px; border-radius: 3px;"><b>Line ${busData.route_code.slice(-1)} 号线</b></span>
      </p>
      <p style="margin: 0; line-height: 1.2;">
        <b>${routeDirText}</b>
      </p>
      <p style="margin: 0; line-height: 1.2;">
        下站: <b>${busData.next_station_string}</b>
      </p>
    </div>
  `;
      return new maplibre.Popup({ offset: 20 }).setHTML(htmlContent);
    },
    async refresh() {
      await this.fetch_bus();
    },


  },

  async mounted() {
    const initialState = {
      lng: 113.99373,
      lat: 22.60308,
      zoom: 14,
    };

    const location_data = {
      bus_location_data: this.bus_location_data,
      geojson_line_1: this.geojson_line_1,
      geojson_line_2: this.geojson_line_2
    }

    //determine day or night
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const userPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (await userPrefersDark) {
      console.log("dark mode enabled.")
      this.map_text_colour = "#FFFFFF"
      this.map_style_url = "https://mirrors.sustech.edu.cn/osm-tile/styles/osm-blue/style.json";
    }

    this.map = new maplibre.Map({
      container: this.$refs.myMap,
      style: this.map_style_url,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });
    var nav = new maplibre.NavigationControl();
    this.map.addControl(nav, 'top-left');
    this.map.addControl(new maplibre.FullscreenControl(), 'top-left');

    class MapLockControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group';

        const button = this._createButton('interaction-lock')
        this._container.appendChild(button);
        // 初始化锁定按钮，默认为锁定
        button.click();
        return this._container;
      }
      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
      _createButton(className) {
        const el = window.document.createElement('button')
        el.className = className;
        el.isInteractionEnabled = true;

        el.addEventListener('click', (e) => {
          el.isInteractionEnabled = !el.isInteractionEnabled;
          if (el.isInteractionEnabled) {
            this._map.dragPan.enable();
            this._map.boxZoom.enable();
            this._map.doubleClickZoom.enable();
            this._map.touchZoomRotate.enable();
            this._map.scrollZoom.enable();
            el.innerHTML = '<span class="maplibregl-ctrl-icon mapboxgl-ctrl-icon map-interaction-allow" aria-hidden="true"></span>';
          } else {
            this._map.dragPan.disable();
            this._map.boxZoom.disable();
            this._map.doubleClickZoom.disable();
            this._map.touchZoomRotate.disable();
            this._map.scrollZoom.disable();
            el.innerHTML = '<span class="maplibregl-ctrl-icon mapboxgl-ctrl-icon map-interaction-lock" aria-hidden="true"></span>';
          }
          e.preventDefault();
          e.stopPropagation();
        }, false)
        return el;
      }
    }
    const mapLockControl = new MapLockControl();
    this.map.addControl(mapLockControl, 'top-left');

    // Add geolocate control to the map.
    this.map.addControl(
        new maplibre.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          // When active the map will receive updates to the device's location as it changes.
          trackUserLocation: true,
          // Draw an arrow next to the location dot to indicate which direction the device is heading.
          showUserHeading: true
        })
    );


    this.map.on('load', () => {
      this.map.addSource('line1', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': location_data.geojson_line_1
          }
        }
      });

      this.map.addSource('line2', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': location_data.geojson_line_2
          }
        }
      });

      this.map.addLayer({
        'id': 'line1',
        'type': 'line',
        'source': 'line1',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#f7911d',
          'line-width': 3
          // 'line-dasharray': [1, 2]
        }
      });

      this.map.addLayer({
        'id': 'line2',
        'type': 'line',
        'source': 'line2',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#29abe2',
          'line-width': 3
          // 'line-dasharray': [1, 2]
        }
      });

      //add station

      this.map.loadImage(
          'https://bus.sustcra.com/station_icon.png',
          (error, image) => {
            if (error) throw error;
            this.map.addImage('bus-station', image);


            //image of buildings
            this.map.loadImage(
                'https://bus.sustcra.com/bldg_icon.png',
                (error, image) => {
                  this.map.addImage('bldg-icon', image)
                });

            //image of gates
            this.map.loadImage(
                'https://bus.sustcra.com/gate_icon.png',
                (error, image) => {
                  this.map.addImage('gate-icon', image)
                });


            this.map.addSource('stations', {
              'type': 'geojson',
              'data': this.stations_geojson
            });

            this.map.addSource('bldgs', {
              'type': 'geojson',
              'data': this.bldg_geojson
            });

            this.map.addSource('gates', {
              'type': 'geojson',
              'data': this.gate_geojson
            });

            this.map.addLayer({
              'id': 'bus-station',
              'type': 'symbol',
              'source': 'stations',
              'layout': {
                'icon-size': 0.075,
                'icon-image': 'bus-station',
                'text-field': ['get', 'name'],
                // 'text-font': [
                //   'Open Sans Semibold',
                //   'Arial Unicode MS Bold'
                // ],
                'text-size': 10,
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
              },
              "paint": {
                "text-color": this.map_text_colour
              },
              // 'paint': {
              //   'circle-radius': 6,
              //   'circle-color': '#B42222'
              // },
              'filter': ['==', '$type', 'Point']
            });

            this.map.addLayer({
              'id': 'bldgs',
              'type': 'symbol',
              'source': 'bldgs',
              'layout': {
                'icon-size': 0.02,
                'icon-image': 'bldg-icon',
                'text-field': ['get', 'name'],
                'text-size': 9,
                'text-offset': [0, 0.3],
                'text-anchor': 'top'
              },
              "paint": {
                "text-color": this.map_text_colour
              },
              'filter': ['==', '$type', 'Point']
            });

            this.map.addLayer({
              'id': 'gates',
              'type': 'symbol',
              'source': 'gates',
              'layout': {
                'icon-size': 0.05,
                'icon-image': 'gate-icon',
                'text-field': ['get', 'name'],
                'text-size': 10,
                'text-offset': [0, 0.6],
                'text-anchor': 'top'
              },
              "paint": {
                "text-color": this.map_text_colour
              },
              'filter': ['==', '$type', 'Point']
            });


          });


    });


    await this.fetch_bus();

    //refresh timer

    this.timer = setInterval(() => {
      this.refresh();
    }, 5000);


  },

  async unmounted() {
    clearInterval(this.timer);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="maplibre-gl/dist/maplibre-gl.css">
</style>
<style scoped>
/* @import 'https://code.bdstatic.com/npm/maplibre-gl@1.15.2/dist/maplibre-gl.css'; */
/* @import 'maplibre-gl/dist/maplibre-gl.css'; */
/* https://webpack.js.org/loaders/sass-loader/#resolving-import-at-rules */

.map-container {
  height: 400px;
  width: 100%;
}

.filter-group {
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-weight: 600;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  border-radius: 3px;
  width: 120px;
  color: #fff;
}

.filter-group input[type='checkbox']:first-child + label {
  border-radius: 3px 3px 0 0;
}

.filter-group label:last-child {
  border-radius: 0 0 3px 3px;
  border: none;
}

.filter-group input[type='checkbox'] {
  display: none;
}

.filter-group input[type='checkbox'] + label {
  background-color: #3386c0;
  display: block;
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
}

.filter-group input[type='checkbox'] + label {
  background-color: #3386c0;
  text-transform: capitalize;
}

.filter-group input[type='checkbox'] + label:hover,
.filter-group input[type='checkbox']:checked + label {
  background-color: #4ea0da;
}

.filter-group input[type='checkbox']:checked + label:before {
  content: '✔';
  margin-right: 5px;
}
</style>

<style>
.map-interaction-allow {
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTI0MzAgNDg5OSBjLTQ5MyAtNTcgLTg3NSAtNDQ1IC05MzAgLTk0OCAtMTMgLTEyMyAtNyAtMTc3IDMwIC0yMzQKMzcgLTU4IDk2IC04NyAxNzYgLTg3IDEzNSAxIDIxNCA4MiAyMTQgMjIzIDAgMTgzIDk5IDM4NCAyNDMgNDkzIDI4MSAyMTMgNjk4CjE2MyA5MDIgLTEwOSA1NyAtNzUgNzYgLTExMSAxMDYgLTIwMiAyMiAtNjcgMjMgLTg0IDI3IC00NTIgbDMgLTM4MiAtOTE4IC0zCi05MTggLTMgLTg1IC0zMSBjLTE2MyAtNTggLTI4OCAtMTY5IC0zNTkgLTMxNyAtNjkgLTE0NSAtNjYgLTkyIC02NiAtMTE0MiAwCi04NzQgMSAtOTU1IDE4IC0xMDE1IDYxIC0yMjYgMjMxIC0zOTYgNDU3IC00NTcgNjAgLTE3IDE1MSAtMTggMTIzMCAtMTggMTA3OQowIDExNzAgMSAxMjMwIDE4IDIyNiA2MSAzOTYgMjMxIDQ1NyA0NTcgMTcgNjAgMTggMTQxIDE4IDEwMjUgbDAgOTYwIC0yNyA4MApjLTQ5IDE0NSAtMTM3IDI2MiAtMjU3IDM0MiAtNjkgNDYgLTE5NiA5MCAtMjgzIDk5IGwtNjggNyAwIDMyOSBjMCAxODEgLTUKMzcyIC0xMSA0MjUgLTU2IDUwNSAtNDM3IDg4NiAtOTQyIDk0MiAtMTA3IDEyIC0xMzkgMTIgLTI0NyAweiBtMTI5NSAtMjE0OApjNTAgLTIyIDkxIC02OSAxMDUgLTExOSA2IC0yNCAxMCAtMzQ3IDEwIC05MzMgbDAgLTg5NSAtMjcgLTU1IGMtMjMgLTQ1IC0zNwotNTkgLTgyIC04MSBsLTU1IC0yOCAtMTExNSAwIC0xMTE2IDAgLTUxIDI0IGMtNTMgMjUgLTgzIDU4IC0xMDIgMTE1IC0xNiA0NQotMTcgMTc5OCAtMiAxODUzIDE0IDUwIDU1IDk3IDEwNSAxMTkgMzggMTggOTUgMTkgMTE2NSAxOSAxMDcwIDAgMTEyNyAtMQoxMTY1IC0xOXoiLz4KPHBhdGggZD0iTTI0ODcgMjM0MCBjLTIyMiAtMzkgLTM4MyAtMjYyIC0zNDcgLTQ4MiAxOCAtMTE0IDk1IC0yMzQgMTgxIC0yODUKbDI5IC0xNyAwIC0xNjkgYzAgLTE0NSAzIC0xNzMgMTkgLTIwNSAzOSAtNzUgMTAxIC0xMTIgMTkxIC0xMTIgOTAgMCAxNTIgMzcKMTkxIDExMiAxNiAzMiAxOSA2MCAxOSAyMDUgbDAgMTY4IDQ1IDMwIGMxNTYgMTA1IDIxNCAzMzAgMTMwIDUxMiAtNzkgMTc0Ci0yNzEgMjc2IC00NTggMjQzeiIvPgo8L2c+Cjwvc3ZnPgo=");
  background-size: 86% 86%;
}

.map-interaction-lock {
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTIzNzAgNTEwNSBjLTQ0MSAtNjkgLTgyNiAtMzk0IC05NjUgLTgxNSAtNTMgLTE2MSAtNTcgLTE5NSAtNjIKLTU0NiBsLTUgLTMzMSAtNzEgLTYgYy0yNTcgLTIwIC00OTcgLTE5OSAtNjA0IC00NTIgLTU0IC0xMjcgLTU0IC0xMjEgLTUxCi0xMjg1IGwzIC0xMDc1IDIzIC03MCBjODQgLTI1MCAyNTYgLTQyMCA1MDIgLTQ5NyBsNzUgLTIzIDEzNDUgMCAxMzQ1IDAgNzUKMjMgYzI0OCA3OSA0MTcgMjQ2IDUwMiA0OTcgbDIzIDcwIDMgMTA3NSBjMyAxMjI3IDcgMTE2MyAtNzkgMTMzOCAtNDIgODcgLTYzCjExNiAtMTMyIDE4NSAtNDUgNDUgLTExMSA5OSAtMTQ3IDEyMCAtODQgNDggLTIwNiA4NyAtMjk3IDk0IGwtNzMgNiAwIDI4MQpjLTEgMjk3IC03IDM4MiAtNDEgNTEwIC0xNTcgNjA3IC03NTEgOTk3IC0xMzY5IDkwMXogbTQxNSAtNTA5IGMyMDQgLTY5IDM2NwotMjE5IDQ0OSAtNDE0IDQ5IC0xMTUgNTYgLTE3OSA1NiAtNDg4IGwwIC0yODQgLTczMSAwIC03MzAgMCAzIDMxOCAzIDMxNyAyOAo4MCBjODggMjUyIDI4OCA0MzMgNTQyIDQ5MSA5OSAyMyAyODIgMTMgMzgwIC0yMHogbTEwODYgLTE2ODcgYzU2IC0yNiAxMDUKLTc1IDEyOCAtMTI5IGwyMSAtNDkgLTIgLTEwMzkgLTMgLTEwMzkgLTMwIC00OSBjLTE5IC0zMCAtNDkgLTYwIC03OSAtNzkKbC00OSAtMzAgLTEyOTcgMCAtMTI5NyAwIC00OSAzMCBjLTMwIDE5IC02MCA0OSAtNzkgNzkgbC0zMCA0OSAtMyAxMDM2IGMtMgo5MzYgLTEgMTA0MCAxNCAxMDc5IDMwIDgwIDk0IDEzNSAxNzYgMTUxIDI0IDUgNjA2IDggMTI5MyA4IDExMzAgLTIgMTI1MyAtNAoxMjg2IC0xOHoiLz4KPHBhdGggZD0iTTI0NjUgMjQyOCBjLTg5IC0xNyAtMTg0IC03MCAtMjUzIC0xNDIgLTIwNCAtMjEyIC0xODEgLTUzMyA1MSAtNzE2Cmw1NyAtNDUgMCAtMTgzIGMwIC0yMDYgOSAtMjQzIDc4IC0zMDMgNTAgLTQ0IDkxIC01OSAxNjQgLTU5IDc2IDAgMTM0IDI2IDE4MQo4MSA1MCA1NyA1NyA5NSA1NyAyOTAgbDAgMTc0IDU3IDQ1IGMyMzEgMTgyIDI1NSA1MDQgNTMgNzE0IC0xMTkgMTI0IC0yNzgKMTc2IC00NDUgMTQ0eiIvPgo8L2c+Cjwvc3ZnPgo=");
  background-size: 80% 80%;
}

.popup-content {
  line-height: 1.2;
}
</style>
