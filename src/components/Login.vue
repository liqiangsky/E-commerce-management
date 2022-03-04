<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        label-width="0px"
        class="input-box"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRefs"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            placeholder="请输入用户名"
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单验证对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击按钮重置表单
    resetLoginForm () {
      this.$refs.loginFormRefs.resetFields()
    },
    // 登录表单验证
    login () {
      this.$refs.loginFormRefs.validate(async valid => {
        // 验证有误 退出
        if (!valid) return false
        // 验证成功 发送请求
        const { data: msg } = await this.$http.post('login', this.loginForm)
        if (msg.meta.status !== 200) {
          // 用户不存在 提示用户登录失败
          this.$message.error('登录失败')
        } else {
          // 登录成功
          this.$message.success('登录成功')
          // 1. 将登录成功之后的 token, 保存到可客户端的 sessionStrage 中
          //   1.1 项目中除了登录之外的其他API接口, 必须在登录之后才能访问
          //   1.2  token 只在当前网站打开期间生效, 所以将 token 保存在 sessionStorage 中
          // 2. 通过编程式导航跳转到后台主页， 路由地址是 /home
          window.sessionStorage.setItem('token', msg.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
  .login-box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    .avatar-box {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      background-color: #fff;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 50%;
      box-shadow: 0 0 10px #ccc;
      img {
        width: 100%;
        height: 100%;
        background-color: #eee;
        border-radius: 50%;
      }
    }
    .input-box {
      position: absolute;
      bottom: 40px;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
    }
  }
}
</style>
