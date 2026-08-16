<template>
  <DemoCard
    title="菜单 1-2"
    :levels="['嵌套菜单', '菜单 1', '菜单 1-2']"
    description="与「菜单 1-1」同属二级分组「菜单 1」，用于验证同级多页面在标签栏、面包屑与缓存中的独立表现。"
  />
</template>

<script setup>
import DemoCard from '../../components/DemoCard.vue'

defineOptions({ name: 'nested-menu1-2' })
</script>
