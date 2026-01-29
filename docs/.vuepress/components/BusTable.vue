<template>
  <div id="bus-table" class="bus-container">
    <a-config-provider :theme="{ token: { colorPrimary: '#ED6C00' } }">
      <!-- Header / Day Type Selector -->
      <a-segmented
        class="day-segmented"
        v-model:value="currentDayType"
        :options="dayOptions"
        @change="loadScheduleData"
        block
      >
        <template #label="{ label, value }">
          <div style="padding: 4px 0">
            <div style="font-weight: 600">{{ label.split('\n')[0] }}</div>
            <div style="font-size: 0.8em; opacity: 0.8">{{ label.split('\n')[1] }}</div>
          </div>
        </template>
      </a-segmented>

      <!-- Legend -->
      <div class="legend-bar">
        <div class="legend-item">
          <span class="dot bus"></span> 巴士 Bus
        </div>
        <div class="legend-item">
          <span class="dot shuttle"></span> 电瓶车 EV Shuttle
        </div>
        <div class="legend-item">
          <span class="tag next">07:20</span> 下一班 Next
        </div>
        <div class="legend-item">
          <span class="tag en-route">07:10</span> 运行中 En-route
        </div>
      </div>
      
      <!-- Filter Toggle -->
      <div class="filter-bar">
         <a-switch size="small" v-model:checked="showUpcomingOnly" />
         <span class="filter-label" @click="showUpcomingOnly = !showUpcomingOnly">
           仅显示即将/运行中 Only show upcoming/running
         </span>
         <span class="time-display flex-right">
           {{ currentTimeStr }}
         </span>
      </div>

      <!-- Schedule Content -->
      <a-spin :spinning="loading">
        <div v-if="scheduleGroups.length > 0" class="schedule-list">
          <!-- Groups (e.g. Line 1, Line 2, Short-turn) -->
          <div 
            v-for="group in scheduleGroups" 
            :key="group.id" 
            class="group-section"
          >
            <!-- Group Header if multiple groups or distinct section -->
            <!-- Use a different style for main headers vs route rows? 
                 The image shows "Line 1" as a big block. 
                 My config has "Group" -> "Routes".
                 I will render each Group as a standard table-like structure.
            -->
            
            <!-- Loop through Routes in Group -->
            <div 
              v-for="(route, rIndex) in group.routes" 
              :key="rIndex" 
              class="route-row"
            >
              <!-- Left: Route Info -->
              <div class="route-info" :style="{ borderLeftColor: route.color || group.color || '#ccc' }">
                <!-- If it's the first route in group, show Group Title? 
                     Or show Route Name?
                     Image 1: "1 Line 1 CW" is the big box. 
                     Image 1: "Short-turn" has "A" and "B". 
                     I'll show Group Title for the first route if pertinent, or just Route Name.
                     Let's use a combination.
                -->
                <div class="route-title-main">
                  <span v-if="rIndex === 0 && group.routes.length > 1" class="group-title-text">{{ group.title.split('\n')[0] }}</span>
                  <span v-else class="route-name-text">{{ route.name || group.title }}</span>
                </div>
                <div class="route-desc" v-if="route.description">
                   {{ route.description.split('\n')[0] }}
                   <div class="route-desc-sub">{{ route.description.split('\n')[1] }}</div>
                </div>
              </div>

              <!-- Right: Times -->
              <div class="route-times">
                 <template v-if="route.times && route.times.length">
                   <span
                     v-for="(t, tIndex) in getFilteredTimes(route.times)"
                     :key="tIndex"
                     class="time-pill"
                     :class="[t.type, t.status]"
                   >
                     {{ t.text }}
                   </span>
                 </template>
                 <div v-else class="no-times">
                   当日无服务 No service
                 </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          No schedule data loaded.
        </div>
      </a-spin>
      
      <div class="footer-note">
        自 2025.11.24 起使用 Effective from 2025.11.24
      </div>

    </a-config-provider>
  </div>
</template>

<script>
import axios from 'axios'
import {
  ConfigProvider,
  Segmented,
  Spin,
  Switch,
  Tag
} from 'ant-design-vue'

