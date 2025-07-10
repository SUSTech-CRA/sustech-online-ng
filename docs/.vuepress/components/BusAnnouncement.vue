<template>
  <a-config-provider :theme="appTheme">
    <div class="bus-announcement-container">
      <div v-if="loading" class="loading-spinner">
        <a-spin tip="正在加载最新公告..." />
      </div>

      <div v-else-if="error">
        <a-card title="公告加载失败" size="small">
          <p>无法获取服务公告，请稍后刷新重试。</p>
          <p>错误信息: {{ error }}</p>
        </a-card>
      </div>

      <a-card
          v-else-if="announcement"
          :bordered="false"
          style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);"
      >
        <template #title>
          <BellOutlined style="margin-right: 8px;" />
          服务公告
        </template>
        <template #extra>
<!--          <a-tag color="processing">{{ announcement.route }}</a-tag>-->
          <a-tag color="processing">Updated at <b>{{ announcement.created_at.toString().substring(0,19) }}</b></a-tag>
        </template>
        <div class="announcement-content" v-html="parsedContent"></div>
      </a-card>
    </div>
  </a-config-provider>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';

// 导入所有需要用到的 Ant Design Vue 组件和图标
import { ConfigProvider, Card, Tag, Spin, theme } from 'ant-design-vue';
import { BellOutlined } from '@ant-design/icons-vue';

const { darkAlgorithm } = theme;

export default {
  name: 'BusAnnouncement',

  // 遵照您提供的示例，在此处注册所有用到的组件
  components: {
    'a-config-provider': ConfigProvider,
    'a-card': Card,
    'a-tag': Tag,
    'a-spin': Spin,
    BellOutlined, // 图标组件
  },

  // 使用 data() 返回组件的响应式状态
  data() {
    return {
      loading: true,
      announcement: null,
      error: null,
      appTheme: {}, // 用于控制 antd 主题的对象
      mediaQuery: null, // 用于存储媒体查询对象
    };
  },

  // 使用 computed 计算属性来处理 markdown 解析
  computed: {
    parsedContent() {
      if (this.announcement && this.announcement.content) {
        return marked(this.announcement.content);
      }
      return '';
    },
  },

  // 使用 methods 对象来定义组件的方法
  methods: {
    async fetchAnnouncement() {
      try {
        this.loading = true;
        const response = await axios.get('https://bus.sustcra.com/api/announcement/notice/latest');

        if (response.data && Object.keys(response.data).length > 0) {
          this.announcement = response.data;
        } else {
          this.announcement = null;
        }
      } catch (err) {
        console.error('获取公交公告失败:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // 更新主题的函数
    updateTheme(event) {
      if (event.matches) {
        this.appTheme = { algorithm: darkAlgorithm };
      } else {
        this.appTheme = {};
      }
    },
  },

  // 使用 mounted 生命周期钩子来执行初始化操作
  mounted() {
    this.fetchAnnouncement();

    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.updateTheme(this.mediaQuery);
      this.mediaQuery.addEventListener('change', this.updateTheme);
    }
  },

  // 使用 beforeUnmount (Vue 3) 钩子来清理监听器
  beforeUnmount() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.updateTheme);
    }
  },
};
</script>

<style scoped>
.bus-announcement-container {
  margin-bottom: 1.5rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.announcement-content :deep(p) {
  margin-bottom: 0.5em;
  font-size: 16px;
}
</style>