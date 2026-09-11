<template>
  <article v-if="vehicle" class="vehicle-detail" :style="{ '--route-color': route?.color || vehicle.route_color || '#2878c8' }">
    <div class="vehicle-detail__head"><strong>{{ name }}</strong><button v-if="closable" type="button" :aria-label="language === 'zh' ? '关闭' : 'Close'" @click="$emit('close')">×</button></div>
    <p><i />{{ routeName }} <span v-if="directionName">· {{ directionName }}</span></p>
    <dl>
      <template v-if="vehicle.service_type"><dt>{{ language === 'zh' ? '服务类型' : 'Service' }}</dt><dd>{{ vehicle.service_type }}</dd></template>
      <dt>{{ language === 'zh' ? '车型' : 'Vehicle' }}</dt><dd>{{ vehicle.vehicle_type || '—' }}</dd>
      <template v-if="locationText"><dt>{{ language === 'zh' ? '运行位置' : 'Position' }}</dt><dd>{{ locationText }}</dd></template>
      <dt>{{ language === 'zh' ? '更新时间' : 'Updated' }}</dt><dd>{{ updatedText }}</dd>
    </dl>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { displayName, vehicleLocationText } from './core.mjs'

const props = defineProps({ vehicle: Object, routes: { type: Array, default: () => [] }, stops: { type: Array, default: () => [] }, language: { type: String, default: 'zh' }, closable: Boolean })
defineEmits(['close'])
const route = computed(() => props.routes.find((item) => item.id === props.vehicle?.route_id))
const direction = computed(() => route.value?.directions?.find((item) => item.id === props.vehicle?.route_direction_id))
const name = computed(() => displayName(props.vehicle, props.language) || props.vehicle?.id || '')
const routeName = computed(() => displayName(route.value, props.language) || props.vehicle?.route_id || '')
const directionName = computed(() => displayName(direction.value, props.language))
const locationText = computed(() => vehicleLocationText(props.vehicle, route.value, props.stops, props.language))
const updatedText = computed(() => {
  const value = props.vehicle?.source_updated_at || props.vehicle?.received_at
  return value ? new Date(value).toLocaleString(props.language === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '—'
})
</script>

<style scoped>
.vehicle-detail { min-width: 11rem; padding: .5rem .6rem; border: 1px solid #d9e2ec; border-left: .3rem solid var(--route-color); border-radius: .45rem; background: var(--c-bg, #fff); color: var(--c-text, #243043); box-shadow: 0 .25rem .75rem rgba(23,43,77,.16); }
.vehicle-detail__head { display: flex; justify-content: space-between; gap: .5rem; }.vehicle-detail__head button { border: 0; padding: 0; background: transparent; color: inherit; font-size: 1.2rem; line-height: 1; cursor: pointer; }.vehicle-detail p { margin: .25rem 0 .45rem; }.vehicle-detail i { display: inline-block; width: .5rem; height: .5rem; margin-right: .25rem; border-radius: 50%; background: var(--route-color); }.vehicle-detail dl { display: grid; grid-template-columns: auto 1fr; gap: .12rem .45rem; margin: 0; font-size: .82rem; }.vehicle-detail dt { color: #667085; }.vehicle-detail dd { margin: 0; }
</style>
