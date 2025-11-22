<template>
  <div id="bus-table" class="mobile-container">
    <a-config-provider :theme="{ token: { colorPrimary: '#ED6C00' } }">
      <!-- Day-type selector -->
      <a-segmented
          class="segmented-day"
          v-model:value="dayType"
          :options="dayOptions"
          @change="onDayTypeChange"
      />

      <!-- Legend -->
      <div class="legend-container">
        <div class="legend-title">图例 / Legend</div>
        <div class="legend-grid">
          <div class="legend-item">
            <div class="legend-color line1-color"></div>
            <span>环线 Loop Line</span>
          </div>
          <div class="legend-item">
            <div class="legend-color shuttle1-color"></div>
            <span>环线电瓶车 Shuttle Loop Line</span>
          </div>
          <div class="legend-item">
            <div class="legend-color line2-color"></div>
            <span>环线大站快车 Rapid Loop</span>
          </div>
          <div class="legend-item">
            <div class="legend-color shuttle2-color"></div>
            <span>电瓶环线大站快车 Shuttle Rapid Loop</span>
          </div>
          <div class="legend-item">
            <div class="legend-color en-route-color"></div>
            <span>运行中 En-route</span>
          </div>
          <div class="legend-item">
            <div class="legend-color next-bus-color"></div>
            <span>下一班 Next Bus</span>
          </div>
        </div>
      </div>

      <!-- Filter toggle -->
      <div class="filter-toggle-container">
        <a-checkbox class="filter-toggle-checkbox" v-model:checked="showUpcomingOnly" @change="onFilterChange">
          仅显示即将 / 运行中班次 Only show upcoming/running buses
        </a-checkbox>
      </div>

      <!-- Line tabs -->
      <a-tabs
          v-model:activeKey="lineGroup"
          class="line-tabs"
          animated
          @change="onLineGroupChange"
      >
        <a-tab-pane key="group1" tab="欣园环线 Joy Highland Loop Line" />
        <a-tab-pane key="group2" tab="环线大站快车 Rapid Loop Line" />
      </a-tabs>

      <!-- Direction toggle -->
      <div class="direction-toggle-container" v-if="groupDirections.length > 0">
        <a-button 
          @click="toggleDirection"
          class="direction-button"
        >
          {{ currentDirection?.title || 'Loading...' }}
          <template #icon>
            <span class="direction-icon">⇄</span>
          </template>
        </a-button>
      </div>

      <!-- Schedule Table -->
      <a-spin :spinning="loading">
        <div v-if="currentDirection" class="schedule-container">
          <div 
            v-for="row in currentDirection.scheduleRows" 
            :key="row.hour" 
            class="schedule-row"
          >
            <div class="hour-column">{{ row.hour }}</div>
            <div class="separator-line"></div>
            <div class="minutes-column">
              <span
                v-for="minute in row.minutes"
                :key="`${minute.value}-${minute.type}`"
                :class="['minute-item', minute.type, minute.status, { 'past-bus': minute.timeValue + currentDirection.tripDuration < currentMinutes}]"
              >
                {{ minute.value }}
              </span>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="no-data">
          No schedule data available
        </div>
      </a-spin>
    </a-config-provider>
  </div>
  <div class="current-time">Effective: 2025-11-24, refreshed at {{ currentTime }}.</div>
</template>

<script>
import axios from 'axios'
import {
  ConfigProvider,
  Segmented,
  Tabs,
  TabPane,
  Spin,
  Checkbox,
  Button
} from 'ant-design-vue'

