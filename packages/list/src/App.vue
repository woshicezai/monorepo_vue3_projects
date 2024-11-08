<template>
  <div>
    <h1 style="color: white; text-align: center;">虚拟列表示例</h1>
    <VirtualList :columns="columns" :fetchData="fetchData" :loadTriggerDistance="500" :perPage="10000" @sort="handleSort" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VirtualList from '@root/components/virtual-list/index.vue';
import {getTime} from '@/utils/getTime'

const columns = ref([
  { key: 'id', title: '序号', fixed: false,width: 100 },
  { key: 'code', title: '代码', fixed: false,width: 100 },
  { key: 'name', title: '名称', fixed: false,width: 100 },
  { key: 'price', title: '现价', fixed: false ,width: 100},
  { key: 'change', title: '涨跌', fixed: false ,width: 100},
  { key: 'amount', title: '金额', fixed: false ,width: 100},
  { key: 'zhenfu', title: '振幅', fixed: false ,width: 100},
  { key: 'zhenfuFive', title: '5金额', fixed: false ,width: 100},
  { key: 'zhenfuTen', title: '10金额', fixed: false ,width: 100},
  { key: 'zhenfuThirty', title: '30金额', fixed: false ,width: 100},
]);

const handleSort = (key, column) => {
  console.log('zhouce handleSort', key, column);
  getTime()
};

const fetchData = async (page, perPage) => {
  // 模拟 API 请求
  return new Promise(resolve => {
    console.log('zhouce fetchData', page, perPage);
    setTimeout(() => {
      const data = Array.from({ length: perPage }, (_, i) => ({
        id: page * perPage + i + 1,
        code: (page * perPage + i + 1).toString().padStart(6, '0'),
        name: `股票${page * perPage + i + 1}`,
        price: (Math.random() * 100).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2),
        amount: `${(Math.random() * 10000).toFixed(2)}亿`
      }));
      resolve(data);
    }, 500);
  });
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #1e2a38;
  margin: 0;
  padding: 0;
}
</style>