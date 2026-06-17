<template>
  <div class="auth-page">
    <nav class="auth-nav" aria-label="注册导航">
      <NuxtLink class="brand" to="/">
        <span>SYNAPSE</span>
        <strong>突触</strong>
      </NuxtLink>
      <NuxtLink class="nav-entry" to="/user/login">登录</NuxtLink>
    </nav>

    <main class="auth-shell" aria-labelledby="register-title">
      <section class="auth-stage">
        <p class="auth-kicker">New account</p>
        <h1 id="register-title" class="auth-title">创建账号</h1>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-line">
            <label for="email">邮箱</label>
            <div class="inline-control code-control">
              <input
                id="email"
                v-model="registerForm.email"
                type="email"
                placeholder="输入你的邮箱"
                autocomplete="email"
                required
              />
              <button
                type="button"
                class="text-control"
                :disabled="countdown > 0 || !isEmailValid"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown} 秒后重发` : "发送验证码" }}
              </button>
            </div>
            <p v-if="errors.email" class="field-message error-message">
              {{ errors.email }}
            </p>
          </div>

          <div class="form-line">
            <label for="code">验证码</label>
            <input
              id="code"
              v-model="registerForm.code"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="输入 6 位验证码"
              autocomplete="one-time-code"
              required
            />
            <p v-if="errors.code" class="field-message error-message">
              {{ errors.code }}
            </p>
          </div>

          <div class="form-grid">
            <div class="form-line">
              <label for="userAccount">账号</label>
              <input
                id="userAccount"
                v-model="registerForm.userAccount"
                type="text"
                placeholder="4 到 20 位账号"
                autocomplete="username"
                required
              />
              <p v-if="errors.userAccount" class="field-message error-message">
                {{ errors.userAccount }}
              </p>
            </div>

            <div class="form-line">
              <label for="username">用户名</label>
              <input
                id="username"
                v-model="registerForm.username"
                type="text"
                placeholder="显示在学习页的名字"
                autocomplete="nickname"
                required
              />
              <p v-if="errors.username" class="field-message error-message">
                {{ errors.username }}
              </p>
            </div>
          </div>

          <div class="form-line">
            <label for="password">密码</label>
            <div class="inline-control">
              <input
                id="password"
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="至少 8 位，建议包含大小写和数字"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="text-control"
                @click="toggleShowPassword"
              >
                {{ showPassword ? "隐藏" : "显示" }}
              </button>
            </div>
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-meter" aria-hidden="true">
                <span
                  v-for="item in 5"
                  :key="item"
                  :class="{ active: item <= passwordStrength }"
                ></span>
              </div>
              <span>{{ passwordStrengthText }}</span>
            </div>
            <p v-if="errors.password" class="field-message error-message">
              {{ errors.password }}
            </p>
          </div>

          <div class="form-line">
            <label for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="再次输入密码"
              autocomplete="new-password"
              required
            />
            <p v-if="errors.confirmPassword" class="field-message error-message">
              {{ errors.confirmPassword }}
            </p>
            <p
              v-else-if="
                registerForm.confirmPassword &&
                registerForm.password !== registerForm.confirmPassword
              "
              class="field-message error-message"
            >
              两次输入的密码不一致
            </p>
            <p
              v-else-if="
                registerForm.confirmPassword &&
                registerForm.password === registerForm.confirmPassword
              "
              class="field-message success-message"
            >
              两次密码一致
            </p>
          </div>

          <button type="submit" class="auth-button" :disabled="isSubmitting">
            {{ isSubmitting ? "注册中..." : "注册" }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            已有账号？
            <NuxtLink to="/user/login">立即登录</NuxtLink>
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import {
  emailRegister,
  sendRegisterCode,
} from "~/composables/api/userController";

definePageMeta({
  layout: false,
});

const router = useRouter();
const countdown = ref(0);
const showPassword = ref(false);
const isSubmitting = ref(false);
let countdownTimer = null;

const registerForm = reactive({
  email: "",
  code: "",
  userAccount: "",
  username: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  email: "",
  code: "",
  userAccount: "",
  username: "",
  password: "",
  confirmPassword: "",
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userAccountRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;

const isEmailValid = computed(() => emailRegex.test(registerForm.email));

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

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return "";
    case 1:
      return "密码强度偏弱";
    case 2:
      return "密码强度一般";
    case 3:
      return "密码强度中等";
    case 4:
      return "密码强度较强";
    case 5:
      return "密码强度很强";
    default:
      return "";
  }
});

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

function startCountdown() {
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

async function sendCode() {
  if (!isEmailValid.value) {
    errors.email = "请输入有效的邮箱地址";
    return;
  }

  try {
    errors.email = "";
    await sendRegisterCode({ userEmail: registerForm.email });
    startCountdown();
  } catch (error) {
    console.error("发送验证码失败:", error);
    alert("验证码发送失败，请稍后重试");
  }
}

function validateForm() {
  let isValid = true;

  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

  if (!registerForm.email) {
    errors.email = "请输入邮箱";
    isValid = false;
  } else if (!emailRegex.test(registerForm.email)) {
    errors.email = "请输入有效的邮箱地址";
    isValid = false;
  }

  if (!registerForm.code) {
    errors.code = "请输入验证码";
    isValid = false;
  } else if (registerForm.code.length !== 6) {
    errors.code = "验证码长度为 6 位";
    isValid = false;
  }

  if (!registerForm.userAccount) {
    errors.userAccount = "请输入账号";
    isValid = false;
  } else if (
    registerForm.userAccount.length < 4 ||
    registerForm.userAccount.length > 20
  ) {
    errors.userAccount = "账号长度为 4 到 20 位";
    isValid = false;
  } else if (!userAccountRegex.test(registerForm.userAccount)) {
    errors.userAccount = "账号只能包含字母、数字和常用符号";
    isValid = false;
  }

  if (!registerForm.username) {
    errors.username = "请输入用户名";
    isValid = false;
  } else if (
    registerForm.username.length < 2 ||
    registerForm.username.length > 20
  ) {
    errors.username = "用户名长度为 2 到 20 位";
    isValid = false;
  } else if (!usernameRegex.test(registerForm.username)) {
    errors.username = "用户名只能包含中文、英文和数字";
    isValid = false;
  }

  if (!registerForm.password) {
    errors.password = "请输入密码";
    isValid = false;
  } else if (registerForm.password.length < 8) {
    errors.password = "密码长度至少为 8 位";
    isValid = false;
  } else if (passwordStrength.value < 2) {
    errors.password = "密码强度太弱，请增加复杂度";
    isValid = false;
  }

  if (!registerForm.confirmPassword) {
    errors.confirmPassword = "请确认密码";
    isValid = false;
  } else if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = "两次输入的密码不一致";
    isValid = false;
  }

  return isValid;
}

async function handleRegister() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await emailRegister({
      userEmail: registerForm.email,
      emailCode: registerForm.code,
      userAccount: registerForm.userAccount,
      userPassword: registerForm.password,
      checkPassword: registerForm.confirmPassword,
    });

    if (res.data.code === 0 && res.data.data) {
      alert("注册成功，请登录");
      await router.push("/user/login");
    } else {
      alert(res.data.message || "注册失败");
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(`注册失败：${error.response.data.message}`);
    } else {
      alert("注册过程中出现错误：" + (error.message || "未知错误"));
    }
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.auth-page {
  --paper: var(--color-bg-primary, #f1efe9);
  --paper-soft: #f8f7f2;
  --ink: var(--color-text-primary, #282828);
  --muted: #746f67;
  --quiet: #aaa59b;
  --rule: var(--color-accent-secondary, #e2ded1);
  --accent: #516b5b;
  --danger: #a0443e;
  --success: #516b5b;
  --serif: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC",
    Georgia, serif;
  --sans: "SF Pro Display", "PingFang SC", "Microsoft YaHei",
    "Noto Sans CJK SC", "Source Han Sans SC", system-ui, sans-serif;

  min-height: 100dvh;
  overflow-y: auto;
  background:
    linear-gradient(rgba(40, 40, 40, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(40, 40, 40, 0.02) 1px, transparent 1px),
    var(--paper);
  background-size: 6rem 6rem;
  color: var(--ink);
  font-family: var(--sans);
}

.auth-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4.5rem;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

.brand,
.nav-entry,
.auth-footer a {
  color: inherit;
  text-decoration: none;
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
}

.brand span {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.18rem;
  font-weight: 700;
}

.brand strong {
  font-family: var(--serif);
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-entry {
  color: var(--muted);
  font-size: 0.92rem;
  transition: color 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-entry:hover,
.auth-footer a:hover {
  color: var(--ink);
}

.auth-shell {
  display: grid;
  min-height: calc(100dvh - 4.5rem);
  place-items: start center;
  padding: clamp(3.75rem, 10vh, 6.5rem) 1.25rem 4rem;
}

.auth-stage {
  width: min(100%, 46rem);
}

.auth-kicker {
  margin: 0 0 0.65rem;
  color: var(--quiet);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 0.9rem;
  text-align: center;
}

.auth-title {
  margin: 0;
  color: var(--ink);
  font-family: Georgia, var(--serif);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-align: center;
}

.auth-form {
  display: grid;
  gap: 1.45rem;
  margin-top: clamp(2.25rem, 4.4vh, 3.4rem);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.45rem 1.5rem;
}

.form-line {
  display: grid;
  gap: 0.45rem;
}

.form-line label {
  color: var(--quiet);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.form-line input {
  width: 100%;
  min-height: 3rem;
  border: 0;
  border-bottom: 2px solid color-mix(in srgb, var(--rule) 76%, var(--quiet));
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 1.05rem;
  outline: none;
  padding: 0.45rem 0;
  transition:
    border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    color 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.form-line input::placeholder {
  color: color-mix(in srgb, var(--quiet) 78%, transparent);
}

.form-line input:focus {
  border-bottom-color: var(--ink);
}

.inline-control {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  border-bottom: 2px solid color-mix(in srgb, var(--rule) 76%, var(--quiet));
}

.inline-control:focus-within {
  border-bottom-color: var(--ink);
}

.inline-control input {
  border-bottom: 0;
}

.text-control {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.9rem;
  padding: 0 0 0.85rem 1rem;
  white-space: nowrap;
  transition:
    color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.text-control:hover:not(:disabled) {
  color: var(--ink);
}

.text-control:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.field-message {
  margin: 0.2rem 0 0;
  font-size: 0.86rem;
  line-height: 1.45;
}

.error-message {
  color: var(--danger);
}

.success-message {
  color: var(--success);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--muted);
  font-size: 0.86rem;
}

.strength-meter {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.35rem;
  width: 9.5rem;
}

.strength-meter span {
  height: 2px;
  background: color-mix(in srgb, var(--rule) 82%, white);
}

.strength-meter span.active {
  background: var(--accent);
}

.auth-button {
  width: 100%;
  min-height: 4.55rem;
  margin-top: 0.55rem;
  border: 0;
  border-radius: 0;
  background: #34322c;
  color: var(--paper-soft);
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  transition:
    background-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-button:hover:not(:disabled) {
  background: #282820;
}

.auth-button:active:not(:disabled) {
  transform: scale(0.99);
}

.auth-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.auth-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.55rem;
  color: var(--muted);
  font-size: 0.98rem;
}

.auth-footer p {
  margin: 0;
}

.auth-footer a {
  color: var(--ink);
  font-weight: 500;
}

button:focus-visible,
a:focus-visible {
  outline: 1px solid color-mix(in srgb, var(--ink) 42%, transparent);
  outline-offset: 4px;
}

input:focus-visible {
  outline: none;
}

@media (max-width: 720px) {
  .auth-nav {
    min-height: 4rem;
    padding: 0 1rem;
  }

  .auth-shell {
    min-height: calc(100dvh - 4rem);
    padding: 3.25rem 1rem 2rem;
  }

  .auth-stage {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .code-control {
    grid-template-columns: 1fr;
  }

  .code-control .text-control {
    justify-self: start;
    padding: 0.1rem 0 0.75rem;
  }

  .password-strength {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.45rem;
  }
}
</style>
