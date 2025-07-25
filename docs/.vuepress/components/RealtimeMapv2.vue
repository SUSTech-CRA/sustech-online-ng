<template>
  <div class="map-wrapper">
    <div class="map-container" ref="mapContainer"></div>
    <span v-if="timeDrift" class="time-drift-display">Time Drift: {{ timeDrift }}s</span>
  </div>
</template>

<script>
import maplibre from 'maplibre-gl';
import axios from 'axios';
import * as turf from '@turf/turf';
import { Protocol } from 'pmtiles';

export default {
  name: 'BusMap',

  data() {
    return {
      // --- Configuration ---
      apiBaseUrl_RealTimeData: 'https://bus.sustcra.com/api/v2',
      apiBaseUrl: 'https://bus.sustcra.com/api/v3',
      map: null,
      activePopup: null,

      // --- Map Styles & Assets ---
      mapStyleLight: 'https://bus.sustcra.com/static/protomaps/pmtiles-style/pmtiles-light.json',
      mapStyleDark: 'https://bus.sustcra.com/static/protomaps/pmtiles-style/pmtiles-dark.json',
      mapTextColor: '#000000',
      mapTextHaloColor: '#FFFFFF', // 为文字描边颜色创建一个状态

      // --- Data Placeholders ---
      // 在这里填入你的线路GeoJSON坐标数据
      geojson_XYBS1: [],
      geojson_XYBS2: [],
      geojson_SEV1: [],

      // --- State Management ---
      busLocations: [],
      busMarkers: [],
      unifiedStationsLookup: {}, // { "lng,lat": { name, routes: [{...}] } }
      allStationsGeoJSON: { type: 'FeatureCollection', features: [] },
      bldgGeoJSON: {},
      gateGeoJSON: {},
      timeDrift: 0,
      busUpdateTimer: null,
      themeChangeHandler: null, // 用于存储主题变化的处理函数引用
    };
  },

  methods: {
    // --- 1. Initialization and Map Setup ---
    initializeMap(styleUrl) {
      const pmtilesProtocol = new Protocol();
      maplibre.addProtocol('pmtiles', pmtilesProtocol.tile);

      this.map = new maplibre.Map({
        container: this.$refs.mapContainer,
        style: styleUrl,
        center: [113.99373, 22.60308],
        zoom: 14.5,
        minZoom: 13,
      });

      this.setupMapControls();
    },

    setupMapControls() {
      this.map.addControl(new maplibre.NavigationControl(), 'top-left');
      this.map.addControl(new maplibre.FullscreenControl(), 'top-left');
      this.map.addControl(new maplibre.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }), 'top-right');
      // 可以添加你之前的自定义控件，这里为了简洁暂时省略
    },

    // --- 2. Data Loading ---
    async loadMapData() {
      // 并发加载所有数据
      await Promise.all([
        this.loadAllStationData(),
        this.loadBuildingAndGateData(),
        this.loadGeoJSONLines(),
      ]);
      this.loadMapIconsAndLayers();
    },

    async loadAllStationData() {
      console.log('Fetching all station data...');
      try {
        const routesResponse = await axios.get(`${this.apiBaseUrl}/avail_route`);
        const allRoutes = routesResponse.data.routes;

        const stationPromises = allRoutes.map(route =>
            axios.get(`${this.apiBaseUrl}/${route.name}/${route.direction}/stations`)
        );

        const stationResults = await Promise.all(stationPromises);

        stationResults.forEach((result, index) => {
          const routeInfo = allRoutes[index];
          const features = result.data.features || [];

          features.forEach(feature => {
            const coords = feature.geometry.coordinates;
            const coordKey = coords.join(',');
            const stationName = feature.properties.name.replace(/\n/g, ' ');

            // 填充站点反向查找表
            if (!this.unifiedStationsLookup[coordKey]) {
              this.unifiedStationsLookup[coordKey] = {
                name: stationName,
                routes: [],
              };
            }
            this.unifiedStationsLookup[coordKey].routes.push({
              route_code: routeInfo.name,
              direction: routeInfo.direction,
              station_id: feature.properties.station_id,
            });

            // 添加唯一的站点到GeoJSON中用于显示
            // 检查是否已存在相同坐标的站点，避免重复图标
            if (!this.allStationsGeoJSON.features.some(f => f.geometry.coordinates.join(',') === coordKey)) {
              // 为了点击事件能获取到正确的坐标，我们把它也存入properties
              feature.properties.coordKey = coordKey;
              feature.properties.name = stationName;
              this.allStationsGeoJSON.features.push(feature);
            }
          });
        });

        console.log('Unified station database created.');
      } catch (error) {
        console.error('Failed to load station data:', error);
      }
    },

    async loadBuildingAndGateData() {
      try {
        const [bldgRes, gateRes] = await Promise.all([
          axios.get('https://bus.sustcra.com/geojson/sustech_bldg.json'),
          axios.get('https://bus.sustcra.com/geojson/sustech_gate.json')
        ]);
        this.bldgGeoJSON = bldgRes.data;
        this.gateGeoJSON = gateRes.data;
      } catch(error) {
        console.error("Failed to fetch building or gate geojson:", error);
      }
    },

    async loadMapIconsAndLayers() {
      const loadImage = (url) => this.map.loadImage(url);
      try {
        const [stationImg, bldgImg, gateImg] = await Promise.all([
          loadImage('https://bus.sustcra.com/station_icon.png'),
          loadImage('https://bus.sustcra.com/bldg_icon.png'),
          loadImage('https://bus.sustcra.com/gate_icon.png')
        ]);

        this.map.addImage('bus-station-icon', stationImg.data);
        this.map.addImage('bldg-icon', bldgImg.data);
        this.map.addImage('gate-icon', gateImg.data);

        this.setupMapLayers();
      } catch (error) {
        console.error('Error loading map icons:', error);
      }
    },

    async loadGeoJSONLines() {
      try {
        const [XYBS1Res, XYBS2Res, SEV1Res] = await Promise.all([
          axios.get('https://bus.sustcra.com/static/lines/XYBS1.json'),
          axios.get('https://bus.sustcra.com/static/lines/XYBS2.json'),
          axios.get('https://bus.sustcra.com/static/lines/SEV1.json'),
        ]);
        // console.log('XYBS1:', XYBS1Res.data);
        // console.log('XYBS2:', XYBS2Res.data);
        // console.log('SEV1:', SEV1Res.data);
        this.geojson_XYBS1 = XYBS1Res.data;
        this.geojson_XYBS2 = XYBS2Res.data;
        this.geojson_SEV1 = SEV1Res.data;
      } catch (error) {
        console.error("Failed to fetch GeoJSON lines:", error);
      }
    },


    setupMapLayers() {
      // 添加线路图层
      this.addRouteLayer('line1', this.geojson_XYBS1, '#f7911d');
      this.addRouteLayer('line2', this.geojson_XYBS2, '#29abe2');
      this.addRouteLayer('line3', this.geojson_SEV1, '#7030a1');

      // 添加站点、建筑和校门图层
      this.addSymbolLayer('stations', this.allStationsGeoJSON, 'bus-station-icon', 0.075, [0, 1.25]);
      this.addSymbolLayer('buildings', this.bldgGeoJSON, 'bldg-icon', 0.02, [0, 0.3], 11);
      this.addSymbolLayer('gates', this.gateGeoJSON, 'gate-icon', 0.05, [0, 0.6]);
    },

    // --- 3. Bus Tracking ---
    startBusTracking() {
      this.fetchBusLocations(); // 立即执行一次
      this.busUpdateTimer = setInterval(this.fetchBusLocations, 5000); // 每5秒刷新
    },

    // 计算公交车的方位角
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

    async fetchBusLocations() {
      try {
        const response = await axios.get(`https://bus.sustcra.com/api/v2/monitor_osm/`);
        this.busLocations = response.data;
        const now = Date.now() / 1000;
        if (this.busLocations.length > 0 && this.busLocations[0].time_mt) {
          this.timeDrift = Math.round(now - this.busLocations[0].time_mt);
        }
        this.updateBusMarkers();
      } catch (error) {
        console.error("Failed to fetch bus locations:", error);
      }
    },

    updateBusMarkers() {
      this.busMarkers.forEach(marker => marker.remove());
      this.busMarkers = [];

      const now = Date.now() / 1000;
      this.busLocations.forEach(bus => {
        if (now - bus.time_mt < 150) { // 只显示150秒内有数据上报的车辆
          const busEl = document.createElement('div');
          busEl.className = 'bus-marker';

          const marker = new maplibre.Marker({ element: busEl, anchor: 'center' })
              .setLngLat([bus.lng, bus.lat])
              .setPopup(this.createBusInfoPopup(bus))
              .setRotation(bus.heading || 0)
              .addTo(this.map);

          this.busMarkers.push(marker);
        }
      });
    },

    // --- 4. Event Handlers & Interaction ---
    setupMapListeners() {
      this.map.on('click', 'stations-layer', this.onStationClick);
      this.map.on('mouseenter', 'stations-layer', () => this.map.getCanvas().style.cursor = 'pointer');
      this.map.on('mouseleave', 'stations-layer', () => this.map.getCanvas().style.cursor = '');
    },

    async onStationClick(e) {
      if (e.features.length === 0) return;

      const feature = e.features[0];
      const coordKey = feature.properties.coordKey;
      const stationInfo = this.unifiedStationsLookup[coordKey];
      const coordinates = feature.geometry.coordinates.slice();

      if (!stationInfo) return;

      // 如果已有弹窗，先关闭
      if (this.activePopup) {
        this.activePopup.remove();
      }

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="popup-header">${stationInfo.name}</div>
        <div class="popup-body">正在查询...</div>
      `;

      this.activePopup = new maplibre.Popup({ offset: 25, closeButton: true })
          .setLngLat(coordinates)
          .setDOMContent(popupContent)
          .addTo(this.map);

      // 异步获取ETA数据
      const etas = await this.fetchEtasForStation(stationInfo);

      // 更新弹窗内容
      const popupBody = popupContent.querySelector('.popup-body');
      popupBody.innerHTML = this.createEtaListHtml(etas);
    },

    async fetchEtasForStation(stationInfo) {
      const etaPromises = stationInfo.routes.map(route =>
          axios.get(`${this.apiBaseUrl}/${route.route_code}/${route.direction}/${route.station_id}`)
      );

      try {
        const results = await Promise.all(etaPromises);
        return results.map(res => res.data).flat().sort((a,b) => a.eta_minutes - b.eta_minutes);
      } catch (error) {
        console.error("Failed to fetch ETAs:", error);
        return [];
      }
    },

    // --- 5. Helper Functions ---
    addRouteLayer(id, geojsonData, color) {
      // 添加 GeoJSON source
      this.map.addSource(id, {
        type: 'geojson',
        data: geojsonData
      });

      // 添加线图层
      this.map.addLayer({
        id: id + '-layer',
        type: 'line',
        source: id,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': color, 'line-width': 3 }
      });
    },


    addSymbolLayer(id, geojson, iconImage, iconSize, textOffset, textSize = 10) {
      this.map.addSource(id, { type: 'geojson', data: geojson });
      this.map.addLayer({
        id: id + '-layer', type: 'symbol', source: id,
        layout: {
          'icon-image': iconImage, 'icon-size': iconSize, 'icon-allow-overlap': true,
          'text-field': ['get', 'name'], 'text-size': textSize, 'text-offset': textOffset,
          'text-anchor': 'top',
        },
        paint: {
          'text-color': this.mapTextColor,
          'text-halo-color': this.mapTextHaloColor,
          'text-halo-width': 1
        }
      });
    },

    createBusInfoPopup(bus) {
      const directionMapL1 = { '0': '欣园 Joy Highland', '1': '工学院 COE' };
      const directionMapL2 = { '0': '欣园 Joy Highland', '1': '科研楼' };
      const lineNum = bus.route_code.slice(-1);
      const direction = lineNum === '1' ? directionMapL1[bus.route_dir] : directionMapL2[bus.route_dir];
      const color = lineNum === '1' ? '#f7911d': '#29abe2';

      const html = `
        <div class="bus-popup">
          <div class="plate">粤B${bus.id.slice(2)} (${bus.speed} km/h)</div>
          <div><span class="line-tag" style="background-color:${color}">Line ${lineNum}</span> To: <strong>${direction}</strong></div>
          <div>Next: <strong>${bus.next_station_string}</strong></div>
        </div>
      `;
      return new maplibre.Popup({ offset: 20 }).setHTML(html);
    },

    createEtaListHtml(etas) {
      if (etas.length === 0) {
        return '<div class="eta-item">暂无班车信息</div>';
      }

      return etas.map(eta => {
        const lineNum = eta.route_key.split('_')[0].slice(-1);
        const color = lineNum === '1' ? '#f7911d' : '#29abe2';
        return `
                <div class="eta-item">
                    <span class="line-tag" style="background-color:${color};">L${lineNum}</span>
                    <span class="plate-tag terminal-station">
                      ${eta.terminal_station_name}
                    </span>
<!--                    <span class="plate-tag">${eta.plate.slice(2)}</span>-->
<!--                    <span>下站 <strong>${eta.next_station}</strong></span>-->
                    <span class="eta-time">${eta.eta_minutes} Min.</span>
                </div>
            `;
      }).join('');
    },

    // --- 6. Lifecycle Hooks ---
    setupThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // 根据当前主题设置文字和描边颜色
      if (mediaQuery.matches) {
        this.mapTextColor = '#FFFFFF';
        this.mapTextHaloColor = '#000000'; // 夜间模式使用黑色描边
      } else {
        this.mapTextColor = '#000000';
        this.mapTextHaloColor = '#FFFFFF'; // 日间模式使用白色描边
      }

      this.themeChangeHandler = (e) => {
        console.log(`Theme changed to ${e.matches ? 'Dark' : 'Light'}. Map will reload.`);
        window.location.reload();
      };
      mediaQuery.addEventListener('change', this.themeChangeHandler);
    }
  },

  async mounted() {
    this.setupThemeListener();

    const styleUrl = this.mapTextColor === '#FFFFFF' ? this.mapStyleDark : this.mapStyleLight;
    this.initializeMap(styleUrl);

    this.map.on('load', async () => {
      console.log('Map loaded.');
      await this.loadMapData();
      this.setupMapListeners();
      this.startBusTracking();
    });
  },

  unmounted() {
    clearInterval(this.busUpdateTimer);
    if (this.themeChangeHandler) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.themeChangeHandler);
    }
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style>
/* Global styles for map elements */
.map-wrapper {
  position: relative;
  width: 100%;
  height: 50vh; /* Give it a good height */
}

.map-container {
  width: 100%;
  height: 100%;
}

.time-drift-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

/* --- Bus Marker Style --- */
.bus-marker {
  width: 25px;
  height: 25px;
  background-image: url('https://bus.sustcra.com/bus-icon-view.png');
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
}

/* --- Popup Styles --- */
.maplibregl-popup-content {
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.bus-popup {
  color: black;
  font-size: 13px;
  line-height: 1.6;
}
.bus-popup .plate {
  font-weight: bold;
  font-size: 15px;
}

.popup-header {
  color: black;
  font-size: 15px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 1px;
  margin-bottom: 8px;
}
.popup-body {
  color: black;
  max-height: 200px;
  overflow-y: auto;
}

.eta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}
.eta-item:last-child {
  border-bottom: none;
}
.eta-item .eta-time {
  margin-left: auto;
  font-weight: bold;
  color: #f7911d;
}

.line-tag, .plate-tag {
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}
.plate-tag {
  background-color: #555;
}
</style>