export default {
  name: 'BusTable',
  components: {
    'a-config-provider': ConfigProvider,
    'a-segmented': Segmented,
    'a-tabs': Tabs,
    'a-tab-pane': TabPane,
    'a-spin': Spin,
    'a-checkbox': Checkbox,
    'a-button': Button
  },
  data () {
    return {
      /** UI state */
      dayType: 'workday',
      dayOptions: [
        { label: '工作日\nWorkday', value: 'workday' },
        { label: '周末及节假日\nWeekend & Holiday', value: 'holiday' }
      ],
      lineGroup: 'group1',
      directionIndex: 0,
      loading: false,
      currentDate: new Date(),
      showUpcomingOnly: true,
      timerId: null,

      /** 数据 */
      groupDirections: [],

      /** 路线-文件映射 */
      scheduleMapping: {
        group1: {
          directions: [
            {
              title: '顺时针 / ClockWise',
              lines: [
                {
                  type: 'line1',
                  workday: '/bus_times/one_down.json',
                  holiday: '/bus_times/one_down_holiday.json'
                },
                {
                  type: 'shuttle1',
                  workday: '/bus_times/one_shuttle_down.json',
                  holiday: '/bus_times/one_shuttle_down_holiday.json'
                }
              ]
            },
            {
              title: '逆时针 / Counter Clockwise',
              lines: [
                {
                  type: 'line1',
                  workday: '/bus_times/one_up.json',
                  holiday: '/bus_times/one_up_holiday.json'
                },
                {
                  type: 'shuttle1',
                  workday: '/bus_times/one_shuttle_up.json',
                  holiday: '/bus_times/one_shuttle_up_holiday.json'
                }
              ]
            }
          ]
        },
        group2: {
          directions: [
            {
              title: '顺时针大站快车 / Rapid ClockWise',
              lines: [
                {
                  type: 'line2',
                  workday: '/bus_times/two_down.json',
                  holiday: '/bus_times/two_down_holiday.json'
                },
                {
                  type: 'shuttle2',
                  workday: '/bus_times/two_shuttle_down.json',
                  holiday: '/bus_times/two_shuttle_down_holiday.json'
                }
              ]
            },
            {
              title: '逆时针大站快车 / Rapid Counter Clockwise',
              lines: [
                {
                  type: 'line2',
                  workday: '/bus_times/two_up.json',
                  holiday: '/bus_times/two_up_holiday.json'
                },
                {
                  type: 'shuttle2',
                  workday: '/bus_times/two_shuttle_up.json',
                  holiday: '/bus_times/two_shuttle_up_holiday.json'
                }
              ]
            }
          ]
        }
      }
    }
  },
  computed: {
    currentTime () {
      const h = this.currentDate.getHours().toString().padStart(2, '0')
      const m = this.currentDate.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    },
    currentMinutes () {
      return this.currentDate.getHours() * 60 + this.currentDate.getMinutes()
    },
    currentDirection () {
      return this.groupDirections[this.directionIndex] || null
    }
  },
  watch: {
    currentMinutes () {
      this.updateBusStatus()
    },
    showUpcomingOnly () {
      this.applyFilter()
    }
  },
  async mounted () {
    await this.detectHoliday()
    this.startClock()
    await this.fetchSchedules()
  },
  beforeUnmount () {
    clearInterval(this.timerId)
  },
  methods: {
    startClock () {
      this.timerId = setInterval(() => {
        this.currentDate = new Date()
      }, 60 * 1000)
    },

    async detectHoliday() {
      const year = new Date().getFullYear()
      try {
        const res = await axios.get(`/${year}.json`)
        const dayMap = {}
        res.data.days.forEach(d => {
          dayMap[d.date] = d.isOffDay
        })
        const now = new Date()
        const key = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
        const weekend = now.getDay() === 6 || now.getDay() === 0

        let isHoliday = dayMap[key] == null ? weekend : dayMap[key]

        if (!isHoliday) {
          for (const holiday of res.data.summer_winter_holidays) {
            const start = new Date(holiday.start)
            const end = new Date(holiday.end)
            if (now >= start && now <= end) {
              isHoliday = true
              break
            }
          }
        }

        this.dayType = isHoliday ? 'holiday' : 'workday'
        console.log(`Today is ${isHoliday ? 'Holiday' : 'Workday'} (${key})`)
      } catch (e) {
        console.error('Failed to detect holiday, defaulting to workday.', e)
        this.dayType = 'workday'
      }
    },

    async fetchSchedules () {
      this.loading = true
      try {
        const groupConfig = this.scheduleMapping[this.lineGroup]
        const directions = []

        for (const dirConfig of groupConfig.directions) {
          const linePromises = dirConfig.lines.map(line => 
            axios.get(line[this.dayType])
          )
          const responses = await Promise.all(linePromises)
          
          const mergedSchedule = this.mergeSchedules(
            responses.map((resp, idx) => ({
              type: dirConfig.lines[idx].type,
              times: resp.data.times || [],
              tripDuration: resp.data.minuteOnRoad ?? 15
            }))
          )

          directions.push({
            title: dirConfig.title,
            scheduleRowsAll: mergedSchedule,
            scheduleRows: [],
            tripDuration: 15 // Default trip duration
          })
        }

        this.groupDirections = directions
        // Ensure directionIndex is valid
        if (this.directionIndex >= directions.length) {
          this.directionIndex = 0
        }
        this.updateBusStatus()
        this.applyFilter()
      } catch (e) {
        console.error(e)
        this.groupDirections = []
      } finally {
        this.loading = false
      }
    },

    mergeSchedules (schedules) {
      const hourGroups = {}
      
      schedules.forEach(schedule => {
        schedule.times.forEach(time => {
          const [h, m] = time.split(':')
          if (!hourGroups[h]) hourGroups[h] = []
          hourGroups[h].push({
            value: m,
            type: schedule.type,
            timeValue: parseInt(h) * 60 + parseInt(m),
            status: 'normal'
          })
        })
      })

      return Object.keys(hourGroups)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(h => ({
          hour: h.padStart(2, '0'),
          minutes: hourGroups[h].sort((a, b) => parseInt(a.value) - parseInt(b.value))
        }))
    },

    updateBusStatus () {
      if (!this.currentDirection || !this.currentDirection.scheduleRowsAll) return

      const tripDuration = this.currentDirection.tripDuration
      let nextBusFound = false

      this.currentDirection.scheduleRowsAll.forEach(row => {
        row.minutes.forEach(minute => {
          const departureTime = minute.timeValue
          
          if (departureTime <= this.currentMinutes && 
              this.currentMinutes <= departureTime + tripDuration) {
            minute.status = 'en-route'
          } else if (departureTime > this.currentMinutes && !nextBusFound) {
            minute.status = 'next-bus'
            nextBusFound = true
          } else {
            minute.status = 'normal'
          }
        })
      })
    },

    applyFilter () {
      if (!this.currentDirection || !this.currentDirection.scheduleRowsAll) return

      if (this.showUpcomingOnly) {
        const cutoff = this.currentMinutes - this.currentDirection.tripDuration
        this.currentDirection.scheduleRows = this.currentDirection.scheduleRowsAll
          .map(row => {
            const filteredMinutes = row.minutes.filter(minute => 
              minute.timeValue >= cutoff
            )
            return filteredMinutes.length ? { ...row, minutes: filteredMinutes } : null
          })
          .filter(Boolean)
      } else {
        this.currentDirection.scheduleRows = [...this.currentDirection.scheduleRowsAll]
      }
    },

    toggleDirection () {
      if (this.groupDirections.length > 0) {
        this.directionIndex = (this.directionIndex + 1) % this.groupDirections.length
        this.updateBusStatus()
        this.applyFilter()
      }
    },

    onDayTypeChange () {
      this.fetchSchedules()
    },

    onLineGroupChange () {
      this.directionIndex = 0
      this.fetchSchedules()
    },

    onFilterChange () {
      this.applyFilter()
    }
  }
}
</script>

