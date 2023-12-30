<template>
  <div v-for="menu in dailyMenus" :key="menu.canteen_id">
    <img class="menu-img" :src="menu.url" :alt="menu.canteen_id" sizes="width=200px">
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import axios from 'axios';

export default {
  name: 'Menu',
  setup() {
    const dailyMenus = ref([]);

    const getDailyMenus = () => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');

      axios.get(`http://localhost:8102/api/v1/menu/${year}/${month}/${day}`)
        .then((res) => {
          dailyMenus.value = res.data.data;
        });
    };

    onMounted(() => {
      getDailyMenus();
    });

    return {
      dailyMenus,
    };
  },
};
</script>

<style scoped>

.menu-img {
  margin-bottom: 2rem;
}

</style>
