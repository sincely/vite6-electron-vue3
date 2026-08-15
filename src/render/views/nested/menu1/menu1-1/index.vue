<template>
  <DemoCard title="菜单 1-1" :levels="['嵌套菜单', '菜单 1', '菜单 1-1']" />
</template>

<script setup>
import DemoCard from '../../components/DemoCard.vue'

defineOptions({ name: 'nested-menu1-1' })
</script>
