<template>
  <div class="layout-container">
    <Sidebar />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup></script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
}
</style>
