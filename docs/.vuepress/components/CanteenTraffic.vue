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

      <div class="tab-container">
        <!-- realtime-queue-length -->
        <div v-if="currentSelect === 'realtime-queue-length'">
          <div class="container mt-3" :class="{ 'dark-mode': isDarkMode }">
            <div v-for="canteen in trafficList" :key="canteen.canteen_id" class="card mb-3">
              <div class="card-header">
                <h5 class="card-title">{{ canteen.canteen_name }}</h5>
                <p class="card-subtitle">平均人数: {{ canteen.avg_number.toFixed(2) }}</p>
                <p class="card-subtitle">更新时间: {{ timeFormat(canteen.time) }}</p>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="booth in canteen.booth_traffic" :key="booth.booth_id">
                  <strong>{{ booth.booth_name }}</strong> - 排队人数约: {{ booth.avg_number }} 人
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 第二个 div 根据 value 控制显示与隐藏 -->
        <div v-if="currentSelect === 'queue-trend-chart'">
          <TrendChart></TrendChart>
        </div>
      </div>


    </a-config-provider>
  </div>
</template>

<script>
import axios from 'axios';
import { ConfigProvider } from 'ant-design-vue';
import { Segmented } from 'ant-design-vue';
import { watch, ref } from 'vue';

export default {
  name: "CanteenTraffic",
  data() {
    return {
      baseUrl: "http://localhost:8102/api/v1/traffic",
      trafficList: [],
      isDarkMode: false,
      formatter: new Intl.DateTimeFormat('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  },

  mounted() {
    this.detectDarkMode();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.isDarkMode = e.matches;
    });
    this.getTrafficList();
  },

  methods: {
    detectDarkMode() {
      this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    async getTrafficList() {
      try {
        // 获取初始交通列表
        const res = await axios.get(this.baseUrl + "/canteens");
        this.trafficList = res.data.data;

        // 创建一个请求每个食堂详细交通数据的 promise 数组
        const trafficPromises = this.trafficList.map(elem =>
          axios.get(`${this.baseUrl}/canteens/${elem.canteen_id}`)
        );

        // 并行执行所有请求
        const trafficResults = await Promise.all(trafficPromises);

        // 将结果合并回 trafficList
        this.trafficList = this.trafficList.map((elem, index) => {
          return {
            ...elem,
            booth_traffic: trafficResults[index].data.data
          };
        });
      } catch (error) {
        console.error("Error fetching traffic data:", error);
      }
    },
    timeFormat(time) {
      const t = new Date(time)
      const formattedTime = this.formatter.format(t)
      return formattedTime
    }
  },

  components: {
    AConfigProvider: ConfigProvider,
    ASegmented: Segmented
  },
  props: {
    isMapTabEnabled: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
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
      // {
      //   value: 'weekly-menus',
      //   payload: {
      //     title: '本周菜谱',
      //     subTitle: 'Weekly Menus'
      //   }
      // }
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
.container {
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.dark-mode {
  color: #ccc;
  background-color: #2c2c2c;
}

.card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-header {
  background-color: #007bff;
  color: white;
  padding: 16px 24px;
}

.dark-mode .card-header {
  background-color: #333;
}

.card-subtitle {
  font-size: 0.875rem;
  margin-top: 8px;
}

.list-group-item {
  font-size: 0.875rem;
  background-color: #FFFFFF;
  padding: 12px 24px;
  border: none;
  transition: background-color 0.3s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.dark-mode .list-group-item {
  background-color: #2a2a2a;
  color: #ddd;
  border-top: 1px solid #3a3a3a;
}

.dark-mode .list-group-item:hover {
  background-color: #3a3a3a;
}

@media (prefers-color-scheme: dark) {
  .dark-mode .card {
    background-color: #1a1a1a;
    color: white;
  }
}

.realtime-queue-length-hint {
  padding-bottom: 4px;
}

.tab-container {
  margin-top: 6px;
}
</style>
