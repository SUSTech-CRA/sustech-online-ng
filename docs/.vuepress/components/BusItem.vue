<template>
  <tr
    v-if="secondFromDispatch"
    :class="isWaiting ? 'bus-waiting' : 'bus-running'"
  >
    <td>{{ startTime }}</td>
    <td>
      {{ isWaiting ? "等待中" : "在途中" }}
    </td>
    <td>{{ (isWaiting ? "" : "") + " " + timeToShow }}</td>
    <td v-if="stationEstimate">{{ stationEstimate }}</td>
  </tr>
</template>
<script>
function parseSecond(second) {
  let s = Math.abs(second);
  let h = Math.floor(s / 3600);
  s -= h * 3600;
  let m = Math.floor(s / 60);
  s -= m * 60;
  return [h, m, s];
}
function formatNumber(number) {
  return number < 10 ? "0" + number : number;
}
export default {
  props: {
    secondFromDispatch: { type: Number },
    stationEstimate: { type: String },
    startSecond: { type: Number },
  },
  computed: {
    timeToShow: function () {
      let parsedSecond = parseSecond(this.secondFromDispatch);
      let moreThanHalf = parsedSecond[2] >= 30;
      if (parsedSecond[1] > 0)
        return [parsedSecond[0]>0?parsedSecond[0]+"时":"",parsedSecond[1], "分", moreThanHalf ? "半" : ""].join("");
      else {
        return moreThanHalf ? "半分钟" : "不到半分";
      }
    },
    startTime: function () {
      let parsedSecond = parseSecond(this.startSecond);
      return [
        "",
        formatNumber(parsedSecond[0]),
        ":",
        formatNumber(parsedSecond[1]),
      ].join("");
    },
    isWaiting: function () {
      return this.secondFromDispatch <= 0;
    },
  },
};
</script>
<style lang="scss">
</style>