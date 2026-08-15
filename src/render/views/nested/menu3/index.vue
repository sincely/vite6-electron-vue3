<template>
  <DemoCard
    title="菜单 3"
    :levels="['嵌套菜单', '菜单 3']"
    description="「菜单 3」是直接挂在一级菜单下的二级页面（无子级），与嵌套分组混合排列，验证两种菜单形态的共存。"
  />
</template>

<script setup>
import DemoCard from '../components/DemoCard.vue'

defineOptions({ name: 'nested-menu3' })
</script>
