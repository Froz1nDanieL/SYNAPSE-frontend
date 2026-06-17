<template>
  <div class="sidebar-root">
    <button
      class="logo-trigger"
      type="button"
      :aria-expanded="isExpanded"
      aria-controls="app-sidebar"
      aria-label="切换侧边栏"
      @click="toggleSidebar"
    >
      <img src="~/assets/img/logo.png" alt="MS-EN" class="logo-mark" />
    </button>

    <button
      class="sidebar-overlay"
      :class="{ 'sidebar-overlay--visible': isExpanded }"
      type="button"
      :aria-hidden="!isExpanded"
      aria-label="收起侧边栏"
      :tabindex="isExpanded ? 0 : -1"
      @click="closeSidebar"
    />

    <aside
      id="app-sidebar"
      class="sidebar-panel"
      :class="{ 'sidebar-panel--expanded': isExpanded }"
    >
      <div class="sidebar-content">
        <div class="sidebar-spacer" />

        <nav class="sidebar-nav" aria-label="主导航">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            @click="closeSidebar"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <button
          class="user-entry"
          type="button"
          aria-label="用户中心"
          @click="handleUserIconClick"
        >
          <UserIcon v-if="!isLogin" />
          <UserAvatar v-else :user="loginUserStore.loginUser" />
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useLoginUserStore } from "~/stores/userLoginUserStore";
import UserAvatar from "./UserAvatar.vue";
import UserIcon from "./UserIcon.vue";

const navItems = [
  { label: "单词记忆", to: "/word/word-main" },
  { label: "文章阅读", to: "/article/article-main" },
  { label: "翻译工作台", to: "/translation/translation-text" },
  { label: "写作批改", to: "/writing/writing-main" },
];

const isExpanded = ref(false);
const router = useRouter();
const loginUserStore = useLoginUserStore();

const isLogin = computed(() => {
  return Boolean(
    loginUserStore.loginUser?.userName &&
      loginUserStore.loginUser.userName !== "未登录",
  );
});

function toggleSidebar() {
  isExpanded.value = !isExpanded.value;
}

function closeSidebar() {
  isExpanded.value = false;
}

function handleUserIconClick() {
  closeSidebar();

  if (isLogin.value) {
    router.push("/user/profile");
    return;
  }

  router.push("/user/login");
}
</script>

<style scoped>
.sidebar-root {
  position: fixed;
  inset: 0 auto auto 0;
  z-index: 1000;
  pointer-events: none;
}

.logo-trigger {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1002;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  pointer-events: auto;
  transition:
    color 180ms ease-out;
}

.logo-trigger:hover {
  color: #141414;
}

.logo-mark {
  display: block;
  width: 34px;
  height: 34px;
  object-fit: contain;
  transition: transform 180ms ease-out;
}

.logo-trigger:hover .logo-mark {
  transform: scale(1.08);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 0;
  border: none;
  background: rgba(15, 15, 15, 0.36);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.sidebar-overlay--visible {
  opacity: 1;
  pointer-events: auto;
}

.sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  width: 260px;
  height: 100vh;
  background: rgba(250, 249, 245, 0.98);
  border-right: 1px solid rgba(40, 40, 40, 0.1);
  transform: translateX(-100%);
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: auto;
}

.sidebar-panel--expanded {
  transform: translateX(0);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 88px 16px 20px;
}

.sidebar-spacer {
  height: 8px;
  flex: 0 0 auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.3;
  text-decoration: none;
  transition:
    background-color 160ms ease-out,
    color 160ms ease-out;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #eeeae0;
  color: #171717;
}

.user-entry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-top: auto;
  border: 1px solid rgba(40, 40, 40, 0.1);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    background-color 160ms ease-out,
    border-color 160ms ease-out;
}

.user-entry:hover {
  border-color: rgba(40, 40, 40, 0.18);
  background: #eeeae0;
}

.user-entry :deep(.user-icon),
.user-entry :deep(.user-avatar) {
  width: 32px;
  height: 32px;
  transform: none;
}

.user-entry :deep(.user-icon:hover),
.user-entry :deep(.user-avatar:hover) {
  transform: none;
}

@media (max-width: 480px) {
  .logo-trigger {
    top: 12px;
    left: 12px;
    width: 48px;
    height: 48px;
  }

  .sidebar-panel {
    width: 240px;
  }

  .sidebar-content {
    padding: 80px 14px 18px;
  }
}
</style>
