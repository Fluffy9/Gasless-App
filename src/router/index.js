import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFound from '../views/NotFound.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/404', component: NotFound },  
  { path: '*', redirect: '/404' },
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
]

const router = new VueRouter({
  routes
})

export default router
