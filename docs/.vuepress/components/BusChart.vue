<template>
  <BasicPure></BasicPure>
</template>
<script>
import {applyPureReactInVue} from 'veaury'
import BasicReactComponent from './bus_ni1o1/App'

export default {
  components: {
    BasicPure: applyPureReactInVue(BasicReactComponent)
  },
  setup() {
  }
}
</script>