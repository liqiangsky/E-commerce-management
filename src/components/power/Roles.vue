<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 一级渲染 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级渲染和三级渲染 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '': 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="roleName" width="300">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialogVisible(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRouseById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addFormClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <!-- 内容主题区域 -->
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole(editForm.roleId)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件区域 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allowRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表数据
      rolesList: [],
      // 添加角色对话是否显示
      addDialogVisible: false,
      // 添加角色信息数据
      addForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单规则
      addRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称！',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 10,
            message: '用户名长度在1-10个长度之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述！',
            trigger: 'blur'
          }
        ]
      },
      // 编辑角色对话框是否显示
      editDialogVisible: false,
      // 编辑角色表单数据
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色表单规则
      editRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称！',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 10,
            message: '用户名长度在1-10个长度之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述！',
            trigger: 'blur'
          }
        ]
      },
      // 控制权限分配对话框是否显示
      setRightDialogVisible: false,
      // 权限列表数据
      rightsList: [],
      // 树形控件属性绑定的对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点
      defKeys: [],
      // 当前角色id
      roleId: ''
    }
  },
  created () {
    // 获取角色列表数据
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 添加角色信息
    async addRole () {
      const { data: res } = await this.$http.post('roles', this.addForm)
      console.log(res)
      if (res.meta.status !== 201) return this.$message.error('添加角色失败!')

      this.$message.success(res.meta.msg + '!')
      // 隐藏对话框
      this.addDialogVisible = false
      // 更新角色数据列表
      this.getRolesList()
    },
    // 添加角色对话框关闭
    addFormClosed () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 显示编辑对话框
    async showEditDialogVisible (id) {
      // 获取角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('角色信息获取失败!')
      }

      this.editForm = res.data
      this.editDialogVisible = true
      console.log(this.editForm)
    },
    // 关闭编辑角色对话框
    editFormClosed () {
      // 重置表单
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    },
    // 根据id编辑角色信息
    async editRole (id) {
      const { data: res } = await this.$http.put('roles/' + id, this.editForm)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑角色信息失败,' + res.meta.msg + '!')
      }

      this.$message.success('编辑角色信息成功')
      // 更新用户列表数据
      this.getRolesList()
      // 清空表单
      this.editDialogVisible = false
    },
    // 根据id删除角色
    async removeRouseById (id) {
      // 弹出询问用户是否删除用户数据
      var confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果用户确定删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel

      if (confirmResult !== 'confirm') {
        return this.$message.info('您已取消了删除!')
      }

      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      this.$message.success('删除角色成功!')
      // 刷新列表
      this.getRolesList()
    },
    // 根据id移除角色权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm(
        '确定要删除角色权限吗',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('您已取消了删除操作！')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色权限失败！')
      }
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog (role) {
      // 保存角色id
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/' + 'tree')
      console.log(res)

      if (res.meta.status !== 200) { return this.$message.error('获取权限列表数据失败') }
      // 保存权限列表数据
      this.rightsList = res.data
      console.log(this.rightsList)

      // 调用递归函数获取所有三级权限的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归形式，获取角色下所有三级权限的id， 并且保存到 defkeys 数组中
    getLeafKeys (node, arr) {
      // 三级节点 存放id
      if (!node.children) {
        return arr.push(node.id)
      }

      // 非三级节点 子节点遍历 递归调用自己判断是否三级节点
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 设置角色权限对话框关闭
    setRightDialogClosed () {
      // 清空默认选中项
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allowRights () {
      // 获取所有选中与半选中的节点
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ].join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keys })

      if (res.meta.status !== 200) return this.$message.error('分配角色权限失败！')

      this.$message.success('分配角色信息成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
