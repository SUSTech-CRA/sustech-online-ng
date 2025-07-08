<template>
  <div id="bus-table" class="mobile-container">
    <a-config-provider :theme="{ token: { colorPrimary: '#ED6C00' } }">
      <!-- Header -->
      <header class="mobile-header">
        <div class="current-time">{{ currentTime }}</div>
      </header>

      <!-- Day-type selector -->
      <a-segmented
          class="segmented-day"
          v-model:value="dayType"
          :options="dayOptions"
          @change="onDayTypeChange"
      />

      <!-- Legend -->
      <div class="legend-container">
        <h3 class="legend-title">图例 / Legend</h3>
        <div class="legend-item">
          <a-tag class="minute-tag next-bus">分钟/Min</a-tag>
          <div class="legend-desc"><b>下一班 (Next Bus)</b>: 即将发车</div>
        </div>
        <div class="legend-item">
          <a-tag class="minute-tag running-bus">分钟/Min</a-tag>
          <div class="legend-desc"><b>运行中 (Running)</b>: 在途中</div>
        </div>
        <div class="legend-item">
          <a-tag class="minute-tag">分钟/Min</a-tag>
          <div class="legend-desc"><b>常规 (Regular)</b>: 其他班次</div>
        </div>
      </div>

      <!-- Filter toggle -->
      <div class="filter-toggle-container">
        <div class="filter-toggle">
          <a-checkbox class="filter-toggle-checkbox" v-model:checked="showUpcomingOnly" @change="onFilterChange">
            仅显示即将 / 运行中班次 Only show bus after now
          </a-checkbox>
        </div>
      </div>

      <!-- Line tabs -->
      <a-tabs
          v-model:activeKey="line"
          class="line-tabs"
          animated
          @change="onLineChange"
      >
        <a-tab-pane key="line1" tab="1号线/Line 1" />
        <a-tab-pane key="line2" tab="2号线/Line 2" />
        <a-tab-pane key="shuttle" tab="电瓶车/Shuttle" />
      </a-tabs>

      <!-- Schedules -->
      <a-spin :spinning="loading">
        <div v-for="(dir, idx) in directions" :key="idx">
          <a-card
              :title="dir.title"
              class="mobile-schedule-card"
              :headStyle="{ fontWeight: 600 }"
          >
            <div
                v-for="row in dir.scheduleRows"
                :key="row.hour"
                class="mobile-schedule-row"
            >
              <div class="mobile-hour">{{ row.hour }}:</div>
              <div class="mobile-minutes">
                <a-tag
                    v-for="minute in row.minutes"
                    :key="minute"
                    class="minute-tag"
                    :class="getTagClass(dir, row.hour, minute)"
                >
                  {{ minute }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </div>
      </a-spin>
    </a-config-provider>
  </div>
</template>

<script>
import axios from 'axios'
import {
  ConfigProvider,
  Segmented,
  Tabs,
  TabPane,
  Card,
  Tag,
  Spin,
  Checkbox
} from 'ant-design-vue'

export default {
  name: 'BusTable',
  components: {
    'a-config-provider': ConfigProvider,
    'a-segmented': Segmented,
    'a-tabs': Tabs,
    'a-tab-pane': TabPane,
    'a-card': Card,
    'a-tag': Tag,
    'a-spin': Spin,
    'a-checkbox': Checkbox
  },
  data () {
    return {
      /** UI state */
      dayType: 'workday',
      dayOptions: [
        { label: '工作日\nWorkday', value: 'workday' },
        { label: '节假日\nHoliday （暑假）', value: 'holiday' }
      ],
      line: 'line1',
      loading: false,
      currentDate: new Date(),
      showUpcomingOnly: true, // 默认只看未来 / 运行中
      directions: [],
      timerId: null,

      /** 路线-文件映射 */
      scheduleMapping: {
        line1: {
          directions: [
            {
              title: '欣园总站 → 工学院 / Joy Highland → COE',
              workday: '/bus_times/one_down.json',
              holiday: '/bus_times/one_down_holiday.json'
            },
            {
              title: '工学院 → 欣园总站 / COE → Joy Highland',
              workday: '/bus_times/one_up.json',
              holiday: '/bus_times/one_up_holiday.json'
            }
          ]
        },
        line2: {
          directions: [
            {
              title: '欣园总站 → 科研楼 / Joy Highland → Research Bldg.',
              workday: '/bus_times/two_down.json',
              holiday: '/bus_times/two_down_holiday.json'
            },
            {
              title: '科研楼 → 欣园总站 / Research Bldg. → Joy Highland',
              workday: '/bus_times/two_up.json',
              holiday: '/bus_times/two_up_holiday.json'
            }
          ]
        },
        shuttle: {
          directions: [
            {
              title: '欣园总站 → 一号门 / Joy Highland → Gate 1',
              workday: '/bus_times/shuttle_down.json',
              holiday: '/bus_times/shuttle_down_holiday.json'
            },
            {
              title: '一号门 → 欣园总站 / Gate 1 → Joy Highland',
              workday: '/bus_times/shuttle_up.json',
              holiday: '/bus_times/shuttle_up_holiday.json'
            }
          ]
        }
      }
    }
  },
  computed: {
    /** 当前时间 (HH:MM) */
    currentTime () {
      const h = this.currentDate.getHours().toString().padStart(2, '0')
      const m = this.currentDate.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    },
    /** 当前时间对应的分钟值 */
    currentMinutes () {
      return this.currentDate.getHours() * 60 + this.currentDate.getMinutes()
    }
  },
  watch: {
    /** 每分钟刷新高亮与过滤 */
    currentMinutes () {
      this.computeNextBus()
      this.applyFilterToAll()
    },
    /** 切换过滤 */
    showUpcomingOnly () {
      this.applyFilterToAll()
    }
  },
  async mounted () { // <-- Add async
    await this.detectHoliday() // <-- Add await
    this.startClock()
    this.fetchSchedules()
  },
  beforeUnmount () {
    clearInterval(this.timerId)
  },
  methods: {
    /* ---------- 基础时钟 / 国假检测 ---------- */
    startClock () {
      this.timerId = setInterval(() => {
        this.currentDate = new Date()
      }, 60 * 1000)
    },
    async detectHoliday() { // <-- Add async
      const year = new Date().getFullYear()
      try {
        const res = await axios.get(`/${year}.json`) // <-- Add await
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
        this.dayType = 'workday' // Default on error
      }
    },

    /* ---------- 数据拉取 ---------- */
    async fetchSchedules () {
      this.loading = true
      try {
        const cfgList = this.scheduleMapping[this.line].directions
        const resps = await Promise.all(
            cfgList.map(cfg => axios.get(cfg[this.dayType]))
        )

        this.directions = resps.map((resp, idx) => {
          const cfg = cfgList[idx]
          const times = resp.data.times || []
          const minuteOnRoad = resp.data.minuteOnRoad ?? 15

          // 小时分组 & 排序
          const hourGroups = this.groupByHour(times)
          const scheduleRowsAll = this.buildSortedRows(hourGroups)

          return {
            title: cfg.title,
            tripDuration: minuteOnRoad,
            allTimes: times,
            scheduleRowsAll,
            scheduleRows: [],
            nextBusTime: null
          }
        })

        this.computeNextBus()
        this.applyFilterToAll()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    groupByHour (timesArr) {
      const map = {}
      timesArr.forEach(t => {
        const [h, m] = t.split(':')
        if (!map[h]) map[h] = []
        map[h].push(m)
      })
      return map
    },

    buildSortedRows (hourGroups) {
      return Object.keys(hourGroups)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(h => ({
            hour: h.padStart(2, '0'),
            minutes: hourGroups[h].sort((a, b) => parseInt(a) - parseInt(b))
          }))
    },

    /* ---------- 下一班 / 高亮 ---------- */
    computeNextBus () {
      this.directions.forEach(dir => {
        dir.nextBusTime = dir.allTimes.find(t => {
          const [h, m] = t.split(':')
          return parseInt(h) * 60 + parseInt(m) > this.currentMinutes
        })
      })
    },

    /* ---------- 过滤展示 ---------- */
    applyFilterToAll () {
      this.directions.forEach(this.updateDisplayedRows)
    },
    updateDisplayedRows (dir) {
      if (this.showUpcomingOnly) {
        const cutoff = this.currentMinutes - dir.tripDuration // 运行中 + 将来
        dir.scheduleRows = dir.scheduleRowsAll
            .map(row => {
              const mins = row.minutes.filter(min => {
                const dep = parseInt(row.hour) * 60 + parseInt(min)
                return dep >= cutoff
              })
              return mins.length ? { hour: row.hour, minutes: mins } : null
            })
            .filter(Boolean)
      } else {
        dir.scheduleRows = dir.scheduleRowsAll
      }
    },

    /* ---------- UI handlers ---------- */
    onDayTypeChange () {
      this.fetchSchedules()
    },
    onLineChange () {
      this.fetchSchedules()
    },
    onFilterChange () {
      this.applyFilterToAll()
    },

    /* ---------- 样式辅助 ---------- */
    getTagClass (dir, hour, minute) {
      const dep = parseInt(hour) * 60 + parseInt(minute)
      if (
          dep <= this.currentMinutes &&
          this.currentMinutes < dep + dir.tripDuration
      ) {
        return 'running-bus'
      }
      if (`${hour}:${minute}` === dir.nextBusTime) {
        return 'next-bus'
      }
      return ''
    }
  }
}
</script>

<style scoped>
/* 定义基础颜色变量 */
:root {
  --sustech-orange: #ed6c00;
  --sustech-cyan: #2bb7b3;
  --sustech-darkgreen: #003f43;
}

/* 默认（亮色）模式下的样式 */
.mobile-container {
  --bg-color: #ffffff;
  --text-color: #333;
  --card-bg: #fff;
  --row-border-color: #f0f0f0;

  background-color: var(--bg-color);
  padding: 0.5rem 0.75rem;
  transition: background-color 0.3s ease;

  /* 调整基础字体大小。你可以在这里修改数值来改变整体字体大小。*/
  font-size: 16px;
}

.mobile-header {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.mobile-schedule-card {
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  background-color: var(--card-bg) !important;
  border: 1px solid var(--row-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mobile-schedule-card :deep(.ant-card-head-title),
.mobile-schedule-card :deep(.ant-card-body) {
  color: var(--text-color);
}

.mobile-schedule-row {
  display: flex;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--row-border-color);
}
.mobile-schedule-row:last-child {
  border-bottom: none;
}

.mobile-hour {
  width: 3rem;
  flex-shrink: 0;
  font-weight: 700;
  /* 字体大小使用 rem 单位，会随父级 font-size 缩放 */
  font-size: 1.1rem;
  color: var(--text-color);
  opacity: 0.85;
  font-family: 'Roboto Mono', monospace;
}

.mobile-minutes {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
}

.minute-tag {
  margin: 2px 4px;
  border-radius: 9999px !important;
  font-family: 'Roboto Mono', monospace;
  /* 字体大小使用 rem 单位，会随父级 font-size 缩放 */
  font-size: 0.95rem;
}

@keyframes breathing {
  0% { opacity: 0.7; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.7; transform: scale(0.98); }
}

.next-bus {
  background-color: var(--sustech-orange) !important;
  color: #fff !important;
  font-weight: 700 !important;
  transform: scale(1.1);
  background-color: rgba(237, 108, 0, 0.8) !important;
  box-shadow: 0 0 10px rgba(237, 108, 0, 0.6);
  border-color: transparent !important;
}

.running-bus {
  background-color: #e0f2f1 !important;
  color: var(--sustech-darkgreen) !important;
  animation: breathing 2s ease-in-out infinite;
  border-color: #2bb7b3 !important;
}

/* 新增图例样式 */
.legend-container {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--row-border-color);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  margin-top: 1rem;
}
.legend-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--row-border-color);
  padding-bottom: 0.75rem;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}
.legend-item:last-child {
  margin-bottom: 0;
}
.legend-item .minute-tag {
  flex-shrink: 0;
  margin-right: 1rem;
}
.legend-desc {
  font-size: 0.9rem;
}

.filter-toggle-container {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--row-border-color);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  margin-top: 1rem;
}

/* 选择节假日的选项卡 segmented-day */
.segmented-day :deep(.ant-segmented-item-label) {
  color: rgb(236,236,245);
}
.segmented-day :deep(.ant-segmented-item-selected .ant-segmented-item-label) {
  color: rgb(31,31,31);
}

/* --- 夜间模式修复与调整 --- */
@media (prefers-color-scheme: dark) {
  .mobile-container {
    --bg-color: #1B1B1F;
    --text-color: rgba(255, 255, 255, 0.85);
    --card-bg: #1d1d1d;
    --row-border-color: #303030;
  }

  .filter-toggle-container :deep(.ant-checkbox-wrapper) {
    color: var(--text-color);
  }

  /*  Tabs 未选中项颜色 */
  .line-tabs :deep(.ant-tabs-tab) {
    color: rgba(255, 255, 255, 0.45);
  }
  .line-tabs :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: var(--sustech-orange);
  }

  /* 覆盖 antd Tag 的默认夜间模式样式，使其更匹配主题 */
  .minute-tag {
    color: var(--text-color);
    background: #262626;
    border-color: #424242;
  }

  .next-bus {
    box-shadow: 0 0 12px rgba(237, 108, 0, 0.4);
  }
  .running-bus {
    background-color: #004D40 !important;
    color: #b2dfdb !important;
    border-color: #00796B !important;
  }
}

/* 通用样式 */
.header-title {
  font-size: 1.5rem;
  font-weight: 700;
}
.header-sub {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}
.current-time {
  display: inline-block;
  margin-top: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  padding: 0.1rem 0.6rem;
  border-radius: 9999px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
}
.segmented-day {
  margin: 0.75rem 0;
}

</style>