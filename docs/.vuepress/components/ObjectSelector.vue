<template>
  <button
    v-for="(value, key, index) in objs"
    :key="index"
    @click="select(key)"
    :class="key==keySelected? 'selected' : 'unselected'"
  >
    {{ key }}
  </button>
  <slot v-bind:selected="objs[keySelected]"></slot>
</template>
<script>
export default {
  data() {
    return {
      keySelected: null,
    };
  },
  props: {
    objs: {},
  },
  mounted() {
      this.keySelected = Object.keys(this.objs)[0]
  },
  watch: {
    objs(val) {
      for (let key in this.objs) {
        this.keySelected = key;
        break;
      }
    },
  },
  computed: {},
  methods: {
    select: function (key) {
      this.keySelected = key;
    },
  },
};
</script>
<style lang="scss">
button {
  padding: 10px 15px;
  margin: 3px 3px 3px 3px;
  background-color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  border-radius: 2px;
  border: 1px solid rgb(194, 194, 194);
}
.selected{
  border-color: rgb(64, 169, 255);
  background-color: rgb(64, 169, 255);
  color:white;
}
.unselected{
  color: #000;
}
</style>