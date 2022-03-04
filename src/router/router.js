import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
// const Login = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/user/Users.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/power/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate-Params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate-Params" */ '../components/goods/Params.vue')

// import GoodsList from '../components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList-Add" */ '../components/goods/List.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "GoodsList-Add" */ '../components/goods/Add.vue')

// import Edit from '../components/goods/Edit.vue'
const Edit = () => import(/* webpackChunkName: "Edit-Order-Report" */ '../components/goods/Edit.vue')

// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Edit-Order-Report" */ '../components/order/Order.vue')

// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Edit-Order-Report" */ '../components/report/Report.vue')

// 发布模式下不需要
// 解决elementUI导航栏中的vue-router在3.0下重复点击报错的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    }, {
      path: '/rights',
      component: Rights
    }, {
      path: '/roles',
      component: Roles
    }, {
      path: '/categories',
      component: Cate
    }, {
      path: '/params',
      component: Params
    }, {
      path: '/goods',
      component: GoodsList
    }, {
      path: '/goods/add',
      component: Add
    }, {
      path: '/goods/edit',
      component: Edit
    }, {
      path: '/orders',
      component: Order
    }, {
      path: '/reports',
      component: Report
    }]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是个函数 代表放行
  //   next()  放行  next('/login') 强制跳转
  // 登录页面放行
  if (to.path === '/login') next()
  // 获取 token
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
