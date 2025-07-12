<template>
  <a-config-provider :theme="antTheme">
    <a-card title="ETA (Bus with realtime data only)" :style="{ width: '100%', maxWidth: '600px', margin: '2rem auto' }">
      <a-spin :spinning="isLoadingRoutes" tip="正在加载线路...">
        <div class="controls-wrapper">
          <a-select
              v-model:value="selectedRouteKey"
              placeholder="选择线路 Choose Line"
              style="width: 100%"
              :options="routeOptions"
              @change="handleRouteChange"
              :loading="isLoadingStations"
          >
          </a-select>

          <a-select
              v-model:value="selectedStationId"
              placeholder="选择站点 Choose Station"
              style="width: 100%; margin-top: 16px;"
              :disabled="!selectedRouteKey || isLoadingStations"
              :options="stationOptions"
              @change="handleStationChange"
              :loading="isLoadingEta"
          >
          </a-select>
        </div>
      </a-spin>

      <div v-if="selectedStationId" class="eta-results">
        <a-spin :spinning="isLoadingEta" tip="正在查询到站时间...">
          <div v-if="!etas.length && !isLoadingEta">
            <a-empty description="该站点暂无班车信息" />
          </div>
          <div v-else class="eta-list">
            <div v-for="eta in sortedEtas" :key="eta.plate" class="eta-item">
              <div class="eta-time">
                <span class="eta-minutes">{{ eta.eta_minutes }}</span>
                <span class="eta-unit">Min.</span>
              </div>
              <div class="eta-details">
                <div class="eta-plate">
                  <a-tag color="blue">{{ eta.plate }}</a-tag>
                </div>
                <div class="eta-next-station">
                  Next Sta. {{ eta.next_station }}
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </a-card>
  </a-config-provider>
</template>

<script>
import axios from 'axios';
import {
  ConfigProvider,
  Select,
  Card,
  Spin,
  Empty,
  Tag,
  theme, // <--- 1. 导入 theme
} from 'ant-design-vue';