<style scoped>
.mobile-container {
  /* Define color variables at component level */
  --sustech-orange: #ed6c00;
  --line1-color: rgb(255, 144, 28);
  --shuttle1-color: rgb(112, 48, 161);
  --line2-color: rgb(41, 171, 226);
  --shuttle2-color: rgb(112, 146, 190);
  --shuttle1-dark: rgb(200, 164, 237);
  
  /* Light mode variables */
  --bg-color: #ffffff;
  --text-color: #333;
  --card-bg: #fff;
  --border-color: #e8e8e8;
  --separator-color: #d9d9d9;
  --table-bg: #fff;

  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 0.5rem;
  font-size: 15px;
  max-width: 100%;
  margin: 0 auto;
}

/* Dark mode overrides for Ant Design Segmented */
[data-theme="dark"] .ant-segmented,
[data-theme="dark"] .ant-segmented-item
{
  background: #222 !important;
  color: #eee !important;
}

/* Dark mode detection - multiple methods for compatibility */
.mobile-container[data-theme="dark"],
.mobile-container.dark,
.dark .mobile-container,
[data-theme="dark"] .mobile-container,
@media (prefers-color-scheme: dark) {
  .mobile-container {
    --bg-color: #141414;
    --text-color: rgba(255, 255, 255, 0.85);
    --card-bg: #1f1f1f;
    --border-color: #404040;
    --separator-color: #555;
    --table-bg: #2a2a2a;
  }
}

