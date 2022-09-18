<template>
  <div id="weather-container">
    <span id="weather">{{ text }}</span>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: "weather-span",
  data: () => ({
    text: ""
  }),
  mounted() {
    this.load_weather();
  },

  methods: {
    load_weather() {
      axios.get("https://api.sustech.online/weather")
          .then((res) => {
            this.text = res.data.msg;
          })
    },
  },
};
</script>
