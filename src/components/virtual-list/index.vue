<template>
  <div class="virtual-list-container" @scroll="onScroll">
    <!-- 虚拟容器，用于模拟整个列表的高度 -->
    <div :style="{ height: `${totalHeight}px` }">
      <!-- 实际渲染的表格，使用 transform 移动到正确位置 -->
      <table class="table" :style="{ transform: `translateY(${offset}px)` }">
        <thead>
          <tr>
            <!-- 渲染表头 -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
               :style="{ width: column.width ? `${column.width}px`:'auto', position: column.fixed ? 'sticky' : 'static', top: 0 }"
            >
              {{ column.title }}
              <button class="sort-btn" @click="toggleSort(column.key)">⇅</button>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- 渲染可见的行 -->
          <tr v-for="item in visibleItems" :key="item.id">
            <td v-for="column in visibleColumns" :key="column.key">
              {{ item[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import {debounce} from 'lodash-es'

// 定义属性
const props = defineProps({
  columns: Array,
  fetchData: Function,
  loadTriggerDistance: {
    type: Number,
    default: 100 // 默认触发距离为 100 像素
  },
  rowHeight: {
    type: Number,
    default: 40 // 每行的默认高度
  },
  perPage: {
    type: Number,
    default: 20 // 每页的默认行数
  }
});

const items = ref([]); // 存储所有加载的项目
const totalHeight = ref(0); // 整个列表的模拟高度
const buffer = 5; // 缓冲行数，用于增加渲染的行数
const page = ref(0); // 当前加载的页数
const isLoading = ref(false); // 标志是否正在加载
const emit = defineEmits(['sort']); // 定义 emit 事件

// 配置列的可见性和排序
const columnConfig = reactive(
  props.columns.map(col => ({ ...col, visible: true, sortOrder: null }))
);

// 计算可见的列
const visibleColumns = computed(() =>
  columnConfig.filter(col => col.visible)
);

// 加载更多数据
const loadMore = async () => {
  if (isLoading.value) return; // 如果正在加载则不执行
  isLoading.value = true;
  try {
    const newItems = await props.fetchData(page.value, props.perPage);
    items.value = [...items.value, ...newItems];
    page.value += 1;
    totalHeight.value = items.value.length * props.rowHeight;
  } finally {
    isLoading.value = false;
  }
};

// 切换排序
const toggleSort = key => {
  const column = columnConfig.find(col => col.key === key);
  if (column) {
    column.sortOrder = column.sortOrder === 'asc' ? 'desc' : 'asc';
    emit('sort', key, column);
  }
};

const start = ref(0); // 当前可见区域的起始索引
const offset = ref(0); // 列表偏移，用于设置 transform

// 计算可见的项目
const visibleItems = computed(() => {
  const visibleCount = Math.ceil(window.innerHeight / props.rowHeight) + buffer * 2;
  const newStart = Math.max(0, start.value - buffer);
  const newEnd = Math.min(items.value.length, start.value + visibleCount);
  offset.value = newStart * props.rowHeight;
  return items.value.slice(newStart, newEnd);
});


const handleScroll = event => {
  const scrollTop = event.target.scrollTop;
  const containerHeight = event.target.clientHeight;
  start.value = Math.floor(scrollTop / props.rowHeight);
  // 检查是否需要加载更多数据
  if (totalHeight.value - (scrollTop + containerHeight) < props.loadTriggerDistance) {
    loadMore();
  }
};

// 滚动事件处理 使用 Lodash 的防抖
const onScroll = debounce(handleScroll, 100,{
  leading: true,
  trailing: true,
  maxWait: 200  
}); 

// 组件挂载时加载初始数据
onMounted(() => {
  loadMore();
});
</script>

<style>
.virtual-list-container {
  height: 80vh;
  overflow-y: auto;
  background-color: #1e2a38;
  color: #fff;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #3a4a5f;
}

th {
  background-color: #243447;
  position: sticky;
  top: 0;
  z-index: 1;
}

.sort-btn {
  margin-left: 5px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
}

tr:nth-child(even) {
  background-color: #2c3e50;
}

tr:hover {
  background-color: #34495e;
}
</style>