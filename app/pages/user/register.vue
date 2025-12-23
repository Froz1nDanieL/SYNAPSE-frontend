<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">用户注册</h1>
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="registerForm.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="registerForm.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <button type="submit" class="auth-button">注册</button>
      </form>

      <div class="auth-footer">
        <p>
          已有账号？<NuxtLink to="/user/login" class="auth-link"
            >立即登录</NuxtLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { userRegister } from "~/composables/api/userController";

definePageMeta({
  layout: false,
});

const router = useRouter();

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

async function handleRegister() {
  // 检查两次密码是否一致
  if (registerForm.password !== registerForm.confirmPassword) {
    alert("两次输入的密码不一致");
    return;
  }

  try {
    // 移除了email字段，因为API不需要
    const res = await userRegister({
      userAccount: registerForm.username,
      userPassword: registerForm.password,
      checkPassword: registerForm.confirmPassword,
    });

    if (res.data.code === 0 && res.data.data) {
      // 注册成功，跳转到登录页
      await router.push("/user/login");
    } else {
      alert(res.data.message || "注册失败");
    }
  } catch (error) {
    // 显示更详细的错误信息
    if (error.response && error.response.data && error.response.data.message) {
      alert(`注册失败：${error.response.data.message}`);
    } else {
      alert("注册过程中出现错误：" + (error.message || "未知错误"));
    }
    console.error(error);
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

.auth-button:hover {
  background-color: #000055;
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
</style>
