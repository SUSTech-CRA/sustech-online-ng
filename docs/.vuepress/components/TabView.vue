<template>
  <div>
    <a-config-provider :theme="{
      token: {
        colorPrimary: '#49BF7C',
      },
    }">
      <a-tabs type="card" size="large">
        <a-tab-pane key="tab1">
          <template #tab>
            <div class="tab-text">车辆实时位置<br />Bus Realtime Location</div>
          </template>
          位置每5秒自动刷新。Location refreshes automatically every 5 seconds
          <Realtimemap />
          <BusChartVue />
        </a-tab-pane>
        <a-tab-pane key="tab2">
          <template #tab>
            <div class="tab-text">时间表<br />Timetable</div>
          </template>
          <BusTable></BusTable>
        </a-tab-pane>
      </a-tabs>
    </a-config-provider>
  </div>
</template>

<script>
import { Tabs } from 'ant-design-vue';
import { ConfigProvider } from 'ant-design-vue';

export default {
  name: 'TabView',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AConfigProvider: ConfigProvider
  }
};
</script>

<style>
.ant-tabs {
  color: unset;
  font-size: unset;
  font-variant: unset;
  font-feature-settings: unset;
}

.tab-text {
  white-space: pre-line;
}
</style>
