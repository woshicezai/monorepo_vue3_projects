import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import LazyVxeUITable from './useAxeTable'
const app = createApp(App)
app.use(createPinia())
app.use(LazyVxeUITable)
app.mount('#app') 