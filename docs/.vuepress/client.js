import { defineClientConfig } from 'vuepress/client'
import BusTable from "./components/BusTable.vue";
import BusTable_img from "./components/BusTable_img.vue";
import BusAnnouncement from "./components/BusAnnouncement.vue";
import TabView from "./components/TabView.vue";
import RealtimeMap from './components/RealtimeMap.vue'
import CampusMap from './components/CampusMap.vue'
import WeatherSpan from './components/weather-span.vue'
import BusChartVue from './components/BusChartVue.vue'
import Canteen from './components/Canteen.vue'
import AdSenseInline from './components/adsense-inline.vue'
import AdSenseDisplayAD from './components/adsense-displayad.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component("BusTable", BusTable)
    app.component("BusTable_img", BusTable_img)
    app.component("BusAnnouncement", BusAnnouncement)
    app.component("TabView", TabView)
    app.component("RealtimeMap", RealtimeMap)
    app.component("CampusMap", CampusMap)
    app.component("WeatherSpan", WeatherSpan)
    app.component("AdSenseInline", AdSenseInline)
    app.component("AdSenseDisplayAD", AdSenseDisplayAD)

    // 含有echart的组件，注意需要用non-ssr模式
    app.component("BusChartVue", BusChartVue)
    app.component("Canteen", Canteen)
  },
})
