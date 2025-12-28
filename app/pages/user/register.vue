<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">用户注册</h1>
      <form class="auth-form" @submit.prevent="handleRegister">
        <!-- 邮箱输入框 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="registerForm.email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱"
            required
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <!-- 验证码 -->
        <div class="form-group">
          <label for="code">验证码</label>
          <div class="code-input-container">
            <input
              id="code"
              v-model="registerForm.code"
              type="text"
              class="form-input code-input"
              placeholder="请输入验证码"
              required
            />
            <button
              type="button"
              class="code-button"
              @click="sendCode"
              :disabled="countdown > 0 || !isEmailValid"
            >
              {{ countdown > 0 ? `${countdown}秒后重新发送` : "发送验证码" }}
            </button>
          </div>
          <p v-if="errors.code" class="error-message">{{ errors.code }}</p>
        </div>

        <!-- 账号输入框 -->
        <div class="form-group">
          <label for="userAccount">账号</label>
          <input
            id="userAccount"
            v-model="registerForm.userAccount"
            type="text"
            class="form-input"
            placeholder="请输入账号"
            required
          />
          <p v-if="errors.userAccount" class="error-message">
            {{ errors.userAccount }}
          </p>
        </div>

        <!-- 用户名输入框 -->
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
          <p v-if="errors.username" class="error-message">
            {{ errors.username }}
          </p>
        </div>

        <!-- 密码输入框 -->
        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="registerForm.password"
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
          <!-- 密码强度指示器 -->
          <div v-if="registerForm.password" class="password-strength-container">
            <div
              class="password-strength-bar"
              :class="passwordStrengthClass"
            ></div>
            <span class="password-strength-text">{{
              passwordStrengthText
            }}</span>
          </div>
          <p v-if="errors.password" class="error-message">
            {{ errors.password }}
          </p>
        </div>

        <!-- 确认密码输入框 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="请再次输入密码"
            required
          />
          <p v-if="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </p>
          <p
            v-else-if="
              registerForm.confirmPassword &&
              registerForm.password !== registerForm.confirmPassword
            "
            class="error-message"
          >
            两次输入的密码不一致
          </p>
          <p
            v-else-if="
              registerForm.confirmPassword &&
              registerForm.password === registerForm.confirmPassword
            "
            class="success-message"
          >
            两次输入的密码一致
          </p>
        </div>

        <button type="submit" class="auth-button" :disabled="isSubmitting">
          {{ isSubmitting ? "注册中..." : "注册" }}
        </button>
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
import { ref, reactive, computed } from "vue";
import {
  userRegister,
  sendRegisterCode,
  emailRegister,
} from "~/composables/api/userController";

definePageMeta({
  layout: false,
});

const router = useRouter();

// 注册表单数据
const registerForm = reactive({
  email: "",
  code: "",
  userAccount: "",
  username: "",
  password: "",
  confirmPassword: "",
});

// 错误信息
const errors = reactive({
  email: "",
  code: "",
  userAccount: "",
  username: "",
  password: "",
  confirmPassword: "",
});

// 验证码倒计时
const countdown = ref(0);
let countdownTimer = null;

// 密码可见性
const showPassword = ref(false);

// 表单提交状态
const isSubmitting = ref(false);

// 邮箱格式验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 账号格式验证正则（字母、数字及特殊字符组合）
const userAccountRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

// 用户名格式验证正则（中文、英文及数字组合）
const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;

// 密码强度检测
const passwordStrength = computed(() => {
  const password = registerForm.password;
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return strength;
});

// 密码强度样式类
const passwordStrengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "weak";
    case 2:
    case 3:
      return "medium";
    case 4:
    case 5:
      return "strong";
    default:
      return "weak";
  }
});

// 密码强度文本
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return "";
    case 1:
      return "弱";
    case 2:
      return "较弱";
    case 3:
      return "中等";
    case 4:
      return "较强";
    case 5:
      return "强";
    default:
      return "";
  }
});

// 邮箱是否有效
const isEmailValid = computed(() => {
  return emailRegex.test(registerForm.email);
});

