<template>
  <div>

    <a-segmented v-model:value="initSelect" :options="tabOptions" @change="switchTab">
      <template #label="{ payload }">
        <div style="padding: 4px 8px">
          <div>{{ payload.title }}</div>
          <div>{{ payload.subTitle }}</div>
        </div>
      </template>
    </a-segmented>

    <div class="tab-container">
      <!-- 第一个 div 根据 value 控制显示与隐藏 -->
      <div v-if="currentSelect === 'bus-location'">
        <div class="bus-location-hint" v-if="showMapChart">
          <b>位置每5秒自动刷新。</b>Location refreshes automatically every 5 seconds.<br>
        </div>
        <RealtimeMapv2 v-if="showMapChart" />
        <!-- <BusETAdemo /> -->
        <!-- <BusChartVue /> -->
      </div>

<!--       第二个 div 根据 value 控制显示与隐藏 -->
      <div v-if="currentSelect === 'timetable'">
        <BusTable></BusTable>
<!--        <BusTable_img />-->
      </div>
    </div>

  </div>
</template>

<script>
import { Segmented } from 'ant-design-vue';
import { ref } from 'vue';

export default {
  name: 'TabView',
  components: {
    ASegmented: Segmented
  },
  props: {
    isMapTabEnabled: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const initSelect = ref('bus-location');
    const currentSelect = ref('bus-location');
    const tabOptions = ref([
      {
        value: 'bus-location',
        payload: {
          title: '车辆实时位置',
          subTitle: 'Bus Realtime Location',
        },
      },
      {
        value: 'timetable',
        payload: {
          title: '时间表',
          subTitle: 'Timetable',
        },
      },
    ]);

    const switchTab = (tabOptionValue) => {
      currentSelect.value = tabOptionValue;
    };

    let showMapChart = props.isMapTabEnabled;

    return {
      initSelect,
      currentSelect,
      tabOptions,
      switchTab,
      showMapChart
    };
  },
};
</script>

<style scoped>
.tab-container {
  margin-top: 6px;
}

.bus-location-hint {
  padding-bottom: 4px;
}

/* Dark mode overrides for Ant Design Segmented */
[data-theme="dark"] .ant-segmented,
[data-theme="dark"] .ant-segmented-item
{
  background: #222 !important;
  color: #eee !important;
}
</style>