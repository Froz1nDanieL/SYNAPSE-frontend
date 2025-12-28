<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">重置密码</h1>

      <form class="auth-form" @submit.prevent="handleResetPassword">
        <!-- 邮箱输入 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="resetForm.email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱地址"
            required
          />
          <p v-if="errors.email" class="error-message">
            {{ errors.email }}
          </p>
        </div>

        <!-- 验证码输入 -->
        <div class="form-group code-group">
          <label for="code">验证码</label>
          <div class="code-input-container">
            <input
              id="code"
              v-model="resetForm.code"
              type="text"
              class="form-input code-input"
              placeholder="请输入验证码"
              required
            />
            <button
              type="button"
              class="code-button"
              @click="sendCode"
              :disabled="isSendingCode || countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}秒后重新发送` : "发送验证码" }}
            </button>
          </div>
          <p v-if="errors.code" class="error-message">
            {{ errors.code }}
          </p>
        </div>

        <!-- 新密码输入 -->
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <div class="password-input-container">
            <input
              id="newPassword"
              v-model="resetForm.newPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入新密码"
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
          <!-- 密码强度指示 -->
          <div class="password-strength-container">
            <div class="password-strength-bar">
              <div
                class="password-strength-progress"
                :style="{ width: `${passwordStrength * 20}%` }"
                :class="getStrengthClass(passwordStrength)"
              ></div>
            </div>
            <div class="password-strength-text">
              {{ getStrengthText(passwordStrength) }}
            </div>
          </div>
          <p v-if="errors.newPassword" class="error-message">
            {{ errors.newPassword }}
          </p>
        </div>

        <!-- 确认密码输入 -->
        <div class="form-group">
          <label for="checkPassword">确认密码</label>
          <input
            id="checkPassword"
            v-model="resetForm.checkPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入新密码"
            required
          />
          <p v-if="errors.checkPassword" class="error-message">
            {{ errors.checkPassword }}
          </p>
        </div>

        <button type="submit" class="auth-button" :disabled="isSubmitting">
          {{ isSubmitting ? "重置中..." : "重置密码" }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          记住密码了？<NuxtLink to="/user/login" class="auth-link"
            >返回登录</NuxtLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import {
  sendResetPasswordCode,
  resetPassword,
} from "~/composables/api/userController";

definePageMeta({
  layout: false,
});

const router = useRouter();

// 重置密码表单数据
const resetForm = reactive({
  email: "",
  code: "",
  newPassword: "",
  checkPassword: "",
});

// 错误信息
const errors = reactive({
  email: "",
  code: "",
  newPassword: "",
  checkPassword: "",
});

// 验证码倒计时
const countdown = ref(0);
const isSendingCode = ref(false);
let countdownTimer = null;

// 密码可见性
const showPassword = ref(false);

// 表单提交状态
const isSubmitting = ref(false);

// 邮箱格式验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码强度计算
const passwordStrength = computed(() => {
  const password = resetForm.newPassword;
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return strength;
});

// 切换密码可见性
function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

// 发送验证码
async function sendCode() {
  // 验证邮箱格式
  if (!resetForm.email) {
    errors.email = "请输入邮箱地址";
    return;
  }

  if (!emailRegex.test(resetForm.email)) {
    errors.email = "请输入有效的邮箱地址";
    return;
  }

  try {
    isSendingCode.value = true;
    const res = await sendResetPasswordCode({
      userEmail: resetForm.email,
    });

    if (res.data.code === 0) {
      // 开始倒计时
      countdown.value = 60;
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      alert("验证码发送成功");
    } else {
      alert(res.data.message || "验证码发送失败");
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    alert("验证码发送失败，请稍后重试");
  } finally {
    isSendingCode.value = false;
  }
}

// 表单验证
function validateForm() {
  let isValid = true;

  // 重置错误信息
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  // 验证邮箱
  if (!resetForm.email) {
    errors.email = "请输入邮箱地址";
    isValid = false;
  } else if (!emailRegex.test(resetForm.email)) {
    errors.email = "请输入有效的邮箱地址";
    isValid = false;
  }

  // 验证验证码
  if (!resetForm.code) {
    errors.code = "请输入验证码";
    isValid = false;
  } else if (resetForm.code.length !== 6) {
    errors.code = "验证码格式错误";
    isValid = false;
  }

  // 验证新密码
  if (!resetForm.newPassword) {
    errors.newPassword = "请输入新密码";
    isValid = false;
  } else if (resetForm.newPassword.length < 8) {
    errors.newPassword = "密码长度不能少于8位";
    isValid = false;
  }

  // 验证确认密码
  if (!resetForm.checkPassword) {
    errors.checkPassword = "请再次输入新密码";
    isValid = false;
  } else if (resetForm.newPassword !== resetForm.checkPassword) {
    errors.checkPassword = "两次输入的密码不一致";
    isValid = false;
  }

  return isValid;
}

// 重置密码提交
async function handleResetPassword() {
  // 验证表单
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await resetPassword({
      userEmail: resetForm.email,
      emailCode: resetForm.code,
      newPassword: resetForm.newPassword,
      checkPassword: resetForm.checkPassword,
    });

    if (res.data.code === 0) {
      alert("密码重置成功");
      // 跳转到登录页面
      await router.push("/user/login");
    } else {
      alert(res.data.message || "密码重置失败");
    }
  } catch (error) {
    console.error("密码重置失败:", error);
    if (error.response && error.response.data && error.response.data.message) {
      alert(`密码重置失败：${error.response.data.message}`);
    } else {
      alert("密码重置过程中出现错误：" + (error.message || "未知错误"));
    }
  } finally {
    isSubmitting.value = false;
  }
}

// 获取密码强度等级对应的CSS类名
function getStrengthClass(strength) {
  switch (strength) {
    case 0:
      return "strength-0";
    case 1:
      return "strength-1";
    case 2:
      return "strength-2";
    case 3:
      return "strength-3";
    case 4:
      return "strength-4";
    case 5:
      return "strength-5";
    default:
      return "strength-0";
  }
}

// 获取密码强度文本
function getStrengthText(strength) {
  switch (strength) {
    case 0:
      return "";
    case 1:
      return "密码强度：非常弱";
    case 2:
      return "密码强度：弱";
    case 3:
      return "密码强度：中";
    case 4:
      return "密码强度：强";
    case 5:
      return "密码强度：非常强";
    default:
      return "";
  }
}
</script>

<style scoped>
/* 基础样式与登录注册页面保持一致 */
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
  padding: 0 1rem;
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

/* 密码强度样式 */
.password-strength-container {
  margin-top: 0.5rem;
}

.password-strength-bar {
  width: 100%;
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.password-strength-progress {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

/* 密码强度颜色 */
.strength-0 {
  background-color: #eee;
}
.strength-1 {
  background-color: #ff4d4f;
}
.strength-2 {
  background-color: #faad14;
}
.strength-3 {
  background-color: #52c41a;
}
.strength-4 {
  background-color: #1890ff;
}
.strength-5 {
  background-color: #722ed1;
}

.password-strength-text {
  font-size: 0.8rem;
  color: #666;
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

  /* 验证码输入在移动端垂直排列 */
  .code-input-container {
    flex-direction: column;
  }

  .code-button {
    padding: 0.75rem;
    width: 100%;
  }
}
</style>
