import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import AdminPanel from './components/admin/AdminPanel.vue'
import './styles/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/admin', component: AdminPanel },
    { path: '/:pathMatch(.*)*', component: App },
  ],
})

createApp(App).use(router).mount('#app')
