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
  title: "文章阅读 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "精选外刊、新闻、故事等优质英文内容",
    },
  ],
});
</script>

<style scoped>
.container {
  padding: 2rem;
  background-color: #f9f8f5;
}
</style>
