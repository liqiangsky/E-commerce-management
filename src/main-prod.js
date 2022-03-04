import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import store from './store/index.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import treeTable from 'vue-table-with-tree-grid'

// 导入富文本 编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入 Nprogress 包对应的js和css
import NProgress from 'nprogress'

// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'

// 请求拦截 在 request 拦截器中， 展示进度条  Nprogress.down()
axios.interceptors.request.use(config => {
  // loading进度条开始
  NProgress.start()
  // 为请求头对象, 添加token 验证 Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

// 请求响应 在 response 拦截器中， 隐藏进度条  Nprogress.down()
axios.interceptors.response.use(config => {
  // lading进度条结束
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', treeTable)
// 将富文本编辑器，注册为全局可用组件
Vue.use(VueQuillEditor)

// 全局过滤器，格式化时间
Vue.filter('FormatDate', originval => {
  const time = new Date(originval * 1000)
  const year = time.getFullYear()
  const month = (time.getMonth() + 1 + '').padStart(2, '0')
  const day = (time.getDate() + '').padStart(2, '0')
  const hour = (time.getHours() + '').padStart(2, '0')
  const minute = (time.getMinutes() + '').padStart(2, '0')
  const second = (time.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
