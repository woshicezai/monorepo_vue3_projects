<template>
  <div>
    <vxe-toolbar>
      <template #buttons>
        <vxe-button @click="hideColEvent('id')">隐藏id</vxe-button>
        <vxe-button @click="showColEvent('id')">显示id</vxe-button>
        <vxe-button @click="resetColEvent">重置</vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-table
      ref="xTable"
      border
      height="600"
      :column-config="{resizable: true}"
      :row-config="{isHover: true}"
      :data="list"
      @scroll="handleScroll"
      :scroll-y="{
        enabled: true,
        gt: 200,
        oSize: 100
      }"
      >
      <vxe-column type="seq" width="60" fixed="left"></vxe-column>
      <vxe-column field="id" title="id" width="300"></vxe-column>
      <vxe-column field="name" title="name" width="300"></vxe-column>
      <vxe-column field="price" title="price" width="300"></vxe-column>
      <vxe-column field="change" title="change" width="300"></vxe-column>
      <vxe-column field="amount" title="amount" width="300"></vxe-column>
    </vxe-table>
  </div>
</template>

<script setup>
import { ref,onMounted} from 'vue'
import { debounce } from 'lodash-es'
import { createWebSocket } from '@/utils/websocket/index.ts'

const xTable = ref(null);
const isLoading = ref(false);
const perPage = 200
const page = ref(0)
const list = ref([])
const loadTriggerDistance = 1000


const initWebSocket = () => {
  const ws = createWebSocket({
    url: 'ws://localhost:8080',
    heartbeatInterval: 10000,
    bufferTimeout: 10000,
    bufferSize: 10,
    onStatusChange: (status) => {
      console.log('zhouce ws status', status)
      if(status){
        ws.send('ready')
      }
    },
    onError: (error) => {
      console.log('zhouce ws error', error)
    }
  })
  ws.subscribe(handleWsData)
  ws.connect()
}

/**
 * 处理ws数据
 * @param data 
 */
const handleWsData = (data) => {
  console.log('zhouce ws', data)
  
}


onMounted(async () => {
  initWebSocket()
  list.value = await fetchData(page.value, perPage);
})

const fetchMore = async (event) => {
  if (event.type === 'body' && !isLoading.value) {
    const bodyHeight = event.bodyHeight
    const scrollTop = event.scrollTop
    if(bodyHeight - scrollTop < loadTriggerDistance){
      list.value = [...list.value, ...(await fetchData(page.value, perPage))];
      page.value += 1;
    }
  }
};

const handleScroll = debounce(fetchMore, 100,{
  leading: true,
  trailing: true,
  maxWait: 200  
});

const fetchData = async (page, perPage) => {
  isLoading.value = true;
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
  }).finally(() => {
    isLoading.value = false;
  });
};

const hideColEvent = (field) => {
  xTable.value.hideColumn(field)
}

const showColEvent = (field) => {
  xTable.value.showColumn(field)
} 

const resetColEvent = () => {
  xTable.value.resetColumn()
}

</script>