/* Force dark mode styles when any dark class/attribute is present */
.mobile-container:is([data-theme="dark"], .dark, .dark *, [data-theme="dark"] *),
.dark .mobile-container,
[data-theme="dark"] .mobile-container {
  --bg-color: #141414 !important;
  --text-color: rgba(255, 255, 255, 0.85) !important;
  --card-bg: #1f1f1f !important;
  --border-color: #404040 !important;
  --separator-color: #555 !important;
  --table-bg: #2a2a2a !important;
}

/* Legend */
.legend-container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
  margin: 0.25rem 0 0.75rem 0;
}

.legend-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.4rem;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-color);
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 0.4rem;
  flex-shrink: 0;
}

.line1-color { background-color: var(--line1-color); }
.shuttle1-color { background-color: var(--shuttle1-color); }
.line2-color { background-color: var(--line2-color); }
.shuttle2-color { background-color: var(--shuttle2-color); }
.en-route-color { 
  background-color: rgba(255, 144, 28, 0.1);
  border: 2px solid var(--line1-color);
}
.next-bus-color { 
  background-color: var(--line1-color); 
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--line1-color);
}

/* Filter toggle */
.filter-toggle-container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin: 0.75rem 0;
}

.filter-toggle-container :deep(.ant-checkbox-wrapper) {
  color: var(--text-color) !important;
  font-size: 0.85rem;
}

.filter-toggle-container :deep(.ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner) {
  background-color: var(--sustech-orange) !important;
  border-color: var(--sustech-orange) !important;
}

/* Direction toggle */
.direction-toggle-container {
  margin: 0.75rem 0;
  text-align: center;
}

.direction-button {
  font-size: 0.85rem;
  height: auto;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  background-color: #666 !important;
  border-color: #666 !important;
  color: white !important;
}

.direction-button:hover {
  background-color: #777 !important;
  border-color: #777 !important;
}

.direction-icon {
  margin-left: 0.4rem;
  font-size: 1rem;
}

/* Schedule Table */
.schedule-container {
  background-color: var(--table-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.schedule-row {
  display: flex;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-color);
}

.schedule-row:last-child {
  border-bottom: none;
}

.hour-column {
  width: 45px;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 1.1rem;
  text-align: center;
  padding: 0 0.5rem;
  color: var(--text-color);
}

.separator-line {
  width: 1px;
  height: 28px;
  background-color: var(--separator-color);
  margin: 0 0.5rem;
  flex-shrink: 0;
}

.minutes-column {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding-right: 0.5rem;
}

.minute-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  border: 2px solid transparent;
  background-color: transparent;
  box-sizing: border-box;
}

