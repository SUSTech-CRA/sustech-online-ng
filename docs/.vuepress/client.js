import { defineClientConfig } from 'vuepress/client'
import BusTable from "./components/BusTable.vue";
import TabView from "./components/TabView.vue";
import RealtimeMap from './components/RealtimeMap.vue'
import WeatherSpan from './components/weather-span.vue'
import BusChartVue from './components/BusChartVue.vue'
import Canteen from './components/Canteen.vue'
import AdSenseInline from './components/adsense-inline.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component("BusTable", BusTable)
    app.component("TabView", TabView)
    app.component("RealtimeMap", RealtimeMap)
    app.component("WeatherSpan", WeatherSpan)
    app.component("AdSenseInline", AdSenseInline)

    // 含有echart的组件，注意需要用non-ssr模式
    app.component("BusChartVue", BusChartVue)
    app.component("Canteen", Canteen)
  },
})
