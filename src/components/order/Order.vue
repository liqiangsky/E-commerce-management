<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="searchBtnClick"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="230px"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-button type="success" size="mini" plain v-if="scope.row.pay_status === '1'">已付款</el-button>
            <el-button type="danger" size="mini" plain v-else>未付款</el-button>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressShow"></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClose"
    >
      <el-form :model="addressForm" :rules="addressRules" ref="addressForm" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细信息" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流信息对话框 -->
    <el-dialog
      title="物流信息"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      // 请求参数信息
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      // 订单数据总条数
      total: 0,
      // 获取的订单数据信息
      orderList: [],
      // 控制修改地址对话框是否显示
      addressDialogVisible: false,
      // 编辑地址表单数据
      addressForm: {
        address1: [],
        address2: ''
      },
      // 编辑地址表单数据规则
      addressRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细信息', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData,
      // 控制物流信息对话框是否显示
      progressDialogVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  created () {
    // 获取订单列表数据
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败')
      }

      // 保存获取到的订单数据信息 和总数据条数
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
      console.log(this.queryInfo)
    },
    // 每页页面显示数据条数发生变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 更新订单列表数据
      this.getOrderList()
    },
    // 当前页码发生变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      // 更新订单列表数据
      this.getOrderList()
    },
    // 单击编辑按钮 显示修改地址对话框
    addressShow () {
      this.addressDialogVisible = true
    },
    // 编辑地址对话框关闭事件
    addressDialogClose () {
      // 清空表单数据
      this.$refs.addressForm.resetFields()
    },
    // 显示物流信息对话框
    async showProgressDialog () {
      this.progressDialogVisible = true

      // 获取物流信息
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')

      if (res.meta.status !== 200) { return this.$message.error('获取物流信息失败') }

      this.progressInfo = res.data
      console.log(this.progressInfo)
    },
    // 搜索框点击事件
    searchBtnClick () {
      // 获取筛选列表
      this.getOrderList()
      // 清空搜索框
      this.queryInfo.query = ''
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
