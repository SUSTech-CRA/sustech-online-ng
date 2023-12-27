import { defineClientConfig } from '@vuepress/client'
import BusTable from "./components/BusTable.vue";
import TabView from "./components/TabView.vue";
import RealtimeMap from './components/RealtimeMap.vue'
import WeatherSpan from './components/weather-span.vue'
import BusChartVue from './components/BusChartVue.vue'
import CanteenTraffic from './components/CanteenTraffic.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component("BusTable", BusTable)
    app.component("TabView", TabView)
    app.component("RealtimeMap", RealtimeMap)
    app.component("WeatherSpan", WeatherSpan)
    app.component("BusChartVue", BusChartVue)
    add.component("CanteenTraffic", CanteenTraffic)
  },
})
