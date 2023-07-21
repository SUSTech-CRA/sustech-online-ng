<template>
  <div id="bustable">
    <object-selector :objs="{
      '工作日 Workday': true,
      '节假日 Holiday': false
    }" v-slot="weekdayProps">
      <br />
      <object-selector :objs="weekdayProps.selected ? {
        'Line 1 号线 │ 工学院方向 To COE': '/bus_times/one_down.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up.json',
        'Line 2 号线 │ 科研楼方向 To Research Bldg.': '/bus_times/two_down.json',
        'Line 2 号线 │ 欣园方向 To Joy Highland': '/bus_times/two_up.json',
      } : {
        'Line 1 号线 │ 工学院方向  To COE': '/bus_times/one_down_holiday.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up_holiday.json'
      }" v-slot="routeProps">
        <data-request :path="routeProps.selected" v-slot="{ data }">
          <bus-timer v-if="data" v-bind="data"></bus-timer>
          <grid-list v-if="data" :data="data.times">
          </grid-list>
        </data-request>
      </object-selector>
    </object-selector>
  </div>
</template>

<script>
import axios from "axios";
import BusTimer from "./bus/BusTimer.vue";
import ObjectSelector from "./bus/ObjectSelector.vue";
import DataRequest from "./bus/DataRequest.vue";
import GridList from "./bus/GridList.vue";

export default {
  name: "BusTable",
  components: {
    BusTimer,
    ObjectSelector,
    DataRequest,
    GridList
  },
  mounted() {
    function toggleButtonBasedOnDate(holidata) {
      // JSON is from https://github.com/NateScarlet/holiday-cn
      // need to update by year.
      // Download the JSON to path "docs/.vuepress/public/YYYY.json"
      var dayMap = {};
      for (let i = 0; i < holidata.days.length; i++) {
        dayMap[holidata.days[i].date] = holidata.days[i].isOffDay;
      }
      var nowDate = new Date();
      var ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(nowDate);
      var mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(nowDate);
      var da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(nowDate);
      var dayKey = `${ye}-${mo}-${da}`;
      var isHoliday;
      if (dayMap[dayKey] == null) {
        // 不在国家假日调整表里
        console.log("Not in GOV declaration");
        var dayInWeek = nowDate.getDay();
        var isWeekend = (dayInWeek == 6) || (dayInWeek == 0);
        // 6 = Saturday, 0 = Sunday
        isHoliday = isWeekend;
      } else {
        console.log("In GOV declaration");
        isHoliday = dayMap[dayKey];
      }
      if (isHoliday) {
        console.log("节假日");
        const busDiv = document.getElementById("bustable");
        const thisDayBtn = busDiv.getElementsByTagName("button")[1];
        thisDayBtn.click();
      } else {
        console.log("工作日");
        const busDiv = document.getElementById("bustable");
        const thisDayBtn = busDiv.getElementsByTagName("button")[0];
        thisDayBtn.click();
      }
    }

    axios.get("/2023.json").then(response => {
      toggleButtonBasedOnDate(response.data);
    });
  },
}
</script>

<style scoped></style>
