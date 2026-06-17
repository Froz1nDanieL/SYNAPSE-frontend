<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useLoginUserStore } from "~/stores/userLoginUserStore";

// 在客户端挂载后获取用户信息，确保在浏览器环境中执行
onMounted(() => {
  const loginUserStore = useLoginUserStore();
  loginUserStore.fetchLoginUser();
});
</script>
