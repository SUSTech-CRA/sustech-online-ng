import {defineClientAppEnhance} from '@vuepress/client'

import BusTable from "./components/BusTable.vue";
// import BusTimer from "./components/BusTimer.vue";
// import ObjectSelector from "./components/ObjectSelector.vue";
// import DataRequest from "./components/DataRequest.vue";
// import GridList from "./components/GridList.vue";
import Realtimemap from './components/Realtime-map.vue'
import WeatherSpan from './components/weather-span.vue'
// import AdsenseUnit from './components/adsense-inline-article.vue'

export default defineClientAppEnhance(({app, router, siteData}) => {
    app.component("BusTable", BusTable)
    app.component("Realtimemap", Realtimemap)
    app.component("WeatherSpan", WeatherSpan)
    // app.component("AdsenseUnit", AdsenseUnit)
})
