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
      label-position="top"
    >
      <el-form-item prop="phone" label="手机号码:">
        <el-input
          v-model="ruleForm.phone"
          placeholder="请输入手机号码"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码:">
        <el-input
          v-model="ruleForm.password"
          placeholder="请输入密码"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #suffix>
            <span
              style=" display: flex; align-items: center;cursor: pointer"
              @click="togglePasswordVisibility"
            >
              <svg-icon
                :iconClass="showPassword ? 'open-eye' : 'close-eye'"
                width="16px"
                height="16px"
                hoverColor="#0066ff"
              />
            </span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          :class="isInput ? 'login-btn' : 'disabled-btn'"
          :color="isInput ? '#0066ff' : '#f3f4f5'"
          @click="submitForm(ruleFormRef)"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const ruleFormRef = ref()
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

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

// 是否输入了手机号码和密码
const isInput = computed(() => {
  return ruleForm.phone
})
</script>

<style lang="scss" scoped>
.account-login {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 320px;
  transform: translate(-50%, -50%);

  .avatar img {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    border-radius: 18px;
  }

  h3 {
    margin-bottom: 30px;
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
      color: #fff;
      border-radius: 18px;
    }

    .disabled-btn {
      width: 100%;
      height: 40px;
      font-size: 16px;
      color: #bfc1c1;
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

:deep(.el-input__wrapper) {
  height: 50px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.2s;

  &.is-focus {
    box-shadow: 0 0 0 1px var(--color-primary) inset !important;
  }
}

:deep(.el-input-group__prepend) {
  padding: 0 15px;
  background-color: white;
  border-radius: 8px 0 0 8px;
  box-shadow:
    1px 0 0 0 #dcdfe6 inset,
    0 1px 0 0 #dcdfe6 inset,
    0 -1px 0 0 #dcdfe6 inset;
}

:deep(.el-input-group--prepend .el-input__wrapper) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  box-shadow:
    0 1px 0 0 #dcdfe6 inset,
    0 -1px 0 0 #dcdfe6 inset,
    -1px 0 0 0 #dcdfe6 inset;
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
