import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import MapPage from '../views/MapPage.vue'
import LoginPage from '../views/LoginPage.vue'
import ProfilPage from '../views/ProfilPage.vue'
import ReportPage from '../views/ReportPage.vue'
import ReportsListPage from '../views/ReportsListPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/map',
    name: 'Map',
    component: MapPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/profil',
    name: 'Profil',
    component: ProfilPage
  },
  {
    path: '/report',
    name: 'Report',
    component: ReportPage
  },
  {
    path: '/reports',
    name: 'ReportsList',
    component: ReportsListPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