/* Past buses have regular font weight */
.minute-item.past-bus {
  font-weight: 400 !important;
}

/* Normal state - colored text, light background */
.minute-item.line1 { 
  color: var(--line1-color);
  background-color: rgba(255, 144, 28, 0.1);
}
.minute-item.shuttle1 { 
  color: var(--shuttle1-color);
  background-color: rgba(112, 48, 161, 0.1);
}
.minute-item.line2 { 
  color: var(--line2-color);
  background-color: rgba(41, 171, 226, 0.1);
}
.minute-item.shuttle2 { 
  color: var(--shuttle2-color);
  background-color: rgba(112, 146, 190, 0.1);
}

/* En-route state - solid border in line color */
.minute-item.en-route.line1 {
  border-color: var(--line1-color) !important;
}
.minute-item.en-route.shuttle1 {
  border-color: var(--shuttle1-color) !important;
}
.minute-item.en-route.line2 {
  border-color: var(--line2-color) !important;
}
.minute-item.en-route.shuttle2 {
  border-color: var(--shuttle2-color) !important;
}

/* Next bus state - line color background, white text */
.minute-item.next-bus {
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
}
.minute-item.next-bus.line1 {
  background-color: var(--line1-color) !important;
}
.minute-item.next-bus.shuttle1 {
  background-color: var(--shuttle1-color) !important;
}
.minute-item.next-bus.line2 {
  background-color: var(--line2-color) !important;
}
.minute-item.next-bus.shuttle2 {
  background-color: var(--shuttle2-color) !important;
}

/* Dark mode adjustments for shuttle1 text readability */
.mobile-container:is([data-theme="dark"], .dark, .dark *, [data-theme="dark"] *) .minute-item.shuttle1:not(.next-bus),
.dark .mobile-container .minute-item.shuttle1:not(.next-bus),
[data-theme="dark"] .mobile-container .minute-item.shuttle1:not(.next-bus) {
  color: var(--shuttle1-dark) !important;
}

.mobile-container:is([data-theme="dark"], .dark, .dark *, [data-theme="dark"] *) .minute-item.en-route.shuttle1,
.dark .mobile-container .minute-item.en-route.shuttle1,
[data-theme="dark"] .mobile-container .minute-item.en-route.shuttle1 {
  border-color: var(--shuttle1-dark) !important;
}

/* Tabs and segments */
.segmented-day {
  margin: 0.5rem 0;
}

.line-tabs {
  margin: 0.75rem 0 0.5rem 0;
}

.line-tabs :deep(.ant-tabs-tab) {
  color: var(--text-color) !important;
  padding: 8px 12px !important;
  font-size: 0.85rem;
}

.line-tabs :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--sustech-orange) !important;
  font-weight: 600;
}

.line-tabs :deep(.ant-tabs-ink-bar) {
  background-color: var(--sustech-orange) !important;
}

.line-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 8px !important;
}

/* Current time */
.current-time {
  display: inline-block;
  margin-top: 0.75rem;
  background: rgba(0, 153, 255, 0.9);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* No data message */
.no-data {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-color);
  opacity: 0.6;
  font-size: 0.9rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .mobile-container {
    padding: 0.4rem;
    font-size: 14px;
  }
  
  .legend-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .hour-column {
    width: 35px;
    padding: 0 0.4rem;
    font-size: 1rem;
  }
  
  .separator-line {
    margin: 0 0.4rem;
    height: 24px;
  }
  
  .minute-item {
    min-width: 26px;
    height: 24px;
    font-size: 0.9rem;
  }
}

@media (max-width: 350px) {
  .legend-grid {
    grid-template-columns: 1fr;
  }
  
  .hour-column {
    width: 32px;
  }
  
  .legend-container {
    padding: 0.6rem;
  }
  
  .filter-toggle-container {
    padding: 0.4rem 0.6rem;
  }
}
</style>