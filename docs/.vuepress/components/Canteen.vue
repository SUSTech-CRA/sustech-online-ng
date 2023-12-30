<template>
  <div>
    <a-config-provider :theme="{
      token: {
        colorPrimary: '#49BF7C',
      },
    }">
      <a-segmented v-model:value="initSelect" :options="tabOptions" @change="switchTab">
        <template #label="{ payload }">
          <div style="padding: 4px 8px">
            <div>{{ payload.title }}</div>
            <div>{{ payload.subTitle }}</div>
          </div>
        </template>
      </a-segmented>
    </a-config-provider>

    <div class="tab-container">
      <div v-if="currentSelect === 'realtime-queue-length'">
        <RealtimeTraffic></RealtimeTraffic>
      </div>

      <div v-if="currentSelect === 'queue-trend-chart'">
        <TrendChart></TrendChart>
      </div>

      <div v-if="currentSelect === 'daily-menus'">
        <Menu></Menu>
      </div>

    </div>

  </div>
</template>

<script>
import { ConfigProvider } from 'ant-design-vue';
import { Segmented } from 'ant-design-vue';
import { watch, ref } from 'vue';

import RealtimeTraffic from './canteen/RealtimeTraffic.vue'
import TrendChart from './canteen/TrendChart.vue';
import Menu from './canteen/Menu.vue'

export default {
  name: "Canteen",
  components: {
    AConfigProvider: ConfigProvider,
    ASegmented: Segmented,
    RealtimeTraffic,
    TrendChart,
    Menu

  },
  data() {
    return {

    }
  },
  setup() {
    const initSelect = ref('realtime-queue-length');
    const currentSelect = ref('realtime-queue-length');
    const tabOptions = ref([
      {
        value: 'realtime-queue-length',
        payload: {
          title: '实时排队人数',
          subTitle: 'Realtime Queue Length',
        },
      },
      {
        value: 'queue-trend-chart',
        payload: {
          title: '排队趋势图',
          subTitle: 'Queue Trend Chart',
        },
      },
      {
        value: 'daily-menus',
        payload: {
          title: '今日菜谱',
          subTitle: 'Daily Menus'
        }
      }
    ]);

    const switchTab = (tabOptionValue) => {
      currentSelect.value = tabOptionValue;
    };

    return {
      initSelect,
      currentSelect,
      tabOptions,
      switchTab,
    };
  },
}
</script>

<style>
.tab-container {
  margin-top: 6px;
}
</style>