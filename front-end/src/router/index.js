import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Home from "@/views/Home.vue";
Vue.use(Router)
import menus from '@/config/menuconfig'
import login from '@/views/login'

var routes = [
  {
    path: '/',
    name: 'Home',
    component: ()=>import ("@/views/Home.vue"),
    children:[],
  },
  {
    path: '/login',
    name: 'login',
    component: login,
  }
]

menus.forEach((item) => {
  item.sub.forEach((sub) => {
    routes[0].children.push({
      path: `/${sub.path}`,
      name: sub.path,
      component: () => import(`@/views/${sub.path}`)
    })
  })
})

console.log(routes)
export default new Router({routes})
