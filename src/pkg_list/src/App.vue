<template>
  <div class="container">
    <h1>Hello World list</h1>
  </div>
</template>

<script setup lang="ts">
import { getTime } from "@root/utils/getTime";
import { getTime as getTime2 } from "@local/utils/getTime";
console.log(getTime());
console.log(getTime2());

</script>
<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

h1 {
  color: #ff7875;
}
</style> 