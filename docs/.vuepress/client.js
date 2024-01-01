import { defineClientConfig } from '@vuepress/client'
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
    app.component("BusChartVue", () => import('./components/BusChartVue.vue'))
    app.component("Canteen", () => import('./components/Canteen.vue'))
  },
})