export default {
  name: 'BusTable',
  components: {
    'a-config-provider': ConfigProvider,
    'a-segmented': Segmented,
    'a-spin': Spin,
    'a-switch': Switch,
    'a-tag': Tag
  },
  data() {
    return {
      config: null,
      currentDayType: 'workday', // 'workday' or 'holiday'
      dayOptions: [
        { label: '工作日\nWorkdays', value: 'workday' },
        { label: '周末及节假日\nWeekends & Holidays', value: 'holiday' }
      ],
      scheduleGroups: [],
      loading: false,
      now: new Date(),
      timer: null,
      showUpcomingOnly: true,
      defaultminuteOnRoad: 20 // Default duration in minutes for "en-route" calculation
    }
  },
  computed: {
    currentTimeStr() {
      const h = this.now.getHours().toString().padStart(2, '0')
      const m = this.now.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    },
    currentMinutes() {
      return this.now.getHours() * 60 + this.now.getMinutes()
    }
  },
  async mounted() {
    this.startClock()
    await this.fetchConfig()
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    startClock() {
      this.timer = setInterval(() => {
        this.now = new Date()
        // Re-evaluate statuses periodically
        this.updateStatuses() 
      }, 30000)
    },
    
    async fetchConfig() {
      this.loading = true
      try {
        const res = await axios.get('/bus_config.json')
        this.config = res.data
        // Auto-detect day type
        await this.detectDayType()
        await this.loadScheduleData()
      } catch (e) {
        console.error('Failed to load bus config', e)
      } finally {
        this.loading = false
      }
    },
    
    async detectDayType() {
      try {
        const year = new Date().getFullYear()
        const res = await axios.get(`/${year}.json`)
        const dayMap = {}
        if (res.data && res.data.days) {
            res.data.days.forEach(d => { dayMap[d.date] = d.isOffDay })
        }
        
        const now = new Date()
        // const key = now.toISOString().split('T')[0] // This might be UTC, be careful.
        // Use local YYYY-MM-DD
        const key = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
        const weekend = now.getDay() === 0 || now.getDay() === 6
        
        // Default to weekend check if not in map
        let isHoliday = dayMap[key] !== undefined ? dayMap[key] : weekend
        
        // Check ranges (winter/summer)
        if (!isHoliday && res.data.summer_winter_holidays) {
           for (const h of res.data.summer_winter_holidays) {
             const start = new Date(h.start)
             const end = new Date(h.end)
             if (now >= start && now <= end) {
               isHoliday = true
               break
             }
           }
        }
        
        this.currentDayType = isHoliday ? 'holiday' : 'workday'
      } catch (e) {
        console.log('Holiday detection failed or config missing, defaulting to workday', e)
        // Keep default
      }
    },
    
    async loadScheduleData() {
      if (!this.config) return
      this.loading = true
      const dayConfig = this.config[this.currentDayType] || []
      
      const newGroups = []
      
      for (const groupConfig of dayConfig) {
        const processedRoutes = []
        for (const routeConfig of groupConfig.routes) {
          // Fetch all sources
          let mergedTimes = []
          
          if (routeConfig.sources) {
            const promises = routeConfig.sources.map(src => axios.get(src.url).then(r => ({ data: r.data, type: src.type })))
            try {
               const results = await Promise.all(promises)
               results.forEach(res => {
                 const times = res.data.times || []
                 const duration = res.data.minuteOnRoad
                 // Tag them
                 times.forEach(t => {
                   mergedTimes.push({
                     text: t,
                     val: this.timeToMinutes(t),
                     type: res.type || 'bus', // 'bus' or 'shuttle'
                     status: 'future',
                     duration: duration
                   })
                 })
               })
            } catch (err) {
              console.error(`Error loading sources for ${routeConfig.name}`, err)
            }
          } else if (routeConfig.timesUrl) {
            // Legacy support single url
            try {
              const res = await axios.get(routeConfig.timesUrl)
              const times = res.data.times || []
              const duration = res.data.minuteOnRoad
              times.forEach(t => {
                mergedTimes.push({
                  text: t,
                  val: this.timeToMinutes(t),
                  type: 'bus',
                  status: 'future',
                  duration: duration
                })
              })
            } catch (err) { console.error(err) }
          }
          
          // Sort
          mergedTimes.sort((a, b) => a.val - b.val)
          
          processedRoutes.push({
            ...routeConfig,
            times: mergedTimes
          })
        }
        
        newGroups.push({
          ...groupConfig,
          routes: processedRoutes
        })
      }
      
      this.scheduleGroups = newGroups
      this.updateStatuses()
      this.loading = false
    },
    
    timeToMinutes(t) {
      if (!t) return 0
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    },
    
    updateStatuses() {
      const now = this.currentMinutes
      
      this.scheduleGroups.forEach(g => {
        g.routes.forEach(r => {
          let nextFound = false
          r.times.forEach(t => {
            // Status logic
            const duration = t.duration || this.defaultminuteOnRoad
            if (t.val < now - duration) {
              t.status = 'past'
            } else if (t.val <= now && t.val >= now - duration) {
              t.status = 'en-route'
            } else {
              // Future
              if (!nextFound) {
                t.status = 'next'
                nextFound = true
              } else {
                t.status = 'future'
              }
            }
          })
        })
      })
    },
    
    getFilteredTimes(times) {
      if (!this.showUpcomingOnly) return times
      
      // Filter: Show 'en-route', 'next', and 'future'. Hide 'past'.
      // But maybe keep a few past ones for context? No, user asked for "Upcoming/Running".
      // Also, if end of day, show "No times".
      return times.filter(t => t.status !== 'past')
    }
  }
}
</script>

