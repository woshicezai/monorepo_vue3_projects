<template>
  <div>
    <div>列表总数据大小: {{ listSize }} M</div>
    <div>列表总数据长度: {{ list.length }}</div>
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
      :row-style="rowStyle"
      :column-config="{ resizable: true }"
      :row-config="{ isHover: true }"
      :data="list"
      :scroll-y="{
        enabled: true,
        gt: 200,
        // oSize: 50,
      }"
      @scroll="handleScroll"
    >
      <vxe-column type="seq" title="序号" width="60" fixed="left"></vxe-column>
      <vxe-column field="id" title="id" width="300"></vxe-column>
      <vxe-column field="name" title="name" width="300"></vxe-column>
      <vxe-column field="price" title="price" width="300"></vxe-column>
      <vxe-column field="change" title="change" width="300"></vxe-column>
      <vxe-column field="amount" title="amount" width="300"></vxe-column>
    </vxe-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import { createWebSocket } from '@root/utils/websocket/index.ts'
import { getObjectSize } from '@root/utils/getObjectSize.ts'
const xTable = ref(null)
const isLoading = ref(false)
const perPage = 100
const page = ref(0)
const list = ref([])
const loadTriggerDistance = 1000

const filterList = Array.from({ length: 300000 }, () => Math.floor(Math.random() * 300000))
const wsList = ref([])

const listSize = ref(0)

watch(
  list,
  () => {
    listSize.value = (getObjectSize(list.value) / 1024 / 1024).toFixed(2)
  },
  {
    deep: true,
  }
)

onMounted(async () => {
  initWebSocket()
  list.value = await fetchData(page.value, perPage)
  page.value += 1
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
    const foundIndex = list.value.findIndex(item => item.id === wsItem.id)
    if (foundIndex !== -1) {
      wsItem.isUpdate = true
      list.value[foundIndex] = wsItem
    } else {
      wsItem.isNew = true
      list.value.push(wsItem)
    }
  })
  list.value.sort((a, b) => a.amount - b.amount)
}

const fetchMore = async event => {
  if (event.type === 'body' && !isLoading.value) {
    const bodyHeight = event.bodyHeight
    const scrollTop = event.scrollTop
    if (bodyHeight - scrollTop < loadTriggerDistance) {
      list.value = [...list.value, ...(await fetchData(page.value, perPage))]
      page.value += 1
    }
  }
}

const handleScroll = debounce(fetchMore, 100, {
  leading: true,
  trailing: true,
  maxWait: 200,
})

const fetchData = async (page, perPage) => {
  isLoading.value = true
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
        amount: page * perPage + i + 1 + `${(Math.random() * 10000).toFixed(5)}`,
      }))
      resolve(data.sort((a, b) => a.amount - b.amount))
    }, 500)
  }).finally(() => {
    isLoading.value = false
  })
}

const hideColEvent = field => {
  xTable.value.hideColumn(field)
}

const showColEvent = field => {
  xTable.value.showColumn(field)
}

const resetColEvent = () => {
  xTable.value.resetColumn()
}

const rowStyle = ({ row }) => {
  if (row.isUpdate) {
    setTimeout(() => {
      row.isUpdate = false
    }, 1000)
    return {
      animation: 'fadeOutYellow 1s ease-out',
    }
  }
  if (row.isNew) {
    setTimeout(() => {
      row.isNew = false
    }, 1000)
    return {
      animation: 'fadeOutGreen 1s ease-out',
    }
  }
}
</script>

<style lang="scss">
@keyframes fadeOutGreen {
  0% {
    background-color: rgba(0, 255, 0, 0.5);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes fadeOutYellow {
  0% {
    background-color: rgba(255, 255, 0, 0.5);
  }
  100% {
    background-color: transparent;
  }
}
</style>
