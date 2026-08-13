<template>
  <ResultPage
    type="fail"
    title="提交失败"
    message="请核对并修改以下信息后，再重新提交。"
  >
    <template #content>
      <p>您提交的内容有如下错误：</p>
      <p>
        <SvgIcon
          icon-class="close"
          width="14px"
          height="14px"
          color="var(--color-danger)"
        />
        <span>您的账户已被冻结</span>
      </p>
      <p>
        <SvgIcon
          icon-class="close"
          width="14px"
          height="14px"
          color="var(--color-danger)"
        />
        <span>您的账户还不具备申请资格</span>
      </p>
    </template>
    <template #buttons>
      <el-button type="primary">返回修改</el-button>
      <el-button>查看</el-button>
    </template>
  </ResultPage>
</template>

<script setup>
defineOptions({ name: 'result-fail' })
</script>
