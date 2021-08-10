# 🚌新版巴士时刻表

<a data-fancybox title="" href="https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/transport/busline2.png">![](./busline2.png)</a>

<object-selector :objs="{
    '工作日': true,
    '节假日': false
    }"
    v-slot="weekdayProps">
    <br/>
    <object-selector
      :objs="weekdayProps.selected ? { 
        '欣园 > 工学院': '/bus_times/one_down.json',
        '工学院 > 欣园': '/bus_times/one_up.json',
        '欣园 > 科研楼': '/bus_times/two_down.json',
        '科研楼 > 欣园': '/bus_times/two_up.json',
      }:{ 
        '欣园 > 工学院': '/bus_times/one_down_holiday.json',
        '工学院 > 欣园': '/bus_times/one_up_holiday.json'
      }"
      v-slot="routeProps"
    >
      <data-request :path="routeProps.selected" v-slot="{ data }">
        <bus-timer v-if="data" v-bind="data"></bus-timer>
        <grid-list v-if="data" :data="data.times">
        </grid-list>
      </data-request>
    </object-selector>
  </object-selector>