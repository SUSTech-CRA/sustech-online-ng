<template>
  <a-config-provider :theme="{
    token: {
      colorPrimary: '#00b96b',
    },
  }">
    <a-button v-for="(value, key, index) in objs" :key="index" @click="select(key)"
      :class="key == keySelected ? 'selected' : 'unselected'" :type="key == keySelected ? 'primary' : 'default'" size="large">
      {{ key }}
    </a-button>
  </a-config-provider>

  <slot v-bind:selected="objs[keySelected]"></slot>
</template>
<script>
import { ConfigProvider } from 'ant-design-vue';
import { Button as AButton } from 'ant-design-vue';

export default {
  components: {
    AButton,
    AConfigProvider: ConfigProvider
  },
  data() {
    return {
      keySelected: null,
    };
  },
  props: {
    objs: {},
    initPos: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    // console.log("pos", this.initPos);
    this.select(Object.keys(this.objs)[this.initPos])
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
  // background-color: white;
  // text-align: center;
  // text-decoration: none;
  // display: inline-block;
  // font-size: 14px;
  // border-radius: 2px;
  // border: 1px solid rgb(194, 194, 194);
}

.selected {
  // border-color: rgb(64, 169, 255);
  // background-color: rgb(64, 169, 255);
  // color: white;
}

.unselected {
  // color: #000;
}
</style>
