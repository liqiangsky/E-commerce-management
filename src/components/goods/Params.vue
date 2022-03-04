<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为三级分类设置相关参数" type="warning" :closable="false"></el-alert>

      <!-- 商品分类区域 -->
      <el-row class="cat-opt">
        <el-col>
          <span class="selected-span">选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCaseKeys"
            :options="goodList"
            :props="cateProps"
            @change="selectedCaseChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParamsDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleColse(i, scope.row)">{{item}}</el-tag>

                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParamsDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleColse(i, scope.row)">{{item}}</el-tag>

                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClosed"
    >
      <!-- 添加参数的表单 -->
      <el-form
        ref="addParamsFormRef"
        :model="addParamsForm"
        label-width="80px"
        :rules="addParamsFormRules"
      >
        <el-form-item :label="titleText " prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'编辑'+ titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClosed"
    >
      <!-- 编辑参数的表单 -->
      <el-form
        ref="editParamsFormRef"
        :model="editParamsForm"
        label-width="80px"
        :rules="editParamsFormRules"
      >
        <el-form-item :label="titleText " prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsSave">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表数据
      goodList: [],
      // 级联选择框双向绑定到的数组
      selectedCaseKeys: [],
      // 级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 被激活的页面名称
      activeName: 'many',
      // 动态参数数据
      manyData: [],
      // 静态参数数据
      onlyData: [],
      // 控制添加参数对话框是否显示
      addParamsDialogVisible: false,
      // 添加参数的表单
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数表单规则
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 存放编辑参数表单数据
      editParamsForm: {
        attr_name: ''
      },
      // 控制编辑参数对话框是否显示
      editParamsDialogVisible: false,
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取所有列表数据
    this.getGoodsList()
  },
  methods: {
    // 获取所有商品列表数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('categories')

      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表数据失败')
      }

      // 保存数据
      this.goodList = res.data
      console.log(this.goodList)
    },
    // 级联选择框中项发生变化会触发这个函数
    selectedCaseChange () {
      this.getParamsData()
    },
    // tab 页签点击事件处理函数
    handleTabClick () {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 如果选的中的不是三级分类
      if (this.selectedCaseKeys.length !== 3) {
        // 清空选中分类 于 面板数据
        this.selectedCaseKeys = []
        this.manyData = []
        this.onlyData = []
        return
      }

      // 证明选中的是三级分类
      // 根据当前所选分类id和当前处理面板名称 获取参数列表

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }

      // 将属性中的attr_vals字符串转换为数组保存
      res.data.forEach(item => {
        // item.attr_vals 为空返回 空白数组 否则 分割
        item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(' ')
        // 控制文本框的隐藏
        item.inputVisible = false
        // 文本框中的输入值
        item.inputValue = ''
      })

      // 判断是动态参数数据还是静态参数数据 分别存储
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
      console.log(this.manyData)
      console.log(this.onlyData)
    },
    // 简单添加参数对话框关闭事件
    addParamsDialogClosed () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams () {
      // 验证未通过退出 通过则添加参数
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 201) { return this.$message.error('添加参数失败！') }

        this.$message.success('添加参数成功！')
        // 更新参数列表
        this.getParamsData()
        // 关闭对话框
        this.addParamsDialogVisible = false
      })
    },
    // 单击编辑按钮 显示编辑参数对话框
    async showEditDialog (attrId) {
      // 根据当前行id 查询参数
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
      )

      console.log(res)

      if (res.meta.status !== 200) { return this.$message.error('获取参数信息失败') }

      // 保存attr_name数据
      this.editParamsForm.attr_name = res.data.attr_name
      // 保存attr_id数数据
      this.editParamsForm.attrId = attrId

      // 显示对话框
      this.editParamsDialogVisible = true
    },
    // 箭头编辑参数对话框关闭事件
    editParamsDialogClosed () {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 单击确定按钮保存编辑参数
    editParamsSave () {
      this.$refs.editParamsFormRef.validate(async valid => {
        // 表单数据不符合规则 不进入保存
        if (!valid) return

        // 添加参数或属性
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attrId}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )

        console.log(res)

        if (res.meta.status !== 200) { return this.$message.error('修改参数失败！') }

        this.$message.success('修改参数成功！')
        // 刷新参数列表
        this.getParamsData()
        // 关闭编辑参数对话框
        this.editParamsDialogVisible = false
      })
    },
    // 根据id删除对应参数项
    async removeParams (attrId) {
      const confirmResult = await this.$confirm(
        '您确定要删除此参数吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 用户取消了操作
      if (confirmResult !== 'confirm') { return this.$message.info('您已经取消了删除操作！') }

      // 用户确认了删除操作
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )

      console.log(res)

      if (res.meta.status !== 200) { return this.$message.error('删除参数属性失败!') }

      this.$message.success('删除参数属性成功')
      // 重新加载参数数据列表
      this.getParamsData()
    },
    // 文本框失去焦点 或者按下enter键都会触发
    async handleInputConfirm (row) {
      // 如果用户输入空字符串 则重置表单并且隐藏表单
      console.log(row.inputValue)

      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      // 如果没有return 则证明用户输入非空需要进行下列操作

      // 保存数据到row.attr_vals中
      row.attr_vals.push(row.inputValue.trim())

      // 情空表单数据并且隐藏表单
      row.inputValue = ''
      row.inputVisible = false

      // 保存修改参数数据到数据库
      this.saveAttrVals(row)
    },
    // 保存修改参数数据到数据库
    async saveAttrVals (row) {
      // 发起请求，将修改的参数项数据保存到数据库
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) return this.$message.error('修改参数项数据失败！')

      this.$message.success('修改参数项数据成功！')
    },
    // 点击按钮展示文本输入文本框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // nestTick方法的使用，就是当页面被重新渲染之后，才会指定回调函数的使用
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleColse (i, row) {
      row.attr_vals.splice(i, 1)
      // 保存删除后数据到数据库
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 判断按钮是否是需要被禁用
    isBtnDisabled () {
      // 选中非三级分类禁用
      if (this.selectedCaseKeys.length !== 3) return true
      // 三级分类正常使用
      return false
    },
    // 当前选中的三级分类的id
    cateId () {
      // 如果选中的是三级分类返回 id
      if (this.selectedCaseKeys.length === 3) {
        return this.selectedCaseKeys[this.selectedCaseKeys.length - 1]
      }
      // 非三级返回空
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.selected-span {
  margin-right: 10px;
}
.cat-opt {
  margin: 15px 0;
}
.el-tag {
  margin-right: 15px;
}
.input-new-tag {
  width: 120px;
}
</style>
