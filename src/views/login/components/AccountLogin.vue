<template>
  <div class="account-login">
    <div class="avatar">
      <img src="@/assets/bar/icon.png" alt="avatar" />
    </div>
    <h3>你好，成舟</h3>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      class="demo-ruleForm"
    >
      <el-form-item prop="phone">
        <el-input
          v-model="ruleForm.phone"
          placeholder="请输入手机号码"
          size="large"
        >
          <template #prepend>+86</template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="ruleForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          size="large"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="login-btn"
          @click="submitForm(ruleFormRef)"
        >
          登录
        </el-button>
      </el-form-item>
      <div class="options">
        <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
        <div>
          <el-link :underline="false">忘记密码</el-link>
          <el-link :underline="false">其他验证方式</el-link>
        </div>
      </div>
    </el-form>
    <div class="footer-links">
      <a>注册账号</a>
      <a>企业账号</a>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const ruleFormRef = ref()
const autoLogin = ref(true)

const ruleForm = reactive({
  phone: '',
  password: ''
})

const rules = reactive({
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      window.ipcRenderer.send('toMain')
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style lang="scss" scoped>
.account-login {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  width: 320px;

  .avatar img {
    width: 80px;
    height: 80px;
    border-radius: 18px;
  }

  h3 {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .demo-ruleForm {
    width: 100%;

    .login-btn {
      width: 100%;
      height: 40px;
      font-size: 16px;
      border-radius: 18px;
    }

    .options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .el-link {
        margin-left: 10px;
      }
    }
  }

  .footer-links {
    display: flex;
    gap: 15px;
    align-items: center;
    font-size: 12px;
    color: #888;

    .separator {
      width: 1px;
      height: 12px;
      background-color: #ccc;
    }

    .info-icon {
      margin-left: 2px;
    }
  }
}

:deep(.el-input-group__prepend) {
  padding: 0 15px;
  background-color: white;
  border-radius: 8px 0 0 8px;
}

:deep(.el-input__wrapper) {
  height: 40px;
  border-radius: 0 8px 8px 0;
}

:deep(.el-button--primary) {
  color: #aaa;
  background-color: #f0f0f0;
  border-color: #f0f0f0;

  &:hover {
    background-color: #e0e0e0;
    border-color: #e0e0e0;
  }
}
</style>
