<template>
  <div class="talks-today-nav" v-if="todayLabel">
    <button class="talks-today-button" type="button" @click="scrollToTarget">
      跳到今天 {{ todayLabel }}
    </button>
    <span v-if="!hasExactMatch && fallbackLabel" class="talks-today-hint">
      今日暂无讲座，当前可跳转到最近日期 {{ fallbackLabel }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'TalksTodayNav',
  data() {
    return {
      todayLabel: '',
      todayDate: '',
      targetHeading: null,
      hasExactMatch: false,
      fallbackLabel: '',
    };
  },
  mounted() {
    this.initTodayTarget();
  },
  methods: {
    initTodayTarget() {
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
      });
      const parts = formatter.formatToParts(new Date());
      const values = Object.fromEntries(
        parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
      );

      this.todayDate = `${values.year}-${values.month}-${values.day}`;
      this.todayLabel = `${this.todayDate} ${values.weekday}`;

      const headings = Array.from(document.querySelectorAll('h2')).filter((heading) =>
        /^\d{4}-\d{2}-\d{2}/.test((heading.textContent || '').trim()),
      );
      if (!headings.length) {
        return;
      }

      const exactHeading = headings.find((heading) =>
        (heading.textContent || '').trim().startsWith(this.todayDate),
      );
      if (exactHeading) {
        this.targetHeading = exactHeading;
        this.hasExactMatch = true;
        return;
      }

      const headingDates = headings
        .map((heading) => ({
          heading,
          date: (heading.textContent || '').trim().slice(0, 10),
        }))
        .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date))
        .sort((left, right) => left.date.localeCompare(right.date));

      const futureHeading = headingDates.find((item) => item.date >= this.todayDate);
      const fallback = futureHeading || headingDates[headingDates.length - 1];
      if (fallback) {
        this.targetHeading = fallback.heading;
        this.fallbackLabel = (fallback.heading.textContent || '').trim();
      }
    },
    scrollToTarget() {
      if (!this.targetHeading) {
        return;
      }
      this.targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  },
};
</script>

<style scoped>
.talks-today-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0.9rem 0 0.45rem;
}

.talks-today-button {
  border: none;
  border-radius: 999px;
  background: #2f855a;
  color: #fff;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(47, 133, 90, 0.18);
}

.talks-today-button:hover {
  background: #276749;
}

.talks-today-hint {
  color: #5f6c7b;
  font-size: 0.92rem;
}
</style>


