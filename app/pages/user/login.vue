<template>
  <div class="auth-page">
    <nav class="auth-nav" aria-label="登录导航">
      <NuxtLink class="brand" to="/">
        <span>SYNAPSE</span>
        <strong>突触</strong>
      </NuxtLink>
      <NuxtLink class="nav-entry" to="/user/register">注册</NuxtLink>
    </nav>

    <main class="auth-shell" aria-labelledby="login-title">
      <section class="auth-stage">
        <p class="auth-kicker">Account</p>
        <h1 id="login-title" class="auth-title">登录</h1>

        <div class="login-tabs" aria-label="登录方式">
          <button
            type="button"
            class="login-tab"
            :class="{ active: loginType === 'account' }"
            @click="loginType = 'account'"
          >
            账号
          </button>
          <button
            type="button"
            class="login-tab"
            :class="{ active: loginType === 'email' }"
            @click="loginType = 'email'"
          >
            邮箱
          </button>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-line">
            <label for="username">{{
              loginType === "account" ? "账号" : "邮箱"
            }}</label>
            <input
              id="username"
              v-model="loginForm.username"
              :type="loginType === 'email' ? 'email' : 'text'"
              :placeholder="
                loginType === 'account' ? '输入你的账号' : '输入你的邮箱'
              "
              autocomplete="username"
              required
            />
            <p v-if="errors.username" class="field-message error-message">
              {{ errors.username }}
            </p>
          </div>

          <div class="form-line">
            <label for="password">密码</label>
            <div class="inline-control">
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="输入你的密码"
                autocomplete="current-password"
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
            <p v-if="errors.password" class="field-message error-message">
              {{ errors.password }}
            </p>
          </div>

          <button type="submit" class="auth-button" :disabled="isSubmitting">
            {{ isSubmitting ? "登录中..." : "登录" }}
          </button>
        </form>

        <div class="auth-footer">
          <NuxtLink to="/user/forgot-password">忘记密码？</NuxtLink>
          <p>
            还没有账号？
            <NuxtLink to="/user/register">立即注册</NuxtLink>
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { userLogin } from "~/composables/api/userController";
import { useLoginUserStore } from "~/stores/userLoginUserStore";

definePageMeta({
  layout: false,
});

const router = useRouter();
const loginUserStore = useLoginUserStore();
const loginType = ref("account");
const showPassword = ref(false);
const isSubmitting = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

const errors = reactive({
  username: "",
  password: "",
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

function validateForm() {
  let isValid = true;

  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });

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

  if (!loginForm.password) {
    errors.password = "请输入密码";
    isValid = false;
  }

  return isValid;
}

async function handleLogin() {
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
      loginUserStore.setLoginUser(res.data.data);
      await router.push("/");
    } else {
      alert(res.data.message || "登录失败");
    }
  } catch (error) {
    if (error.response?.data?.message) {
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
.auth-page {
  --paper: var(--color-bg-primary, #f1efe9);
  --paper-soft: #f8f7f2;
  --ink: var(--color-text-primary, #282828);
  --muted: #746f67;
  --quiet: #aaa59b;
  --rule: var(--color-accent-secondary, #e2ded1);
  --accent: #516b5b;
  --danger: #a0443e;
  --serif: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC",
    Georgia, serif;
  --sans: "SF Pro Display", "PingFang SC", "Microsoft YaHei",
    "Noto Sans CJK SC", "Source Han Sans SC", system-ui, sans-serif;

  min-height: 100dvh;
  overflow: hidden;
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
  padding: clamp(5rem, 17vh, 9rem) 1.25rem 4rem;
}

.auth-stage {
  width: min(100%, 39.5rem);
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
  font-size: clamp(2.5rem, 5vw, 4.1rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-align: center;
}

.login-tabs {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: clamp(2.1rem, 4vh, 3rem) 0 1.5rem;
}

.login-tab {
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--quiet);
  cursor: pointer;
  font: inherit;
  font-size: 0.9rem;
  padding: 0 0 0.35rem;
  transition:
    border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    color 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.login-tab.active,
.login-tab:hover {
  border-bottom-color: var(--ink);
  color: var(--ink);
}

.auth-form {
  display: grid;
  gap: 1.55rem;
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
  transition: color 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.text-control:hover {
  color: var(--ink);
}

.field-message {
  margin: 0.2rem 0 0;
  font-size: 0.86rem;
  line-height: 1.45;
}

.error-message {
  color: var(--danger);
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
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.8rem 1.2rem;
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

@media (max-width: 640px) {
  .auth-nav {
    min-height: 4rem;
    padding: 0 1rem;
  }

  .auth-shell {
    min-height: calc(100dvh - 4rem);
    padding: 3.75rem 1rem 2rem;
  }

  .auth-stage {
    width: 100%;
  }

  .auth-footer {
    display: grid;
  }
}
</style>