<style scoped>
.bus-container {
  max-width: 100%;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
  color: #333;
}

/* Dark mode basic support */
@media (prefers-color-scheme: dark) {
  .bus-container {
    color: #eee;
  }
}

.day-segmented {
  margin-bottom: 1rem;
  background: #f0f0f0;
}
[data-theme='dark'] .day-segmented {
  background: #333;
}

.legend-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 6px;
}
[data-theme='dark'] .legend-bar { background: #1f1f1f; }

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot.bus { background: #333; }
.dot.shuttle { background: #00bcd4; } /* Cyan for shuttle as per image */

[data-theme='dark'] .dot.bus { background: #aaa; }

.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.filter-label {
  cursor: pointer;
  user-select: none;
}

.flex-right {
  margin-left: auto;
  font-weight: bold;
  font-family: monospace;
}

/* Schedule List Styles */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.group-section {
  display: flex;
  flex-direction: column;
  gap: 0; 
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
[data-theme='dark'] .group-section { 
  border-color: #444; 
  background: #1a1a1a;
}

.route-row {
  display: flex;
  border-bottom: 1px solid #eee;
}
[data-theme='dark'] .route-row { border-bottom-color: #444; }

.route-row:last-child {
  border-bottom: none;
}

.route-info {
  width: 130px;
  flex-shrink: 0;
  padding: 0.8rem;
  background: #fbfbfb;
  border-left: 6px solid #ccc; /* Dynamic color applied inline */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
[data-theme='dark'] .route-info { background: #222; }

.route-title-main {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.3rem;
  line-height: 1.2;
}

.route-desc {
  font-size: 0.75rem;
  opacity: 0.7;
}

.route-times {
  flex: 1;
  padding: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;
  background: #fff;
}
[data-theme='dark'] .route-times { background: #141414; }

.time-pill {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.95rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  color: #333;
}
[data-theme='dark'] .time-pill { color: #ccc; }

/* Type Styling */
.time-pill.shuttle {
  color: #00bcd4; /* Cyan */
  font-weight: 500;
}
.time-pill.bus {
  color: #333;
}
[data-theme='dark'] .time-pill.bus { color: #ddd; }

/* Status Styling */
.time-pill.en-route {
  border: 1px solid #ED6C00;
  color: #ED6C00 !important;
  background: rgba(237, 108, 0, 0.1);
}

.time-pill.next {
  background: #ED6C00;
  color: white !important;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(237, 108, 0, 0.4);
}

.time-pill.past {
  opacity: 0.3;
}
/* Legend tags */
.tag.next {
  background: #ED6C00;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}
.tag.en-route {
  border: 1px solid #ED6C00;
  color: #ED6C00;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.8em;
}

.footer-note {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.6;
}

/* Mobile responsive */
@media (max-width: 600px) {
  .route-row {
    flex-direction: column;
  }
  .route-info {
    width: 100%;
    border-left: none;
    border-top: 4px solid #ccc; /* Move color to top */
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
  }
  .route-title-main { margin-bottom: 0; }
  .route-desc { text-align: right; }
}
</style>