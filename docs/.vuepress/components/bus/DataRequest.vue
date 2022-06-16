<template>
  <slot :data="data"></slot>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      data: null,
    };
  },
  props: {
    path: { type: String },
  },
  watch: {
    path(val) {
      if (val)
        return axios.get(val).then((response) => {
          this.data = response.data;
        });
    },
  },
};
</script>