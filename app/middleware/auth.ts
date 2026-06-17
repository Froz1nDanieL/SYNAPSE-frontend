import { useLoginUserStore } from "~/stores/userLoginUserStore";
import { navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 检查是否在服务器端，如果是则不执行认证检查
  if (import.meta.server) {
    return;
  }

  const nuxtApp = useNuxtApp();
  const loginUserStore = useLoginUserStore(nuxtApp.$pinia);

  // 先检查localStorage中是否有登录状态
  if (loginUserStore.loginUser.userName === "未登录") {
    try {
      // 尝试从服务器获取用户信息，验证是否已登录
      await loginUserStore.fetchLoginUser();

      // 检查获取到的用户信息
      if (loginUserStore.loginUser.userName === "未登录") {
        return navigateTo("/user/login");
      }
    } catch (error) {
      // 获取用户信息失败，重定向到登录页
      console.warn("验证登录状态失败:", error);
      return navigateTo("/user/login");
    }
  }
  // 如果localStorage中有登录状态，则允许继续访问
});
