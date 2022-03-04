<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen"
          ></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0 ">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作-->
        <template slot="operate" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="getCateInfo(scope.row.cat_id)"
          >编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delet" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCatRules"
        ref="addCatFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称"  prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择框 -->
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectParentKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            class="cacader"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="eidtCateVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        ref="editCateFormRef"
        :rules="editCateForemRules"
        :model="editCateForm"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="eidtCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表，默认为空
      catelist: [],
      // 商品总数据条数
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将这一列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          // 表示将这一列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将这一列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'operate'
        }
      ],
      // 控制添加分类对话框是否显示
      addCateDialogVisible: false,
      // 添加表单分类的表单数据对象
      addCateForm: {
        // 分类id
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类等级
        cat_level: 0
      },
      // 添加表单分类的表单数据规则
      addCatRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级列表数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选定的父级类的ID数组
      selectParentKeys: [],
      // 控制修改分类对话框是否显示
      eidtCateVisible: false,
      // 修改分类规则
      editCateForemRules: {
        cat_name: [
          {
            required: true,
            message: '分类名称不能为空',
            trigger: 'blur'
          }
        ]
      },
      // 编辑分类表单数据
      editCateForm: {
        cat_name: ''
      },
      // 当前编辑的id
      currentEditCateId: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表信息失败')
      }

      // 保存商品列表数据
      this.catelist = res.data.result

      // 为总数据条数赋值
      this.total = res.data.total
    },
    // pageSize 改变时会触发
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      // 刷新数据列表
      this.getCateList()
    },
    // pagenum 改变时会触发
    handleCurrentChange (newCurrentpage) {
      this.queryInfo.pagenum = newCurrentpage
      this.getCateList()
    },
    // 单击按钮显示添加分类对话框
    showAddCateDialog () {
      // 获取用户列表数据
      this.getParentCateList()
      // 弹出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表数失败！')
      }

      this.parentCateList = res.data
    },
    // 父级分类选择项发生变化触发
    parentCateChanged () {
      // 如果 selectParentKeys 数组中 的 length 大于0，证明选中父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectParentKeys.length > 0) {
        // 父级分类等级的id
        this.addCateForm.cat_pid = this.selectParentKeys[
          this.selectParentKeys.length - 1
        ]
        // 为当前等级赋值
        this.addCateForm.cat_level = this.selectParentKeys.length
        return
      }
      // 没有选中任何父级分类
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击按钮添加新的分类
    addCate () {
      this.$refs.addCatFormRef.validate(async valid => {
        // 表单验证失败
        if (!valid) return

        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) return this.$message.error('添加分类失败')

        this.$message.success('添加分类成功')
        // 更新分类列表数据
        this.getCateList()
        // 关闭添加分类对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框关闭事件
    addCateDialogClosed () {
      // 重置对话框中的数据
      this.$refs.addCatFormRef.resetFields()
      this.selectParentKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 根据id查询分类
    async getCateInfo (id) {
      // 保存当前需要编辑分离的id
      this.currentEditCateId = id
      const { data: res } = await this.$http.get(`categories/${id}`)

      if (res.meta.status !== 200) { return this.$message.error('查询分类数据失败') }

      // 保存数据
      this.editCateForm.cat_name = res.data.cat_name
      // 显示编辑对话框
      this.eidtCateVisible = true
    },
    // 监听修改分类对话框关闭事件
    editCateDialogClosed () {
      // 重置表单
      this.$refs.editCateFormRef.resetFields()
    },
    // 单击确定修改分类数据
    async editCate () {
      const { data: res } = await this.$http.put('categories/' + this.currentEditCateId, this.editCateForm)

      if (res.meta.status !== 200) return this.$message.error('修改分类失败！')

      this.$message.success('修改分离成功！')
      // 更新页面列表数据
      this.getCateList()
      // 关闭修改分类对话框
      this.eidtCateVisible = false
    },
    // 根据id删除分类数据
    async deleteCate (id) {
      // 提示用户确认删除
      const confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 用户取消删除退出操作
      if (confirm !== 'confirm') return

      // 用户确认删除
      const { data: res } = await this.$http.delete(`categories/${id}`)

      if (res.meta.status !== 200) return this.$message.error('删除分类数据失败！')

      this.$message.success('删除分类数据成功！')
      // 更新列表数据
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 10px;
}
.cacader {
  width: 100%;
}
</style>
