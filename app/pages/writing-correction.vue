<template>
  <div class="container">
    <!-- 页面内容将在后续开发中添加 -->
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default", // 改为使用 default 布局
  middleware: "auth",
});

useHead({
  title: "写作批改 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "AI智能批改系统，从语法、词汇、句式等多个维度分析英语作文",
    },
  ],
});
</script>

<style scoped>
.container {
  padding: 2rem;
  background-color: var(--color-bg-primary);
}
</style>
