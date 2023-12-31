<template>
  <transition name="fade" mode="out-in" appear>
    <div class="container mt-3">
      <div class="card mb-3" v-for="canteen in trafficList" :key="canteen.canteen_id">
        <div class="card-header">
          <h5 class="card-title">{{ canteen.canteen_name }} {{ canteen.canteen_en_name }}</h5>
          <p class="card-subtitle">平均人数 Avg Number: {{ canteen.avg_number.toFixed(2) }}</p>
          <p class="card-subtitle">更新时间 Last Updated: {{ timeFormat(canteen.time) }}</p>
        </div>
        <ul class="list-group">
          <li class="list-group-item" v-for="booth in canteen.booth_traffic" :key="booth.booth_id">
            <strong>{{ booth.booth_name }} {{ booth.booth_en_name }}</strong> - 排队人数约: {{ booth.avg_number }} 人
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  name: "RealtimeTraffic",
  data() {
    return {
      baseUrl: "https://susteen.itbill.cn/api/v1/traffic",
      trafficList: [],
      formatter: new Intl.DateTimeFormat('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
    };
  },

  mounted() {
    this.getTrafficList();
  },

  methods: {
    async getTrafficList() {
      try {
        const res = await axios.get(this.baseUrl + "/canteens");
        this.trafficList = res.data.data;

        const trafficPromises = this.trafficList.map(elem =>
          axios.get(`${this.baseUrl}/canteens/${elem.canteen_id}`)
        );

        const trafficResults = await Promise.all(trafficPromises);

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
      const t = new Date(time);
      return this.formatter.format(t);
    }
  },
};
</script>

<style scoped>
.container {
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.card {
  margin: 10px 0px;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-header {
  color: #333;
  padding: 8px 24px;
  background-color: #fff;
}

.card-subtitle {
  font-size: 0.875rem;
  margin-top: 4px;
}

.list-group {
  list-style-type: none;
  padding-left: 0;
  border-radius: 16px;
}

.list-group-item {
  list-style-type: none;
  font-size: 0.875rem;
  background-color: #f4f4f4;
  padding: 16px 24px;
  border: none;
  transition: background-color 0.3s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* 淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
