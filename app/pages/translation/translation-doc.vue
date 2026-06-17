<template>
  <main class="translation-redirect" aria-live="polite">
    <p>正在打开翻译工作台...</p>
  </main>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

await navigateTo(
  {
    path: "/translation/translation-text",
    query: { mode: "document" },
  },
  { replace: true },
);
</script>

<style scoped>
.translation-redirect {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.translation-redirect p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 64%, transparent);
}
</style>
