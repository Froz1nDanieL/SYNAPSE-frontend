import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { getLoginUser } from "~/composables/api/userController";

// 从localStorage获取保存的登录状态
function getStoredLoginUser() {
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem("loginUser");
      return stored ? JSON.parse(stored) : { userName: "未登录" };
    } catch (error) {
      console.error("读取localStorage中的登录状态失败:", error);
      return { userName: "未登录" };
    }
  }
  return { userName: "未登录" };
}

export const useLoginUserStore = defineStore("loginUser", () => {
  // 初始化用户状态，优先从localStorage读取
  const loginUser = ref<API.LoginUserVO>(getStoredLoginUser());

  // 监听loginUser变化，自动保存到localStorage
  watch(
    loginUser,
    (newUser) => {
      if (import.meta.client) {
        try {
          localStorage.setItem("loginUser", JSON.stringify(newUser));
        } catch (error) {
          console.error("保存登录状态到localStorage失败:", error);
        }
      }
    },
    { deep: true }
  );

  /**
   * 远程获取登陆用户信息
   */
  async function fetchLoginUser() {
    try {
      const res = await getLoginUser();
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data;
      } else if (res.data.code === 40100) {
        // 服务器返回未登录状态
        loginUser.value = { userName: "未登录" };
      }
      // 如果API返回其他错误状态码，不清除localStorage中的登录状态
      return res;
    } catch (error) {
      // 网络错误等情况，保留localStorage中的登录状态
      console.error("获取用户信息失败:", error);
      throw error;
    }
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  function clearLoginUser() {
    loginUser.value = { userName: "未登录" };
  }

  return { loginUser, setLoginUser, fetchLoginUser, clearLoginUser };
});
