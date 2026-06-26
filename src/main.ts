import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeAuth } from './stores/auth'
import './style.css'

await initializeAuth()

createApp(App).use(router).mount('#app')
