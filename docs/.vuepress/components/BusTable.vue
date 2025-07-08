<template>
  <div id="bus-table" class="mobile-container">
    <a-config-provider :theme="themeConfig">
      <header class="mobile-header">
        <div class="current-time">{{ currentTime }}</div>
      </header>

      <a-segmented
          class="segmented-day"
          v-model:value="dayType"
          :options="dayOptions"
          @change="onDayTypeChange"
      />

      <div class="legend-container">
        <h3 class="legend-title">图例 / Legend</h3>
        <div class="legend-item">
          <a-tag class="minute-tag next-bus">MM</a-tag>
          <div class="legend-desc">
            <b>下一班 (Next Bus)</b>: 即将发车的班次
          </div>
        </div>
        <div class="legend-item">
          <a-tag class="minute-tag running-bus">MM</a-tag>
          <div class="legend-desc">
            <b>运行中 (Running)</b>: 在途中的班次
          </div>
        </div>
        <div class="legend-item">
          <a-tag class="minute-tag">MM</a-tag>
          <div class="legend-desc">
            <b>常规 (Regular)</b>: 其他班次
          </div>
        </div>
      </div>

      <a-tabs
          v-model:activeKey="line"
          class="line-tabs"
          animated
          @change="onLineChange"
      >
        <a-tab-pane key="line1" tab="1号线" />
        <a-tab-pane key="line2" tab="2号线" />
        <a-tab-pane key="shuttle" tab="电瓶车" />
      </a-tabs>

      <a-spin :spinning="loading">
        <div v-for="(dir, idx) in directions" :key="idx">
          <a-card :title="dir.title" class="mobile-schedule-card" :headStyle="{fontWeight:600}">
            <div
                v-for="row in dir.scheduleRows"
                :key="row.hour"
                class="mobile-schedule-row"
            >
              <div class="mobile-hour">{{ row.hour }}</div>
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
  Spin
} from 'ant-design-vue'
// 3. (夜间模式) 导入 antd 的暗色算法
import { theme } from 'ant-design-vue';

export default {
  name: 'BusTable',
  components: {
    'a-config-provider': ConfigProvider,
    'a-segmented': Segmented,
    'a-tabs': Tabs,
    'a-tab-pane': TabPane,
    'a-card': Card,
    'a-tag': Tag,
    'a-spin': Spin
  },
  data() {
    return {
      // ui state
      dayType: 'workday',
      dayOptions: [
        { label: '工作日\nWorkday', value: 'workday' },
        { label: '节假日\nHoliday', value: 'holiday' }
      ],
      line: 'line1',
      loading: false,
      currentDate: new Date(),
      directions: [],
      timerId: null,
      // 3. (夜间模式) 新增状态来追踪夜间模式
      isDarkMode: false,
      // internal mapping
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
      },
    }
  },
  computed: {
    currentTime() {
      const h = this.currentDate.getHours().toString().padStart(2, '0')
      const m = this.currentDate.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    },
    currentMinutes() {
      return (
          this.currentDate.getHours() * 60 + this.currentDate.getMinutes()
      )
    },
    // 3. (夜间模式) 新增计算属性来动态生成主题配置
    themeConfig() {
      return {
        token: { colorPrimary: '#ED6C00' },
        algorithm: this.isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }
    }
  },
  watch: {
    currentMinutes() {
      this.computeNextBus()
    }
  },
  mounted() {
    this.detectHoliday()
    this.startClock()
    this.fetchSchedules()
    // 3. (夜间模式) 初始化并监听主题变化
    this.setupThemeDetector()
  },
  beforeUnmount() {
    clearInterval(this.timerId)
    // 3. (夜间模式) 停止监听
    if (this.themeObserver) this.themeObserver.disconnect();
  },
  methods: {
    onDayTypeChange() {
      this.fetchSchedules()
    },
    onLineChange() {
      this.fetchSchedules()
    },
    startClock() {
      this.timerId = setInterval(() => {
        this.currentDate = new Date()
      }, 20 * 1000) // 每20秒更新一次即可
    },
    detectHoliday() {
      const year = new Date().getFullYear();
      axios.get(`/${year}.json`).then(response => {
        const holidata = response.data
        const dayMap = {}
        holidata.days.forEach(d => {
          dayMap[d.date] = d.isOffDay
        })
        const now = new Date()
        const ye = now.getFullYear()
        const mo = (now.getMonth() + 1).toString().padStart(2, '0')
        const da = now.getDate().toString().padStart(2, '0')
        const key = `${ye}-${mo}-${da}`
        let isHoliday
        if (dayMap[key] == null) {
          const dayInWeek = now.getDay()
          isHoliday = dayInWeek === 6 || dayInWeek === 0
        } else {
          isHoliday = dayMap[key]
        }
        this.dayType = isHoliday ? 'holiday' : 'workday'
      })
    },
    async fetchSchedules() {
      this.loading = true
      try {
        const dirConfigs = this.scheduleMapping[this.line].directions
        const requests = dirConfigs.map(cfg =>
            axios.get(cfg[this.dayType])
        )
        const responses = await Promise.all(requests)
        this.directions = responses.map((res, idx) => {
          const cfg = dirConfigs[idx]
          const timesArr = res.data.times || []

          // 2. (小时乱序) 将原始 times 数组按小时分组并排序
          const hourGroups = this.groupByHour(timesArr);
          const scheduleRows = Object.keys(hourGroups)
              .sort((a, b) => parseInt(a) - parseInt(b)) // <-- 关键排序！
              .map(hour => ({
                hour: hour,
                minutes: hourGroups[hour]
              }));

          const tripDuration =
              res.data.minuteOnRoad != null ? res.data.minuteOnRoad : 15
          return {
            title: cfg.title,
            allTimes: timesArr,
            scheduleRows, // <-- 使用排好序的数组
            nextBusTime: null,
            tripDuration
          }
        })
        this.computeNextBus()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    groupByHour(timesArr) {
      const map = {}
      timesArr.forEach(t => {
        const [h, m] = t.split(':')
        if (!map[h]) map[h] = []
        map[h].push(m)
      })
      return map
    },
    computeNextBus() {
      this.directions.forEach(dir => {
        dir.nextBusTime = dir.allTimes.find(t => {
          const [h, m] = t.split(':')
          const dep = parseInt(h) * 60 + parseInt(m)
          return dep > this.currentMinutes
        })
      })
    },
    getTagClass(dir, hour, minute) {
      const timeStr = `${hour.padStart(2, '0')}:${minute}` // 确保小时是两位数
      const depMinutes = parseInt(hour) * 60 + parseInt(minute)
      if (
          depMinutes <= this.currentMinutes &&
          this.currentMinutes < depMinutes + dir.tripDuration
      ) {
        return 'running-bus'
      }
      if (timeStr === dir.nextBusTime) {
        return 'next-bus'
      }
      return ''
    },
    // 3. (夜间模式) 新增方法来监听 <html> class 的变化
    setupThemeDetector() {
      const htmlEl = document.documentElement;

      // 检查初始状态
      this.isDarkMode = htmlEl.classList.contains('dark');

      // 使用 MutationObserver 监听 class 变化
      this.themeObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            this.isDarkMode = htmlEl.classList.contains('dark');
          }
        });
      });

      this.themeObserver.observe(htmlEl, { attributes: true });
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

/* --- 夜间模式修复与调整 --- */
@media (prefers-color-scheme: dark) {
  .mobile-container {
    --bg-color: #1B1B1F;
    --text-color: rgba(255, 255, 255, 0.85);
    --card-bg: #1d1d1d;
    --row-border-color: #303030;
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