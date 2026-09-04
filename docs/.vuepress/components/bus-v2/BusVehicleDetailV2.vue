<template>
  <article v-if="vehicle" class="vehicle-detail" :style="{ '--route-color': route?.color || vehicle.route_color || '#2878c8' }">
    <div class="vehicle-detail__head"><strong>{{ name }}</strong><button v-if="closable" type="button" :aria-label="language === 'zh' ? '关闭' : 'Close'" @click="$emit('close')">×</button></div>
    <p><i />{{ routeName }} <span v-if="directionName">· {{ directionName }}</span></p>
    <dl>
      <template v-if="vehicle.service_type"><dt>{{ language === 'zh' ? '服务类型' : 'Service' }}</dt><dd>{{ vehicle.service_type }}</dd></template>
      <dt>{{ language === 'zh' ? '车型' : 'Vehicle' }}</dt><dd>{{ vehicle.vehicle_type || '—' }}</dd>
      <dt>{{ language === 'zh' ? '数据状态' : 'Data' }}</dt><dd :class="`status-${vehicle.data_status || 'offline'}`">{{ statusText }}</dd>
      <dt>{{ language === 'zh' ? '更新时间' : 'Updated' }}</dt><dd>{{ updatedText }}</dd>
    </dl>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { displayName } from './core.mjs'

const props = defineProps({ vehicle: Object, routes: { type: Array, default: () => [] }, language: { type: String, default: 'zh' }, closable: Boolean })
defineEmits(['close'])
const route = computed(() => props.routes.find((item) => item.id === props.vehicle?.route_id))
const direction = computed(() => route.value?.directions?.find((item) => item.id === props.vehicle?.route_direction_id))
const name = computed(() => displayName(props.vehicle, props.language) || props.vehicle?.id || '')
const routeName = computed(() => displayName(route.value, props.language) || props.vehicle?.route_id || '')
const directionName = computed(() => displayName(direction.value, props.language))
const statusText = computed(() => ({ normal: props.language === 'zh' ? '正常' : 'Normal', delayed: props.language === 'zh' ? '延迟' : 'Delayed', offline: props.language === 'zh' ? '离线' : 'Offline' }[props.vehicle?.data_status] || (props.language === 'zh' ? '不可用' : 'Unavailable')))
const updatedText = computed(() => {
  const value = props.vehicle?.source_updated_at || props.vehicle?.received_at
  return value ? new Date(value).toLocaleString(props.language === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '—'
})
</script>

<style scoped>
.vehicle-detail { min-width: 14rem; padding: .75rem; border: 1px solid #d9e2ec; border-left: .35rem solid var(--route-color); border-radius: .45rem; background: var(--c-bg, #fff); color: var(--c-text, #243043); box-shadow: 0 .35rem 1rem rgba(23,43,77,.16); }
.vehicle-detail__head { display: flex; justify-content: space-between; gap: .75rem; }.vehicle-detail__head button { border: 0; background: transparent; color: inherit; font-size: 1.3rem; line-height: 1; cursor: pointer; }.vehicle-detail p { margin: .4rem 0 .65rem; }.vehicle-detail i { display: inline-block; width: .55rem; height: .55rem; margin-right: .35rem; border-radius: 50%; background: var(--route-color); }.vehicle-detail dl { display: grid; grid-template-columns: auto 1fr; gap: .25rem .65rem; margin: 0; font-size: .86rem; }.vehicle-detail dt { color: #667085; }.vehicle-detail dd { margin: 0; }.status-normal { color: #147a42; }.status-delayed { color: #a65f00; }.status-offline { color: #b42318; }
</style>
