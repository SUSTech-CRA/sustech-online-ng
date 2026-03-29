<template>
  <div class="map-wrapper">
    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-icon station-dot"></span>
        <span class="legend-text">站点 Station</span>
      </div>
      <div class="legend-item">
        <img class="legend-icon bus-icon" src="https://bus.sustcra.com/static/icon/bus-icon-NKDH1.png" alt="1路" />
        <span class="legend-text">1路 内环 顺时针 CW</span>
      </div>
      <div class="legend-item">
        <img class="legend-icon bus-icon" src="https://bus.sustcra.com/static/icon/bus-icon-NKDH2.png" alt="2路" />
        <span class="legend-text">2路 外环 逆时针 CCW</span>
      </div>
      <div class="legend-item">
        <img class="legend-icon bus-icon" src="https://bus.sustcra.com/static/icon/bus-icon-SEV.png" alt="EV" />
        <span class="legend-text">电瓶车 EV Shuttle</span>
      </div>
    </div>
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

      // 配置表，每条线路单独定义方向映射 & 颜色
      routeConfig: {
        NKDH1: {
          name: 'L1',
          directions: { '0': '顺时针🔁CW', '1': '' },
          icon: 'https://bus.sustcra.com/static/icon/bus-icon-NKDH1.png',
          color: '#4ca963'
        },
        NKDH2: {
          name: 'L2',
          directions: { '0': '逆时针🔄CCW', '1': '' },
          icon: 'https://bus.sustcra.com/static/icon/bus-icon-NKDH2.png',
          color: '#db7490'
        },
        SEV: { // 新增的路线
          name: '电瓶车',
          directions: { '-1': '' },
          icon: 'https://bus.sustcra.com/static/icon/bus-icon-SEV.png',
          color: '#7030a1'
        }
      },

      // --- Data Placeholders ---
      geojson_NKDH1: [],
      predictionRoutes: {},
      sevPredictionHistory: {},

      // --- State Management ---
      busLocations: [],
      sevLocations: [],
      // 格式：{ 'bus_id': Marker实例 }
      busMarkers: {},
      // 存储每辆车的动画帧ID，用于取消未完成的动画
      busAnimations: {},

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
      await Promise.all([
        this.loadAllStationData(),
        this.loadBuildingAndGateData(),
        this.loadGeoJSONLines(),
        this.loadPredictionData(),
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
        const [NKDH1Res] = await Promise.all([
          axios.get('https://bus.sustcra.com/static/lines/NKDH1_clockwise.json')
        ]);
        // console.log('NKDH1:', NKDH1Res.data);
        this.geojson_NKDH1 = NKDH1Res.data;
      } catch (error) {
        console.error("Failed to fetch GeoJSON lines:", error);
      }
    },

    async loadPredictionData() {
      try {
        const [cwLineRes, ccwLineRes, xybs1Dir0Res, xybs1Dir1Res] = await Promise.all([
          axios.get('https://bus.sustcra.com/static/lines/XYBS1_clockwise.json'),
          axios.get('https://bus.sustcra.com/static/lines/XYBS2.json'),
          axios.get(`${this.apiBaseUrl}/XYBS1/0/stations`),
          axios.get(`${this.apiBaseUrl}/XYBS1/1/stations`),
        ]);

        const latestStationGeoJSON = this.mergeStationFeatures([
          xybs1Dir0Res.data,
          xybs1Dir1Res.data,
        ]);

        this.predictionRoutes = this.buildPredictionRoutes([
          {
            key: 'sev-cw',
            routeName: 'CW',
            directionLabel: '顺时针 CW',
            color: this.routeConfig.NKDH1.color,
            lineGeoJSON: cwLineRes.data,
            stopGeoJSON: latestStationGeoJSON,
          },
          {
            key: 'sev-ccw',
            routeName: 'CCW',
            directionLabel: '逆时针 CCW',
            color: this.routeConfig.NKDH2.color,
            lineGeoJSON: ccwLineRes.data,
            stopGeoJSON: latestStationGeoJSON,
          },
        ]);
      } catch (error) {
        console.error('Failed to load SEV prediction data:', error);
      }
    },

    mergeStationFeatures(featureCollections) {
      const featureMap = new Map();

      featureCollections.forEach((collection) => {
        const features = collection?.features || [];
        features.forEach((feature) => {
          const coordinates = feature.geometry?.coordinates?.slice(0, 2);
          if (!coordinates || coordinates.length < 2) {
            return;
          }

          const key = coordinates.map((value) => Number(value).toFixed(6)).join(',');
          if (!featureMap.has(key)) {
            featureMap.set(key, {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates,
              },
              properties: {
                ...feature.properties,
              },
            });
          }
        });
      });

      return {
        type: 'FeatureCollection',
        features: Array.from(featureMap.values()),
      };
    },

    buildPredictionRoutes(routeDefinitions) {
      const routes = {};

      routeDefinitions.forEach((definition) => {
        const lineFeature = definition.lineGeoJSON?.features?.[0];
        const stopFeatures = definition.stopGeoJSON?.features || [];

        if (!lineFeature || stopFeatures.length === 0) {
          return;
        }

        const totalLengthKm = turf.length(lineFeature, { units: 'kilometers' });
        const stops = stopFeatures
            .map((feature) => {
              const snapped = turf.nearestPointOnLine(lineFeature, feature, { units: 'kilometers' });
              return {
                shortName: this.getShortStationName(feature.properties.name),
                displayName: this.getStationDisplayName(feature.properties.name),
                coordinates: feature.geometry.coordinates.slice(0, 2),
                progressKm: snapped.properties.location,
              };
            })
            .sort((a, b) => a.progressKm - b.progressKm);

        routes[definition.key] = this.createPredictionRoute({
          key: definition.key,
          routeName: definition.routeName,
          directionLabel: definition.directionLabel,
          color: definition.color,
          lineFeature,
          totalLengthKm,
          stops,
        });
      });

      return routes;
    },

    createPredictionRoute({
      key,
      routeName,
      color,
      lineFeature,
      totalLengthKm,
      directionLabel,
      stops,
    }) {
      return {
        key,
        routeName,
        color,
        lineFeature,
        totalLengthKm,
        directionLabel,
        stops,
        lineCoordinates: lineFeature.geometry.coordinates.map((coord) => coord.slice(0, 2)),
      };
    },


    setupMapLayers() {
      // 添加线路图层
      this.addRouteLayer('line1', this.geojson_NKDH1, '#747474');
      console.log("NKDH1 route layer added.");

      // 添加站点、建筑和校门图层
      // station 语义缩放
      if (!this.map.getSource('stations-source')) {
        this.map.addSource('stations-source', {
          type: 'geojson',
          data: this.allStationsGeoJSON
        });
      }

      // (B) 添加圆点图层
      this.map.addLayer({
        'id': 'stations-dots',
        'type': 'circle',
        'source': 'stations-source',
        'maxzoom': 16.5,
        'paint': {
          'circle-radius': 4,
          'circle-color': '#1fa252',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // (C) 添加图标图层
      this.map.addLayer({
        'id': 'stations-icons',
        'type': 'symbol',
        'source': 'stations-source',
        'minzoom': 16.5,
        'layout': {
          'icon-image': 'bus-station-icon',
          'icon-size': 0.075,
          'icon-anchor': 'bottom',
          'icon-offset': [0, 0],
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-offset': [0, 1.25],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });

      // this.addSymbolLayer('stations', this.allStationsGeoJSON, 'bus-station-icon', 0.075, [0, 1.25]);
      this.addSymbolLayer('buildings', this.bldgGeoJSON, 'bldg-icon', 0.02, [0, 0.3], 11);
      this.addSymbolLayer('gates', this.gateGeoJSON, 'gate-icon', 0.05, [0, 0.6]);
    },

    // --- 3. Bus Tracking ---
    startBusTracking() {
      this.fetchBusLocations(); // 立即执行一次
      this.busUpdateTimer = setInterval(this.fetchBusLocations, 8000); // 每8秒刷新
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

    normalizeBearing(angle) {
      return ((angle % 360) + 360) % 360;
    },

    calculateAngleDifference(a, b) {
      const normalizedA = this.normalizeBearing(a);
      const normalizedB = this.normalizeBearing(b);
      const diff = Math.abs(normalizedA - normalizedB);
      return Math.min(diff, 360 - diff);
    },

    getShortStationName(name = '') {
      return name.split('\n')[0].trim();
    },

    getStationDisplayName(name = '') {
      return name.replace(/\n/g, ' ').trim();
    },

    projectBusToPredictionRoute(busPoint, route) {
      const snapped = turf.nearestPointOnLine(route.lineFeature, busPoint, { units: 'kilometers' });
      const segmentIndex = Math.min(snapped.properties.index || 0, Math.max(route.lineCoordinates.length - 2, 0));
      const segmentStart = route.lineCoordinates[segmentIndex];
      const segmentEnd = route.lineCoordinates[Math.min(segmentIndex + 1, route.lineCoordinates.length - 1)];

      const routeBearing = this.normalizeBearing(
          this.calculateBusAngle(segmentStart[1], segmentStart[0], segmentEnd[1], segmentEnd[0])
      );

      return {
        progressKm: snapped.properties.location,
        distanceMeters: (snapped.properties.dist || 0) * 1000,
        routeBearing,
      };
    },

    findNextStopForRoute(route, progressKm) {
      const progressMarginKm = 0.02;
      return route.stops.find((stop) => stop.progressKm >= progressKm + progressMarginKm)
          || route.stops[route.stops.length - 1]
          || null;
    },

    predictSevRoute(bus) {
      const predictionRoutes = Object.values(this.predictionRoutes);
      if (predictionRoutes.length === 0) {
        return null;
      }

      const busPoint = turf.point([bus.lng, bus.lat]);
      const speed = Number(bus.speed) || 0;
      const course = Number(bus.course);
      const previousState = this.sevPredictionHistory[bus.id];
      const gpsMoveKm = previousState
          ? turf.distance(
              turf.point([previousState.lng, previousState.lat]),
              busPoint,
              { units: 'kilometers' }
          )
          : 0;

      const candidates = predictionRoutes
          .map((route) => {
            const projection = this.projectBusToPredictionRoute(busPoint, route);
            let score = projection.distanceMeters * 4;

            if (speed > 3 && Number.isFinite(course) && course > 0) {
              projection.courseDiff = this.calculateAngleDifference(course, projection.routeBearing);
              score += projection.courseDiff * 0.7;
            }

            const previousProgress = previousState?.progressByRoute?.[route.key];
            if (typeof previousProgress === 'number') {
              const progressDeltaKm = projection.progressKm - previousProgress;
              const dtSeconds = Math.max((bus.time_mt || 0) - (previousState.time_mt || 0), 1);
              const maxReasonableMoveKm = Math.max(gpsMoveKm + 0.08, ((speed + 12) * dtSeconds) / 3600);

              projection.progressDeltaKm = progressDeltaKm;

              if (progressDeltaKm < -0.03) {
                score += 180;
              }
              if (progressDeltaKm > maxReasonableMoveKm + 0.15) {
                score += 90;
              }
              if (gpsMoveKm > 0.01 && Math.abs(progressDeltaKm - gpsMoveKm) > 0.12) {
                score += 35;
              }
              if (progressDeltaKm > 0.01) {
                score -= Math.min(progressDeltaKm * 600, 30);
              }
            }

            return {
              ...projection,
              route,
              score,
            };
          })
          .sort((a, b) => a.score - b.score);

      let bestCandidate = candidates[0];
      const previousChoice = previousState?.lastPredictionKey
          ? candidates.find((candidate) => candidate.route.key === previousState.lastPredictionKey)
          : null;

      // 使用轻微滞回，避免在重合路段上来回抖动
      if (previousChoice && previousChoice.score <= bestCandidate.score + 45) {
        bestCandidate = previousChoice;
      }

      const nextStop = this.findNextStopForRoute(bestCandidate.route, bestCandidate.progressKm);
      const prediction = nextStop && bestCandidate.distanceMeters <= 160
          ? {
              routeKey: bestCandidate.route.key,
              routeName: bestCandidate.route.routeName,
              directionLabel: bestCandidate.route.directionLabel,
              nextStop,
              color: bestCandidate.route.color,
              heading: bestCandidate.routeBearing,
              lineDistanceMeters: bestCandidate.distanceMeters,
            }
          : null;

      this.sevPredictionHistory[bus.id] = {
        lng: bus.lng,
        lat: bus.lat,
        time_mt: bus.time_mt,
        progressByRoute: Object.fromEntries(
            candidates.map((candidate) => [candidate.route.key, candidate.progressKm])
        ),
        lastPredictionKey: prediction?.routeKey
            || previousState?.lastPredictionKey
            || bestCandidate?.route.key
            || null,
      };

      return prediction;
    },

    prepareBusForDisplay(bus) {
      if (bus.route_code !== 'SEV') {
        return {
          ...bus,
          heading: Number(bus.course) || 0,
        };
      }

      const prediction = this.predictSevRoute(bus);
      const fallbackHeading = Number.isFinite(Number(bus.course)) ? Number(bus.course) : 0;
      return {
        ...bus,
        heading: prediction?.heading ?? fallbackHeading,
        sevPrediction: prediction,
      };
    },

    getMarkerRotation(bus) {
      if (bus.route_code === 'SEV') {
        return 0;
      }
      return bus.heading || 0;
    },

    async fetchBusLocations() {
      try {
        const response = await axios.get(`https://bus.sustcra.com/api/v2/monitor_osm/`);
        //also fetch sev locations https://bus.sustcra.com/api/v2/monitor_sev_osm/
        const response_sev = await axios.get(`https://bus.sustcra.com/api/v2/monitor_sev_osm/`);

        this.busLocations = response.data;
        this.sevLocations = response_sev.data;

        // merge busLocations and sevLocations
        this.busLocations = this.busLocations.concat(this.sevLocations);

        const now = Date.now() / 1000;
        if (this.busLocations.length > 0 && this.busLocations[0].time_mt) {
          this.timeDrift = Math.round(now - this.busLocations[0].time_mt);
        }
        this.updateBusMarkers();
      } catch (error) {
        console.error("Failed to fetch bus locations:", error);
      }
    },

    createBusMarker(bus) {
      const busEl = document.createElement('div');
      busEl.className = 'bus-marker';

      const config = this.routeConfig[bus.route_code];
      const iconUrl = config ? config.icon : 'https://bus.sustcra.com/bus-icon-view.png';
      busEl.style.backgroundImage = `url('${iconUrl}')`;

      // 创建 Marker 并绑定 Popup
      const marker = new maplibre.Marker({ element: busEl, anchor: 'center' })
          .setLngLat([bus.lng, bus.lat])
          .setPopup(this.createBusInfoPopup(bus)) // 创建新的 Popup 实例
          .setRotation(this.getMarkerRotation(bus))
          .addTo(this.map);

      this.busMarkers[bus.id] = marker;
    },

    animateBusMarker(id, busData) {
      const marker = this.busMarkers[id];

      if (this.busAnimations[id]) {
        cancelAnimationFrame(this.busAnimations[id]);
      }

      // 更新 Popup 内容而不关闭它 ---
      const popup = marker.getPopup(); // 获取当前绑定的 popup 实例
      const newHTML = this.getBusPopupHTML(busData); // 生成新的 HTML

      // 只有当内容发生变化时才更新 DOM（可选优化）
      // MapLibre 的 setHTML 性能很好，直接调用也没问题
      popup.setHTML(newHTML);

      // 2. 这里的动画逻辑保持不变
      const startLngLat = marker.getLngLat();
      const startLng = startLngLat.lng;
      const startLat = startLngLat.lat;
      const endLng = busData.lng;
      const endLat = busData.lat;

      // 如果位置没变，直接返回
      if (Math.abs(startLng - endLng) < 0.000001 && Math.abs(startLat - endLat) < 0.000001) {
        return;
      }

      const duration = 1000;
      const startTime = performance.now();

      // 更新旋转角度
      marker.setRotation(this.getMarkerRotation(busData));

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentLng = startLng + (endLng - startLng) * progress;
        const currentLat = startLat + (endLat - startLat) * progress;

        marker.setLngLat([currentLng, currentLat]);

        if (progress < 1) {
          this.busAnimations[id] = requestAnimationFrame(animate);
        } else {
          delete this.busAnimations[id];
        }
      };

      this.busAnimations[id] = requestAnimationFrame(animate);
    },

    updateBusMarkers() {
      const now = Date.now() / 1000;
      // 用于记录本次更新中存在的车辆ID，方便后续找出需要删除的车辆
      const currentBusIds = new Set();

      this.busLocations.forEach((rawBus) => {
        // 只处理最近 120 秒有数据的车
        if (now - rawBus.time_mt > 120) return;

        const bus = this.prepareBusForDisplay(rawBus);

        currentBusIds.add(bus.id);

        if (this.busMarkers[bus.id]) {
          // --- 情况 A: 车辆已存在，执行平滑移动 ---
          this.animateBusMarker(bus.id, bus);
        } else {
          // --- 情况 B: 新车辆，创建 Marker ---
          this.createBusMarker(bus);
        }
      });

      // --- 情况 C: 清理已消失的车辆 ---
      // 遍历现有的所有 Marker，如果它不在本次 API 返回的列表(currentBusIds)里，说明下线了
      Object.keys(this.busMarkers).forEach(id => {
        if (!currentBusIds.has(id)) {
          // 移除地图上的图标
          this.busMarkers[id].remove();
          // 删除引用
          delete this.busMarkers[id];
          delete this.sevPredictionHistory[id];
          // 如果有正在进行的动画，也取消掉
          if (this.busAnimations[id]) {
            cancelAnimationFrame(this.busAnimations[id]);
            delete this.busAnimations[id];
          }
        }
      });
    },

    // --- 4. Event Handlers & Interaction ---
    setupMapListeners() {
      ['stations-dots', 'stations-icons'].forEach((layerId) => {
        this.map.on('mouseenter', layerId, () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', layerId, () => {
          this.map.getCanvas().style.cursor = '';
        });
        this.map.on('click', layerId, this.onStationClick);
      });
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

    // 只负责生成 HTML 字符串
    getBusPopupHTML(bus) {
      const config = this.routeConfig[bus.route_code] || {};
      const lineNum = config.name || bus.route_code;
      const direction = bus.route_code === 'SEV'
          ? (bus.sevPrediction?.directionLabel || '方向预测中')
          : (config.directions?.[bus.route_dir] ?? '');
      const color = config.color ?? '#cccccc';
      const nextStation = bus.route_code === 'SEV'
          ? (bus.sevPrediction?.nextStop?.displayName || '暂无预测')
          : bus.next_station_string;
      const directionLabel = bus.route_code === 'SEV' ? 'Predicted' : 'To';
      const nextLabel = bus.route_code === 'SEV' ? 'Predicted Next' : 'Next';
      const predictionBadge = bus.route_code === 'SEV'
          ? '<span class="plate-tag">轨迹预测</span>'
          : '';

      return `
      <div class="bus-popup">
        <div class="plate">${bus.id.slice(2)} (${bus.speed} km/h)</div>
        <div><span class="line-tag" style="background-color:${color}">${lineNum}</span> ${predictionBadge}</div>
        <div>${directionLabel}: <strong>${direction}</strong></div>
        <div>${nextLabel}: <strong>${nextStation}</strong></div>
      </div>
    `;
    },

    // 创建 Popup 对象时调用上面的方法
    createBusInfoPopup(bus) {
      return new maplibre.Popup({ offset: 20 })
          .setHTML(this.getBusPopupHTML(bus));
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

    // 清理所有正在进行的动画
    Object.values(this.busAnimations).forEach(id => cancelAnimationFrame(id));

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

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-icon {
  display: inline-block;
}

.legend-icon.station-dot {
  width: 10px;
  height: 10px;
  background-color: #1fa252;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.legend-icon.bus-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.legend-text {
  color: #333;
  white-space: nowrap;
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
