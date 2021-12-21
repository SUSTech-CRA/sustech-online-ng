# 🚌校园巴士时刻表 SUSTech Campus Bus Info

## 路线图 System Map

<a data-fancybox title="" href="https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng/-/raw/master/docs/transport/busline2.png">![](./busline2.png)</a>

## 车辆位置 Bus Realtime Loaction

位置每5秒自动刷新。Location refreshes automatically every 5 seconds

<Realtimemap></Realtimemap>

## 时间表 Timetable

<script>
  import axios from "axios";
  export default {
    mounted() {
      axios
        .get("/2021.json")
        .then(response => (bus_redirect(response.data)));
      function bus_redirect(holidata) {
        // JSON is from https://github.com/NateScarlet/holiday-cn
        // need to update by year.
        // Download the JSON to path "docs/.vuepress/public/YYYY.json"
        var day_map = {};
        for (let i = 0; i < holidata.days.length; i++) {
          day_map[holidata.days[i].date] = holidata.days[i].isOffDay;
        }
        var now_date = new Date();
        var ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(now_date);
        var mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(now_date);
        var da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(now_date);
        var day_key = `${ye}-${mo}-${da}`;
        var is_holiday;
        if (day_map[day_key] == null) {
          // 不在国家假日调整表里
          console.log("Not in GOV declaration");
          var day_in_week = now_date.getDay();
          var isWeekend = (day_in_week == 6) || (day_in_week == 0);
          // 6 = Saturday, 0 = Sunday
          is_holiday = isWeekend;
        } else {
          console.log("In GOV declaration");
          is_holiday = day_map[day_key];
        }
        if (is_holiday) {
          console.log("节假日");
          var bus_div = document.getElementById("bustable");
          var this_day_btn = bus_div.getElementsByTagName("button")[1];
          this_day_btn.click();
        } else {
          console.log("工作日");
          var bus_div = document.getElementById("bustable");
          var this_day_btn = bus_div.getElementsByTagName("button")[0];
          this_day_btn.click();
        }
      }
    },
  }
</script>

<div id="bustable">
  <object-selector :objs="{
    '工作日 Workday': true,
    '节假日 Holiday': false
    }" v-slot="weekdayProps">
    <br />
    <object-selector :objs="weekdayProps.selected ? {
        'Line 1 号线 │ 工学院方向 To COE': '/bus_times/one_down.json',
        'Line 1 号线 │ 欣园方向 To Joy Highland': '/bus_times/one_up.json',
        'Line 2 号线 │ 科研楼方向 To Research Building': '/bus_times/two_down.json',
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

<Adsense_unit>
</Adsense_unit>