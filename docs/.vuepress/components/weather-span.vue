<template>
  <div id="weather-container">
    <span id="weather"></span>
  </div>
</template>


<script>
export default {
  name: "weather-span",
  mounted() {
    this.load_weather();
  },

  methods: {
    load_weather() {
      $.getJSON("https://api.sustech.online/weather", function (data) {
        $("#weather-container span").text(data.msg);
      });
    },
  },
};
</script>
