import { defineClientConfig } from '@vuepress/client'
import BusTable from "./components/BusTable.vue";
import Realtimemap from './components/Realtime-map.vue'
import WeatherSpan from './components/weather-span.vue'
import BusChart from './components/BusChart.vue'
// import AdsenseUnit from './components/adsense-inline-article.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component("BusTable", BusTable)
    app.component("Realtimemap", Realtimemap)
    app.component("WeatherSpan", WeatherSpan)
    app.component("BusChart", BusChart)
    // app.component("AdsenseUnit", AdsenseUnit)
  },
})
