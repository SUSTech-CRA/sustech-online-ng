<template>
  <div>
    <a-tabs type="card" size="large">
      <a-tab-pane key="tab1" tab="车辆位置 Bus Realtime Loaction">
        位置每5秒自动刷新。Location refreshes automatically every 5 seconds
        <Realtimemap/>
        <BusChartVue/>
      </a-tab-pane>
      <a-tab-pane key="tab2" tab="时间表 Timetable">
        <BusTable></BusTable>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { Tabs } from 'ant-design-vue';

export default {
  name: 'TabView',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  }
};
</script>

<style>
@import 'ant-design-vue/es/tabs/style';

</style>
