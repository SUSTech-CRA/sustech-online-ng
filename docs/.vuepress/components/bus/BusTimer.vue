<template>
  <div>
    <table v-if="busToShow" class="bus-timer-tb">
      <thead>
        <tr>
          <th colspan="2">
            {{ stations[0][0] }} > {{ stations[stations.length - 1][0] }}
          </th>
          <th colspan="2" style="text-align: right">
            {{ formatNumber(hour) }}:{{ formatNumber(minute) }}:{{
              formatNumber(second)
            }}
          </th>
        </tr>
        <bus-item
          v-for="(value, key) in busToShow"
          :secondFromDispatch="value[0]"
          :stationEstimate="stationEstimate(value[0])"
          :startSecond="value[1]"
          :key="key"
        ></bus-item>
        <tr>
          <td v-if="Object.keys(busToShow).length == 0" colspan="4">
            短时间内没有班次了
          </td>
        </tr>
      </thead>
    </table>
    <p class="plus-note">* 站点估计仅供参考</p>
  </div>
</template>
<script>
function getSecondToDayStart(h, m, s) {
  return h * 3600 + m * 60 + s;
}
function parseTimes(times) {
  let parsedTime = [];
  for (let item of times) {
    let timeArray = item.split(":");
    let secondToDayStart = getSecondToDayStart(
      Number(timeArray[0].trim()),
      Number(timeArray[1].trim()),
      0
    );
    parsedTime.push(secondToDayStart);
  }
  return parsedTime.sort((a, b) => a - b);
}
import BusItem from "./BusItem.vue";
export default {
  data() {
    return {
      // Second from the start of the day, which we call "zero"
      secondFromZero: 0,
      second: 0,
      minute: 0,
      hour: 0,
      timeRangeAfterReach: 3,
    };
  },
  props: {
    /*
        times: should be like ["07:10","08:20"]
        stations: should be like [["station1",0],["station2",20],...,[station final",100]]
      */
    times: {},
    stations: {},
    minuteOnRoad: {
      type: Number,
      default: 20,
    },
    timeRangeBeforeDispatch: { type: Number, default: 60 },
  },
  components: {
    BusItem: BusItem,
  },
  mounted() {
    // this.secondFromZero = 50000 // This is for test
    // Set Timer
    setInterval(() => {
      this.tick();
    }, 1000);
  },
  methods: {
    // Increase timers
    tick: function () {
      // ticker 需要每次自己调用最新的本地时间，不能自己计数。
      // 当页面切换到后台时，setInterval 为了节电会暂停。
      var tmp_date = new Date();
      this.hour = tmp_date.getHours();
      this.minute = tmp_date.getMinutes();
      this.second = tmp_date.getSeconds();
      this.secondFromZero = getSecondToDayStart(
        this.hour,
        this.minute,
        this.second
      );
    },
    // Add zero in front of a number
    formatNumber: function (number) {
      return number < 10 ? "0" + number : number;
    },
    stationEstimate: function (secondFromDispatch) {
      if (!this.stationNames) return "null";
      if (secondFromDispatch <= 0) return this.stationNames[0];
      let nStations = this.stationNames.length;
      if (secondFromDispatch >= this.minuteOnRoad * 60)
        return this.stationNames[nStations - 1];
      let currentPostion = secondFromDispatch / 60 / this.minuteOnRoad;
      let currentStation = "";
      for (let p in this.stationPositions) {
        if (currentPostion < this.stationPositions[p]) {
          currentStation = this.stationNames[p];
          break;
        }
      }
      return currentStation;
    },
  },
  computed: {
    secondList: function () {
      return parseTimes(this.times);
    },
    busToShow: function () {
      if (!this.secondList) return null;
      let busDispatched = [];
      let busWaiting = [];
      for (let dispatchTime of this.secondList) {
        let diff = this.secondFromZero - dispatchTime;
        if (diff < 0 && diff > -this.timeRangeBeforeDispatch * 60) {
          busWaiting.push([diff, dispatchTime]);
        }
        if (
          diff > 0 &&
          diff < (this.minuteOnRoad + this.timeRangeAfterReach) * 60
        ) {
          busDispatched.push([diff, dispatchTime]);
        }
      }
      return busDispatched.concat(busWaiting);
    },
    stationNames: function () {
      let stationNames = [];
      for (let item of this.stations) {
        stationNames.push(item[0]);
      }
      return stationNames;
    },
    stationPositions: function () {
      let stationPositions = [];
      for (let item of this.stations) {
        stationPositions.push(item[1]);
      }
      return stationPositions;
    },
  },
};
</script>
<style lang="scss" scoped>
table {
  border-collapse: collapse;
  border: none;
  border-spacing: 0;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  color: #444;
  font-weight: 500;
  margin-top: 5px;
  width: 95%;
  max-width: 500px;
}
@media (max-width: 320px) {
  table {
    font-size: 12px;
  }
  .bus-timer-tb td {
    padding: 0px;
  }
}

.bus-running {
  background-color: rgba(175, 255, 94, 0.233);
  color: green;
}
.bus-waiting {
  background-color: rgba(238, 238, 238, 0.411);
}

.plus-note {
  font-size: 10px;
}
.bus-timer-tb th,
.bus-timer-tb td {
  border: none;
  padding: 10px;
  text-align: left;
}
.bus-timer-tb th {
  background-color: #dce9f9;
}
.bus-timer-tb th:first-child {
  border-radius: 6px 0 0 0;
}
.bus-timer-tb th:last-child {
  border-radius: 0 6px 0 0;
}
</style>
