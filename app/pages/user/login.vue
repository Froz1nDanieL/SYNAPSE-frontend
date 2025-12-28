<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">用户登录</h1>

      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <button
          type="button"
          class="login-tab"
          :class="{ active: loginType === 'account' }"
          @click="loginType = 'account'"
        >
          账号登录
        </button>
        <button
          type="button"
          class="login-tab"
          :class="{ active: loginType === 'email' }"
          @click="loginType = 'email'"
        >
          邮箱登录
        </button>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">{{
            loginType === "account" ? "账号" : "邮箱"
          }}</label>
          <input
            id="username"
            v-model="loginForm.username"
            :type="loginType === 'email' ? 'email' : 'text'"
            class="form-input"
            :placeholder="loginType === 'account' ? '请输入账号' : '请输入邮箱'"
            required
          />
          <p v-if="errors.username" class="error-message">
            {{ errors.username }}
          </p>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
              required
            />
            <button
              type="button"
              class="password-toggle-button"
              @click="toggleShowPassword"
            >
              {{ showPassword ? "隐藏" : "显示" }}
            </button>
          </div>
          <p v-if="errors.password" class="error-message">
            {{ errors.password }}
          </p>
        </div>

        <button type="submit" class="auth-button" :disabled="isSubmitting">
          {{ isSubmitting ? "登录中..." : "登录" }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          还没有账号？<NuxtLink to="/user/register" class="auth-link"
            >立即注册</NuxtLink
          >
        </p>
        <p class="forgot-password">
          <NuxtLink to="/user/forgot-password" class="auth-link">
            忘记密码？
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { userLogin } from "~/composables/api/userController";
import { useLoginUserStore } from "~/stores/userLoginUserStore";

definePageMeta({
  layout: false,
});

const router = useRouter();
const loginUserStore = useLoginUserStore();

// 登录方式：account（账号登录）或 email（邮箱登录）
const loginType = ref("account");

// 登录表单数据
const loginForm = reactive({
  username: "",
  password: "",
});

// 错误信息
const errors = reactive({
  username: "",
  password: "",
});

// 邮箱格式验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码可见性
const showPassword = ref(false);

// 表单提交状态
const isSubmitting = ref(false);

// 切换密码可见性
function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

// 表单验证
function validateForm() {
  let isValid = true;

  // 重置错误信息
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  // 验证账号/邮箱
  if (!loginForm.username) {
    errors.username =
      loginType.value === "account" ? "请输入账号" : "请输入邮箱";
    isValid = false;
  } else if (
    loginType.value === "email" &&
    !emailRegex.test(loginForm.username)
  ) {
    errors.username = "请输入有效的邮箱地址";
    isValid = false;
  }

  // 验证密码
  if (!loginForm.password) {
    errors.password = "请输入密码";
    isValid = false;
  }

  return isValid;
}

async function handleLogin() {
  // 验证表单
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await userLogin({
      userAccount: loginForm.username,
      userPassword: loginForm.password,
    });

    if (res.data.code === 0 && res.data.data) {
      // 更新store中的用户信息
      loginUserStore.setLoginUser(res.data.data);
      // 登录成功，跳转到首页
      await router.push("/");
    } else {
      alert(res.data.message || "登录失败");
    }
  } catch (error) {
    // 显示更详细的错误信息
    if (error.response && error.response.data && error.response.data.message) {
      alert(`登录失败：${error.response.data.message}`);
    } else {
      alert("登录过程中出现错误：" + (error.message || "未知错误"));
    }
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fff;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 51, 0.1);
}

.auth-title {
  text-align: center;
  color: #000033;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

/* 登录方式切换标签页 */
.login-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #ddd;
}

.login-tab {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.login-tab:hover {
  color: #000033;
}

.login-tab.active {
  color: #000033;
  border-bottom-color: #000033;
  font-weight: 500;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #000033;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  color: #000033;
}

.form-input:focus {
  outline: none;
  border-color: #000033;
  box-shadow: 0 0 0 2px rgba(0, 0, 51, 0.2);
}

/* 密码输入容器 */
.password-input-container {
  position: relative;
}

.password-toggle-button {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #000033;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
}

/* 错误信息 */
.error-message {
  margin-top: 0.5rem;
  color: #ff4d4f;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #000033;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-button:hover:not(:disabled) {
  background-color: #000055;
}

.auth-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  color: #666;
}

.auth-link {
  color: #000033;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }

  .auth-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>
