import { getCurrentPlan } from "~/composables/api/learnPlanController";
import { navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 检查是否在服务器端或非目标页面，如果是则不执行检查
  if (import.meta.server || to.path !== "/word/word-memory") {
    return;
  }

  // 在Nuxt 4中，异步中间件需要确保正确处理重定向
  let hasValidPlan = false;

  try {
    const { data: apiResponse } = await getCurrentPlan();
    hasValidPlan = apiResponse.code === 0 && Boolean(apiResponse.data);
  } catch (error) {
    console.error("获取学习计划失败:", error);
    hasValidPlan = false;
  }

  // 如果没有有效的学习计划，执行重定向
  if (!hasValidPlan) {
    // 使用navigateTo的字符串形式，这在Nuxt 4中更可靠
    const queryParams = new URLSearchParams();
    queryParams.append("redirect", to.path);

    // 添加原有的查询参数
    Object.entries(to.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const redirectPath = `/word/word-book-selection?${queryParams.toString()}`;

    // 在客户端环境中，使用window.location进行重定向
    if (import.meta.client) {
      window.location.href = redirectPath;
      // 确保函数终止
      return false;
    }

    // 在服务器端环境中，使用navigateTo
    return navigateTo(redirectPath);
  }

  // 有有效的学习计划，允许访问
  return;
});
