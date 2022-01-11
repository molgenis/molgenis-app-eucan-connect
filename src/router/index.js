import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Study from '../views/Study.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/:studyId',
    name: 'Study',
    props: true,
    component: Study
  }
]

const router = new VueRouter({
  routes
})

export default router
