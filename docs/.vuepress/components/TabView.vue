<template>
  <div v-if="TabsComponent">
    <a-config-provider :theme="{
      token: {
        colorPrimary: '#49BF7C',
      },
    }">
      <component :is="TabsComponent" type="card" size="large">
        <component :is="TabPaneComponent" key="tab1">
          <template #tab>
            <div class="tab-text">车辆实时位置<br />Bus Realtime Location</div>
          </template>
          位置每5秒自动刷新。Location refreshes automatically every 5 seconds
          <component :is="RealtimeMapComponent" v-if="RealtimeMapComponent" />
          <component :is="BusChartVueComponent" v-if="BusChartVueComponent" />
        </component>
        <component :is="TabPaneComponent" key="tab2">
          <template #tab>
            <div class="tab-text">时间表<br />Timetable</div>
          </template>
          <component :is="BusTableComponent" v-if="BusTableComponent" />
        </component>
      </component>
    </a-config-provider>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { ConfigProvider } from 'ant-design-vue';

export default {
  name: 'TabView',
  components: {
    AConfigProvider: ConfigProvider
  },
  setup() {
    const TabsComponent = ref(null);
    const TabPaneComponent = ref(null);
    const RealtimeMapComponent = ref(null);
    const BusChartVueComponent = ref(null);
    const BusTableComponent = ref(null);

    onMounted(async () => {
      const { Tabs } = await import('ant-design-vue');
      const { TabPane } = Tabs;
      const RealtimeMap = await import('./RealtimeMap.vue');
      const BusChartVue = await import('./BusChartVue.vue');
      const BusTable = await import('./BusTable.vue');

      TabsComponent.value = Tabs;
      TabPaneComponent.value = TabPane;
      RealtimeMapComponent.value = RealtimeMap.default;
      BusChartVueComponent.value = BusChartVue.default;
      BusTableComponent.value = BusTable.default;
    });

    return {
      TabsComponent,
      TabPaneComponent,
      RealtimeMapComponent,
      BusChartVueComponent,
      BusTableComponent,
    };
  },
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
