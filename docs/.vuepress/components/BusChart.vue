<template>
  <BasicPure></BasicPure>
</template>
<script>
import {applyPureReactInVue} from 'veaury'
import BasicReactComponent from './bus_ni1o1/Basic'

export default {
  components: {
    BasicPure: applyPureReactInVue(BasicReactComponent)
  },
  setup() {
  }
}
</script>