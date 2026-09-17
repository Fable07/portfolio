import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Admin code is only downloaded when /admin is visited
    { path: '/admin', component: () => import('./components/admin/AdminPanel.vue') },
    { path: '/:pathMatch(.*)*', component: App },
  ],
})

createApp(App).use(createPinia()).use(router).mount('#app')