export default {
  name: 'BusEtaSelector',
  components: {
    'a-config-provider': ConfigProvider,
    'a-select': Select,
    'a-card': Card,
    'a-spin': Spin,
    'a-empty': Empty,
    'a-tag': Tag,
  },
  data() {
    return {
      /** API Base URL */
      apiBaseUrl: 'https://bus.sustcra.com/api/v3',

      /** UI 状态 */
      isLoadingRoutes: false,
      isLoadingStations: false,
      isLoadingEta: false,
      isDarkMode: false, // <--- 2. 添加暗色模式状态

      /** 数据模型 */
      routes: [],
      stations: [],
      etas: [],

      /** 用户选择 */
      selectedRouteKey: undefined,
      selectedStationId: undefined,

      /** 定时器 */
      etaInterval: null,
    };
  },
  computed: {
    /**
     * 3. 创建一个计算属性来动态返回 Ant Design Vue 的主题对象
     */
    antTheme() {
      return {
        algorithm: this.isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      };
    },
    /**
     * 将原始线路数据格式化为 antd Select 组件需要的格式
     */
    routeOptions() {
      const directionMap = { '0': 'To 欣园 Joy Highland', '1': 'To 工学院 COE' };
      return this.routes.map(route => ({
        value: `${route.name}-${route.direction}`,
        label: `${route.name} (${directionMap[route.direction] || '方向' + route.direction})`,
      }));
    },
    /**
     * 将原始站点数据格式化为 antd Select 组件需要的格式
     */
    stationOptions() {
      return this.stations.map(station => ({
        value: station.properties.station_id,
        label: station.properties.name.replace(/\n/g, ' / '),
      }));
    },
    /**
     * 对获取到的ETA信息按时间升序排序
     */
    sortedEtas() {
      return this.etas.slice().sort((a, b) => a.eta_minutes - b.eta_minutes);
    }
  },
  methods: {
    /**
     * 4. 创建一个处理系统主题变化的处理器
     */
    handleThemeChange(event) {
      this.isDarkMode = event.matches;
    },
    /**
     * 获取所有可用线路
     */
    async fetchRoutes() {
      this.isLoadingRoutes = true;
      try {
        const response = await axios.get(`${this.apiBaseUrl}/avail_route`);
        this.routes = response.data.routes || [];
      } catch (error) {
        console.error("获取线路列表失败:", error);
      } finally {
        this.isLoadingRoutes = false;
      }
    },
    /**
     * 当用户选择一条新线路时触发
     */
    handleRouteChange() {
      this.selectedStationId = undefined;
      this.stations = [];
      this.etas = [];
      this.clearEtaInterval();
      if (this.selectedRouteKey) {
        this.fetchStations();
      }
    },
    /**
     * 根据所选线路获取其所有站点
     */
    async fetchStations() {
      this.isLoadingStations = true;
      const [routeCode, direction] = this.selectedRouteKey.split('-');
      try {
        const response = await axios.get(`${this.apiBaseUrl}/${routeCode}/${direction}/stations`);
        this.stations = response.data.features || [];
      } catch (error) {
        console.error("获取站点列表失败:", error);
      } finally {
        this.isLoadingStations = false;
      }
    },
    /**
     * 当用户选择一个新站点时触发
     */
    handleStationChange() {
      this.etas = [];
      this.clearEtaInterval();
      if (this.selectedStationId) {
        this.fetchEta();
        this.etaInterval = setInterval(this.fetchEta, 30000);
      }
    },
    /**
     * 获取指定线路和站点的ETA信息
     */
    async fetchEta() {
      if (!this.selectedRouteKey || !this.selectedStationId) return;
      this.isLoadingEta = true;
      const [routeCode, direction] = this.selectedRouteKey.split('-');
      try {
        const response = await axios.get(`${this.apiBaseUrl}/${routeCode}/${direction}/${this.selectedStationId}`);
        this.etas = response.data || [];
      } catch (error) {
        this.etas = [];
        console.error("获取ETA信息失败:", error);
      } finally {
        this.isLoadingEta = false;
      }
    },
    /**
     * 清除ETA刷新定时器
     */
    clearEtaInterval() {
      if (this.etaInterval) {
        clearInterval(this.etaInterval);
        this.etaInterval = null;
      }
    }
  },
  /**
   * 组件创建时
   */
  created() {
    this.fetchRoutes();

    // 5. 检查当前系统主题并设置监听器
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = mediaQuery.matches;
      // 添加监听器以响应系统主题变化
      mediaQuery.addEventListener('change', this.handleThemeChange);
    }
  },
  /**
   * 组件销毁前
   */
  beforeUnmount() {
    this.clearEtaInterval();
    // 6. 移除监听器，防止内存泄漏
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.handleThemeChange);
  }
};
</script>

<style scoped>
.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  /* Card自带了边框，这里可以移除 */
}

.eta-results {
  margin-top: 24px;
  padding: 0 16px 16px;
}

.eta-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eta-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid;
  /* 使用 antd token 颜色，它会自动适应主题 */
  border-color: var(--ant-border-color-secondary);
  border-radius: 8px;
  background-color: var(--ant-control-item-bg-hover);
}

.eta-time {
  display: flex;
  align-items: baseline;
  margin-right: 24px;
  min-width: 80px;
  text-align: center;
  justify-content: center;
}

.eta-minutes {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--ant-primary-color); /* 使用主题的主色调 */
  line-height: 1;
}

.eta-unit {
  font-size: 1rem;
  color: var(--ant-color-text-secondary); /* 使用主题的次级文本颜色 */
  margin-left: 4px;
}

.eta-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eta-next-station {
  color: var(--ant-color-text-tertiary); /* 使用主题的三级文本颜色 */
  font-size: 0.9em;
}
</style>