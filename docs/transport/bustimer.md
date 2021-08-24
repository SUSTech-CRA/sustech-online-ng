# 🚌新版巴士时刻表

<a data-fancybox title="" href="https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/transport/busline2.png">![](./busline2.png)</a>

## 车辆位置（每五秒自动刷新）
<Realtimemap></Realtimemap>


<object-selector :objs="{
    '工作日': true,
    '节假日': false
    }"
    v-slot="weekdayProps">
    <br/>
    <object-selector
      :objs="weekdayProps.selected ? { 
        '1 号线 │ 工学院方向': '/bus_times/one_down.json',
        '1 号线 │ 欣园方向': '/bus_times/one_up.json',
        '2 号线 │ 科研楼方向': '/bus_times/two_down.json',
        '2 号线 │ 欣园方向': '/bus_times/two_up.json',
      } : {
        '1 号线 │ 工学院方向': '/bus_times/one_down_holiday.json',
        '1 号线 │ 欣园方向': '/bus_times/one_up_holiday.json'
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