// 发送验证码
async function sendCode() {
  // 验证邮箱格式
  if (!isEmailValid.value) {
    errors.email = "请输入有效的邮箱地址";
    return;
  }

  try {
    await sendRegisterCode({ userEmail: registerForm.email });

    // 开始倒计时
    countdown.value = 60;
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  } catch (error) {
    console.error("发送验证码失败:", error);
    alert("发送验证码失败，请稍后重试");
  }
}

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

  // 验证邮箱
  if (!registerForm.email) {
    errors.email = "请输入邮箱";
    isValid = false;
  } else if (!emailRegex.test(registerForm.email)) {
    errors.email = "请输入有效的邮箱地址";
    isValid = false;
  }

  // 验证验证码
  if (!registerForm.code) {
    errors.code = "请输入验证码";
    isValid = false;
  } else if (registerForm.code.length !== 6) {
    errors.code = "验证码长度为6位";
    isValid = false;
  }

  // 验证账号
  if (!registerForm.userAccount) {
    errors.userAccount = "请输入账号";
    isValid = false;
  } else if (
    registerForm.userAccount.length < 4 ||
    registerForm.userAccount.length > 20
  ) {
    errors.userAccount = "账号长度为4-20位";
    isValid = false;
  } else if (!userAccountRegex.test(registerForm.userAccount)) {
    errors.userAccount = "账号只能包含字母、数字及特殊字符";
    isValid = false;
  }

  // 验证用户名
  if (!registerForm.username) {
    errors.username = "请输入用户名";
    isValid = false;
  } else if (
    registerForm.username.length < 2 ||
    registerForm.username.length > 20
  ) {
    errors.username = "用户名长度为2-20位";
    isValid = false;
  } else if (!usernameRegex.test(registerForm.username)) {
    errors.username = "用户名只能包含中文、英文及数字";
    isValid = false;
  }

  // 验证密码
  if (!registerForm.password) {
    errors.password = "请输入密码";
    isValid = false;
  } else if (registerForm.password.length < 8) {
    errors.password = "密码长度至少为8位";
    isValid = false;
  } else if (passwordStrength.value < 2) {
    errors.password = "密码强度太弱，请增加密码复杂度";
    isValid = false;
  }

  // 验证确认密码
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = "请确认密码";
    isValid = false;
  } else if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = "两次输入的密码不一致";
    isValid = false;
  }

  return isValid;
}

// 处理表单提交
async function handleRegister() {
  // 验证表单
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // 使用邮箱注册API
    const res = await emailRegister({
      userEmail: registerForm.email,
      emailCode: registerForm.code,
      userAccount: registerForm.userAccount,
      userPassword: registerForm.password,
      checkPassword: registerForm.confirmPassword,
    });

    if (res.data.code === 0 && res.data.data) {
      // 注册成功，跳转到登录页
      alert("注册成功，请登录");
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

/* 验证码输入容器 */
.code-input-container {
  display: flex;
  gap: 0.5rem;
}

.code-input {
  flex: 1;
}

.code-button {
  padding: 0.75rem 1rem;
  background-color: #000033;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.code-button:hover:not(:disabled) {
  background-color: #000055;
}

.code-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

/* 密码强度指示器 */
.password-strength-container {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.password-strength-bar.weak {
  background-color: #ff4d4f;
  width: 33%;
}

.password-strength-bar.medium {
  background-color: #faad14;
  width: 66%;
}

.password-strength-bar.strong {
  background-color: #52c41a;
  width: 100%;
}

.password-strength-text {
  font-size: 0.9rem;
  color: #666;
  min-width: 30px;
}

/* 错误信息 */
.error-message {
  margin-top: 0.5rem;
  color: #ff4d4f;
  font-size: 0.9rem;
  margin-bottom: 0;
}

/* 成功信息 */
.success-message {
  margin-top: 0.5rem;
  color: #52c41a;
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

  .code-input-container {
    flex-direction: column;
  }

  .code-button {
    width: 100%;
  }
}
</style>
