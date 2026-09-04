import { ref } from 'vue'

function savedLanguage() {
  if (typeof window === 'undefined') return 'zh'
  try { return window.localStorage.getItem('sustech-bus-v2-language') === 'en' ? 'en' : 'zh' } catch { return 'zh' }
}

export const busLanguage = ref(savedLanguage())
export const setBusLanguage = (language) => {
  busLanguage.value = language === 'en' ? 'en' : 'zh'
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem('sustech-bus-v2-language', busLanguage.value) } catch { /* storage may be disabled */ }
  }
}

const words = {
  zh: {
    search: '搜索线路或站点', nearby: '附近站点', locate: '使用当前位置', locating: '正在定位…', locationDenied: '未取得位置授权。', locationUnavailable: '此浏览器不支持定位。', global: '全局公告', route: '线路公告', stop: '站点公告', announcements: '运营公告', favorites: '收藏', noFavorites: '暂无收藏的线路或站点。', loading: '正在加载…', retry: '重试', empty: '暂无数据。', realTime: '实时预测', planned: '计划时间', unavailable: '暂不可用', lastServicePassed: '末班已过', notOperating: '当日不运营', vehicles: '全部车辆实时位置', schedules: '全部车辆时刻表', files: '地图与时刻表文件', eta: '预计 {minutes} 分钟到达', updated: '更新于 {time}', noLocation: '允许定位后可查看按距离排序的附近站点。', loadFailed: '巴士数据加载失败', routeLabel: '线路', stopLabel: '站点', searchEmpty: '未找到匹配的线路或站点。', planAt: '计划 {time}', language: 'EN', nearbyArrival: '到站服务',
  },
  en: {
    search: 'Search routes or stops', nearby: 'Nearby stops', locate: 'Use my location', locating: 'Locating…', locationDenied: 'Location permission was not granted.', locationUnavailable: 'Geolocation is unavailable in this browser.', global: 'Global notices', route: 'Route notices', stop: 'Stop notices', announcements: 'Service notices', favorites: 'Favorites', noFavorites: 'No saved routes or stops.', loading: 'Loading…', retry: 'Retry', empty: 'No data available.', realTime: 'Real-time prediction', planned: 'Scheduled time', unavailable: 'Unavailable', lastServicePassed: 'Last service has passed', notOperating: 'Not operating today', vehicles: 'All live vehicles', schedules: 'All schedules', files: 'Maps and timetable files', eta: 'Arrives in {minutes} min', updated: 'Updated {time}', noLocation: 'Allow location access to see stops sorted by distance.', loadFailed: 'Could not load bus data', routeLabel: 'Route', stopLabel: 'Stop', searchEmpty: 'No matching routes or stops.', planAt: 'Scheduled {time}', language: '中文', nearbyArrival: 'Arrivals',
  },
}

export function busText(key, values = {}) {
  return (words[busLanguage.value][key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '')
}
