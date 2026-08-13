<template>
  <ResultPage
    type="success"
    title="提交成功"
    message="提交结果页用于反馈一系列操作任务的处理结果，如果仅是简单操作，使用 Message 全局提示反馈即可。灰色区域可以显示一些补充的信息。"
  >
    <template #content>
      <p>已提交申请，等待部门审核。</p>
    </template>
    <template #buttons>
      <el-button type="primary">返回修改</el-button>
      <el-button>查看</el-button>
      <el-button>打印</el-button>
    </template>
  </ResultPage>
</template>

<script setup>
defineOptions({ name: 'result-success' })
</script>
