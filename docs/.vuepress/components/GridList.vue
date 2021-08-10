<template>
    <div class="cards">
        <div v-for="(value,index) in data" :key="index" class="card"> {{ value }} </div>
    </div>
</template>
<script>
export default {
    props:["data"]
}
</script>
<style lang="scss" scoped>
.card {
  background-color: rgba(238, 238, 238, 0.411);
  color: black;
  padding:  0.5rem;
  font-size: 13px;
}
.cards {
  max-width: 500px;
  margin: 0px;
  display: grid;
  grid-gap: 0.3rem;
  grid-template-columns: repeat(3, 1fr);
}
@media (min-width: 300px) {
  .cards { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 400px) {
  .cards { grid-template-columns: repeat(6, 1fr); }
}
</style>