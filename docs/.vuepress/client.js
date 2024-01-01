import { defineClientConfig } from '@vuepress/client'
import { defineAsyncComponent } from 'vue'
import BusTable from "./components/BusTable.vue";
import TabView from "./components/TabView.vue";
import RealtimeMap from './components/RealtimeMap.vue'
import WeatherSpan from './components/weather-span.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component("BusTable", BusTable)
    app.component("TabView", TabView)
    app.component("RealtimeMap", RealtimeMap)
    app.component("WeatherSpan", WeatherSpan)

    // 含有 echart的组件用动态加载，non-ssr模式
    app.component("BusChartVue", defineAsyncComponent(_ => import('./components/BusChartVue.vue')))
    app.component("Canteen", defineAsyncComponent(_ => import('./components/Canteen.vue')))
  },
})
