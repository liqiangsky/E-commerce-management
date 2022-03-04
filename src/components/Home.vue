<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img width="61" height="56" src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#598ecf"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 一级菜单 -->
          <el-submenu :index="item.path + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      // 一级图标
      iconObj: {
        125: 'icon iconfont icon-user',
        103: 'icon iconfont icon-tijikongjian',
        101: 'icon iconfont icon-shangpin',
        102: 'icon iconfont icon-danju',
        145: 'icon iconfont icon-baobiao'
      },
      // 侧边栏是否折叠
      isCollapse: false,
      // 当前激活菜单的路径
      activePath: '',
      filterMenu: ['数据统计', '订单管理']
    }
  },
  created () {
    this.getMunuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出系统
    logout () {
      // 清除token
      window.sessionStorage.clear()
      // 跳转首页
      this.$router.push('/login')
    },
    // 获取侧边栏数据
    async getMunuList () {
      const { data: res } = await this.$http.get('menus')
      // 获取失败 弹出失败提示框
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 成功获取数据
      this.menuList = res.data
      this.menuList = this.menuList.filter(
        (item) => !this.filterMenu.includes(item.authName)
      )
    },
    // 切换折叠侧边栏
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存导航状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = window.sessionStorage.getItem('activePath')
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    font-size: 20px;
    span {
      margin-left: 15px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
    .toggle-button {
      background-color: #4a5064;
      color: #fff;
      font-size: 10px;
      line-height: 24px;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
  }
}
.iconfont {
  margin-right: 10px;
}
</style>
