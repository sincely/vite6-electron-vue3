<template>
  <div v-loading="changeRegLoading || submitLoading" class="login-main">
    <!-- 顶部可拖拽区域 -->
    <div class="drag-region"></div>
    <!-- 登录/注册表单 -->
    <el-form ref="loginForm" :model="loginObj" :rules="rules" class="form" @submit.prevent="submit">
      <!-- 账户输入 -->
      <div class="flex-column">
        <label>账户</label>
      </div>
      <el-form-item prop="username" class="input-form-item">
        <el-input v-model="loginObj.username" placeholder="您的账户" class="custom-input">
          <template #prefix>
            <img src="@/assets/login/email.svg" alt="email" style="width: 18px; height: 18px" />
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码输入 -->
      <div class="flex-column">
        <label>密码</label>
      </div>
      <el-form-item prop="password" class="input-form-item">
        <el-input v-model="loginObj.password" type="password" placeholder="您的密码" show-password class="custom-input">
          <template #prefix>
            <img src="@/assets/login/pass.svg" alt="password" style="width: 18px; height: 18px" />
          </template>
        </el-input>
      </el-form-item>

      <!-- 确认密码输入 -->
      <div ref="regFields" class="reg-container" style=" height: 0;overflow: hidden; opacity: 0">
        <div class="flex-column">
          <label>确认密码</label>
        </div>
        <el-form-item prop="affirmPassword" class="input-form-item">
          <el-input
            v-model="loginObj.affirmPassword"
            type="password"
            placeholder="确认密码"
            show-password
            class="custom-input"
          >
            <template #prefix>
              <img src="@/assets/login/pass.svg" alt="password" style="width: 18px; height: 18px" />
            </template>
          </el-input>
        </el-form-item>
      </div>

      <!-- 忘记密码 -->
      <div ref="forgotPassword" class="flex-row">
        <span class="span">忘记密码?</span>
      </div>

      <!-- 提交按钮 -->
      <el-button ref="submitBtn" type="primary" class="button-submit" @click="submit">{{ submitText }}</el-button>

      <!-- 注册切换 -->
      <div class="switch-container" style=" margin-bottom: 20px;text-align: center; -webkit-app-region: no-drag">
        <p v-show="!regState" class="p switch-text">
          没有账户?
          <span class="span" @click="toggleRegisterState">注 册</span>
        </p>
        <p v-show="regState" class="p switch-text">
          点击返回
          <span class="span" @click="toggleRegisterState">登 录</span>
        </p>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
const regState = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const submitLoading = ref(false)
const changeRegLoading = ref(false)

const submitBtn = ref(null)
const submitText = ref('登 录')
const loginForm = ref(null)

const loginObj = reactive({
  username: '',
  password: '',
  affirmPassword: ''
})

const rules = reactive({
  username: [{ required: true, message: '账户不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  affirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (regState.value) {
          if (value === '') {
            callback(new Error('确认密码不能为空'))
          } else if (value !== loginObj.password) {
            callback(new Error('两次密码输入不一致'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const toggleRegisterState = () => {
  changeRegLoading.value = true
  setTimeout(() => {
    regState.value = !regState.value

    if (!regState.value) {
      loginObj.username = ''
      loginObj.password = ''
      loginObj.affirmPassword = ''
    }
    changeRegLoading.value = false
  }, 1000)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const submit = () => {
  if (!loginForm.value) return
  loginForm.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true

      setTimeout(() => {
        const screenWidth = window.screen.width
        const screenHeight = window.screen.height
        // 发送登录信息到主进程
        window.ipcRenderer.send('toMain', {
          username: loginObj.username,
          token: '',
          screenWidth: screenWidth,
          screenHeight: screenHeight
        })

        submitLoading.value = false
      }, 1000)
    }
  })
}
</script>

<style lang="scss" scoped>
.drag-region {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 40px; // 顶部 40px 可拖拽
  -webkit-app-region: drag;
}

.login-main {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  background-color: #fff;

  // 确保其他区域不可拖拽
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center; // 垂直居中
  width: 100%;
  height: 100%;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  user-select: none;
  background-color: #fff;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.login-main ::placeholder {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.login-main .form button {
  align-self: flex-end;
  margin-top: 20px; // 调整间距，移除 margin-top: auto 以避免被推到底部
  margin-bottom: 20px;
}

.login-main .flex-column > label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.login-main .input-form {
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 10px;
  background-color: var(--color-bg-input);
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  transition: 0.2s ease-in-out;
}

.login-main .input {
  width: 85%;
  height: 100%;
  margin-left: 10px;
  color: var(--color-text-primary);
  background-color: transparent;
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
  color: var(--color-text-secondary);
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
