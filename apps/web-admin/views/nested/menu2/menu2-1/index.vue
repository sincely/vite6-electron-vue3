<template>
  <DemoCard
    title="菜单 2-1"
    :levels="['嵌套菜单', '菜单 2', '菜单 2-1']"
    description="「菜单 2」分组下仅有一个页面，点击分组菜单时默认跳转到其第一个叶子页面。"
  />
</template>

<script setup>
import DemoCard from '../../components/DemoCard.vue'

defineOptions({ name: 'nested-menu2-1' })
</script>
