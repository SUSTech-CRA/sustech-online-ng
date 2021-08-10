import { defineClientAppEnhance } from '@vuepress/client'

import BusTimer from "./components/BusTimer.vue";
import ObjectSelector from "./components/ObjectSelector.vue";
import DataRequest from "./components/DataRequest.vue";
import GridList from "./components/GridList.vue";

export default defineClientAppEnhance(({ app, router, siteData }) => {
    app.component("BusTimer",BusTimer)
    app.component("ObjectSelector",ObjectSelector)
    app.component("DataRequest",DataRequest)
    app.component("GridList",GridList)
})