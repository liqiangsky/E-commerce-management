<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goods" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | FormatDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editById(scope.row.goods_id)"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页列表区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表数据
      goods: [],
      // 总数据条数
      total: 0
    }
  },
  created () {
    // 获取商品列表
    this.getGoodsList()
  },
  methods: {
    // 根据当前页码获取对应商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }

      this.goods = res.data.goods
      this.total = res.data.total
    },
    // 监听每页显示数据数量发生变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页面发生变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 根据Id删除商品数据
    async removeById (id) {
      const confirmResult = await this.$confirm(
        '您确定要删除此商品吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 用户取消操作
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除操作！') }

      // 发送请求执行删除操作
      const { data: res } = await this.$http.delete(`goods/${id}`)
      console.log(res)

      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      // 更新商品列表
      this.getGoodsList()
    },
    // 单击添加商品按钮跳转到添加商品页面
    goAddPage () {
      this.$router.push('/goods/add')
    },
    // 监听编辑按钮
    async editById (id) {
      // 根据id查询商品
      const { data: res } = await this.$http.get(`goods/${id}`)
      console.log(res)

      // 获取商品失败 提示用户
      if (res.meta.status !== 200) return this.$message.error('获取商品数据失败！')

      // 获取成功 保存数据到vuex
      this.$store.commit('setGoodInfo', res.data)
      console.log(this.$store.state.goodInfo)
      // 跳转到edit组件
      this.$router.push('/goods/edit')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
