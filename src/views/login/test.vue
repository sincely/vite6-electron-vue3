<template>
  <div v-loading="changeRegLoading || submitLoading" class="login-main">
    <form class="form" @submit.prevent="submit">
      <!-- 账户输入 -->
      <div class="flex-column">
        <label>账户</label>
      </div>
      <div class="input-form">
        <img src="@/assets/login/email.svg" alt="email" />
        <input v-model="loginObj.username" type="text" class="input" placeholder="您的账户" />
      </div>

      <!-- 密码输入 -->
      <div class="flex-column">
        <label>密码</label>
      </div>
      <div class="input-form">
        <img src="@/assets/login/pass.svg" alt="password" />
        <input
          v-model="loginObj.password"
          :type="showPassword ? 'text' : 'password'"
          class="input"
          placeholder="您的密码"
        />
        <img
          src="@/assets/login/eye.svg"
          alt="toggle password visibility"
          class="eye-icon"
          @click="togglePasswordVisibility"
        />
      </div>

      <!-- 确认密码输入 -->
      <div v-if="regState" class="flex-column">
        <label>确认密码</label>
      </div>
      <div v-if="regState" class="input-form">
        <img src="@/assets/login/pass.svg" alt="password" />
        <input
          v-model="loginObj.affirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          class="input"
          placeholder="确认密码"
        />
        <img
          src="@/assets/login/eye.svg"
          alt="toggle confirm password visibility"
          class="eye-icon"
          @click="toggleConfirmPasswordVisibility"
        />
      </div>

      <!-- 忘记密码 -->
      <div v-if="!regState" class="flex-row">
        <span class="span">忘记密码?</span>
      </div>

      <!-- 提交按钮 -->
      <button type="submit" class="button-submit">{{ regState ? '注 册' : '登 录' }}</button>

      <!-- 注册切换 -->
      <p v-if="!regState" class="p">
        没有账户?
        <span class="span" @click="toggleRegisterState">注 册</span>
      </p>
      <p v-else class="p">
        点击返回
        <span class="span" @click="toggleRegisterState">登 录</span>
      </p>

      <p class="p line">或者以下方式登录</p>

      <!-- 第三方登录 -->
      <div class="flex-row">
        <button type="button" class="btn google" @click="showServiceUpgradeMessage('face')">
          <img src="@/assets/login/face.svg" width="25" height="25" alt="google" />
          人脸登录
        </button>
        <button type="button" class="btn apple" @click="showServiceUpgradeMessage('sso')">
          <img src="@/assets/login/sso.svg" width="25" height="25" alt="apple" />
          网页SSO登录
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      regState: false,
      showPassword: false,
      showConfirmPassword: false,
      changeRegLoading: false,
      submitLoading: false,
      loginObj: {
        username: '',
        password: '',
        affirmPassword: ''
      }
    }
  },
  created() {
    this.$emit('updateBar')
  },
  methods: {
    // 切换注册状态
    toggleRegisterState() {
      this.changeRegLoading = true
      //window.ipcRenderer.send('loginOrRegister',!this.regState)
      setTimeout(() => {
        this.regState = !this.regState
        if (!this.regState) {
          this.loginObj.username = ''
          this.loginObj.password = ''
          this.loginObj.affirmPassword = ''
        }
        this.changeRegLoading = false
      }, 1000)
    },
    // 显隐密码
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    // 提交表单
    submit() {
      // 校验逻辑
      if (!this.loginObj.username || !this.loginObj.password) {
        this.$message({
          message: '请输入完整的账户信息！',
          type: 'info'
        })
        return
      }
      if (this.regState && this.loginObj.password !== this.loginObj.affirmPassword) {
        this.$message({
          message: '两次输入的密码不一致！',
          type: 'error'
        })
        return
      }
      this.submitLoading = true

      setTimeout(() => {
        this.$router.push('/main')
        const screenWidth = window.screen.width
        const screenHeight = window.screen.height

        window.ipcRenderer.send('toMain', {
          username: this.loginObj.username,
          token: '',
          screenWidth: screenWidth,
          screenHeight: screenHeight
        })
        this.submitLoading = false
      }, 1000)
    },
    // 显示升级提示
    showServiceUpgradeMessage(type) {
      if ('face' === type) {
        this.$router.push('/face')
      } else {
        window.open('https://www.baidu.com/', '_blank')
      }
    }
  }
}
</script>

<style>
.login-main {
  -webkit-app-region: no-drag;
}

.login-main .form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 450px;
  padding: 30px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  user-select: none;
  background-color: #fff;
  border-right: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  border-left: 1px solid #d9d9d9;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%); /* 添加阴影 */
  -webkit-app-region: no-drag;
}

.login-main ::placeholder {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.login-main .form button {
  align-self: flex-end;
}

.login-main .flex-column > label {
  font-weight: 600;
  color: #151717;
}

.login-main .input-form {
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 10px;
  border: 1.5px solid #ecedec;
  border-radius: 10px;
  transition: 0.2s ease-in-out;
}

.login-main .input {
  width: 85%;
  height: 100%;
  margin-left: 10px;
  border: none;
  border-radius: 10px;
}

.input:focus {
  outline: none;
}

.login-main .input-form:focus-within {
  border: 1.5px solid #2d79f3;
}

.login-main .flex-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.login-main .flex-row > div > label {
  font-size: 14px;
  font-weight: 400;
  color: black;
}

.login-main .span {
  margin-left: 5px;
  font-size: 14px;
  font-weight: 500;
  color: #2d79f3;
  cursor: pointer;
}

.login-main .button-submit {
  width: 100%;
  height: 50px;
  margin: 20px 0 10px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  background-color: #151717;
  border: none;
  border-radius: 10px;
}

.login-main .button-submit:hover {
  background-color: #252727;
}

.login-main .p {
  margin: 5px 0;
  font-size: 14px;
  color: black;
  text-align: center;
}

.login-main .btn {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  margin-top: 10px;
  font-weight: 500;
  cursor: pointer;
  background-color: white;
  border: 1px solid #ededef;
  border-radius: 10px;
  transition: 0.2s ease-in-out;
}

.login-main .btn:hover {
  border: 1px solid #2d79f3;
}

.el-loading-spinner .path {
  stroke: #151717 !important;
}

.el-loading-mask {
  width: 510px !important;
  border-radius: 20px !important;
}
</style>
