<template>
  <div>
    <h1 style="color: white; text-align: center">虚拟列表示例</h1>
    <VirtualList
      ref="virtualListRef"
      :columns="columns"
      :fetch-data="fetchData"
      :load-trigger-distance="500"
      :per-page="50"
      @sort="handleSort"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VirtualList from '@root/components/VirtualList/index.vue'
import { createWebSocket } from '@root/utils/websocket/index.ts'

const filterList = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
const wsList = ref([])
const virtualListRef = ref(null)
const columns = ref([
  { key: 'seq', title: '序号', fixed: false, width: 100 },
  { key: 'id', title: 'id', fixed: false, width: 100 },
  { key: 'name', title: '名称', fixed: false, width: 100 },
  { key: 'price', title: '现价', fixed: false, width: 100 },
  { key: 'change', title: '涨跌', fixed: false, width: 100 },
  { key: 'amount', title: '金额', fixed: false, width: 100 },
  { key: 'zhenfu', title: '振幅', fixed: false, width: 100 },
  { key: 'zhenfuFive', title: '5金额', fixed: false, width: 100 },
  { key: 'zhenfuTen', title: '10金额', fixed: false, width: 100 },
  { key: 'zhenfuThirty', title: '30金额', fixed: false, width: 100 },
])

onMounted(() => {
  initWebSocket()
})

const initWebSocket = () => {
  const ws = createWebSocket({
    url: 'ws://localhost:8080',
    heartbeatInterval: 10000,
    bufferTimeout: 10000,
    bufferSize: 10,
    onStatusChange: status => {
      console.log('zhouce ws status', status)
      if (status) {
        ws.send('ready')
      }
    },
    onError: error => {
      console.log('zhouce ws error', error)
    },
  })
  ws.subscribe(handleWsData)
  ws.connect()
}

/**
 * 处理ws数据
 * @param data
 */
const handleWsData = data => {
  wsList.value = data.filter(item => {
    return filterList.includes(item.id)
  })
  console.log('zhouce 推送命中了池子的个数', wsList.value.length)
  wsList.value.forEach(wsItem => {
    const foundIndex = virtualListRef.value.list.findIndex(item => item.id === wsItem.id)
    if (foundIndex !== -1) {
      virtualListRef.value.list[foundIndex] = wsItem
    } else {
      virtualListRef.value.list.push(wsItem)
    }
  })
  virtualListRef.value.list.sort((a, b) => a.amount - b.amount)
}

const handleSort = (key, column) => {
  console.log('zhouce handleSort', key, column)
}

const fetchData = async (page, perPage) => {
  // 模拟 API 请求
  return new Promise(resolve => {
    setTimeout(() => {
      const data = Array.from({ length: perPage }, (_, i) => ({
        // id: page * perPage + i + 1,
        id: page * perPage + Math.floor(Math.random() * perPage),
        code: (page * perPage + i + 1).toString().padStart(6, '0'),
        name: `股票${page * perPage + i + 1}`,
        price: (Math.random() * 100).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2),
        amount: `${(Math.random() * 10000).toFixed(2)}`,
      }))
      resolve(data.sort((a, b) => a.amount - b.amount))
    }, 500)
  })
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #1e2a38;
  margin: 0;
  padding: 0;
}
</style>
