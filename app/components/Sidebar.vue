<template>
  <div class="sidebar-container">
    <!-- 灵动岛风格侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-expanded': isExpanded }">
      <!-- Logo 和切换按钮容器 -->
      <div class="sidebar-header">
        <!-- Logo 占位符 -->
        <div class="sidebar-logo">
          <div class="logo-placeholder"></div>
        </div>

        <!-- 切换按钮 -->
        <button
          class="sidebar-toggle"
          @click="toggleSidebar"
          aria-label="切换侧边栏"
        >
          <RightOutlined />
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <ul>
          <li class="nav-item">
            <NuxtLink to="/word/word-memory" class="nav-link"
              >单词记忆</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink to="/article/article-main" class="nav-link"
              >文章主页</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink to="/translation" class="nav-link">翻译页面</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink to="/writing-correction" class="nav-link"
              >写作批改</NuxtLink
            >
          </li>
        </ul>
      </nav>

      <!-- 用户头像/登录图标 -->
      <div class="sidebar-user">
        <UserIcon
          v-if="!isLogin"
          class="user-avatar"
          @click="handleUserIconClick"
        />
        <UserAvatar
          v-else
          :user="loginUserStore.loginUser"
          class="user-avatar"
          @click="handleUserIconClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { RightOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useLoginUserStore } from "~/stores/userLoginUserStore";
import UserIcon from "./UserIcon.vue";
import UserAvatar from "./UserAvatar.vue";

// 侧边栏展开状态
const isExpanded = ref(false);
const router = useRouter();
const loginUserStore = useLoginUserStore();

// 判断是否登录（简单判断用户名不为"未登录"）
const isLogin = computed(() => {
  return loginUserStore.loginUser.userName !== "未登录";
});

// 切换侧边栏展开状态
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
};

// 处理用户图标点击事件
function handleUserIconClick() {
  if (isLogin.value) {
    // 如果已经登录，跳转到个人资料页面
    router.push("/user/profile");
  } else {
    router.push("/user/login");
  }
}
</script>

<style scoped>
/* 侧边栏容器 */
.sidebar-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

/* 基础侧边栏样式 */
.sidebar {
  position: relative;
  display: block;
  width: 120px;
  height: 60px;
  background-color: #f6f6f6;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0 15px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 展开状态 */
.sidebar-expanded {
  width: 220px;
  height: auto;
  border-radius: 20px;
  padding: 20px;
}

/* Logo 和切换按钮容器 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 展开状态下header高度调整 */
.sidebar-expanded .sidebar-header {
  height: auto;
  margin-bottom: 10px;
}

/* Logo 占位符 */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-placeholder {
  width: 36px;
  height: 36px;
  background-color: #e6d9c3;
  border-radius: 12px;
}

/* 导航菜单 */
.sidebar-nav {
  width: 100%;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  margin-top: 20px;
}

.sidebar-expanded .sidebar-nav {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.nav-item {
  margin-bottom: 16px;
}

.nav-link {
  display: block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.nav-link:hover {
  background-color: #e6d9c3;
  transform: translateX(5px);
}

/* 切换按钮 */
.sidebar-toggle {
  margin-left: auto;
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
}

/* 箭头图标翻转效果 */
.sidebar-toggle .anticon {
  transition: transform 0.3s ease;
  font-size: 18px;
  color: #333;
}

.sidebar-expanded .sidebar-toggle .anticon {
  transform: rotate(180deg);
}

/* 用户头像/登录图标 */
.sidebar-user {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.sidebar-expanded .sidebar-user {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-avatar {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-container {
    top: 15px;
    left: 15px;
  }

  .sidebar {
    width: 110px;
    height: 55px;
  }

  .sidebar-header {
    height: 55px;
  }

  .sidebar-expanded {
    width: 200px;
    height: auto;
  }

  .logo-placeholder {
    width: 32px;
    height: 32px;
  }

  .sidebar-toggle {
    width: 32px;
    height: 32px;
  }

  .nav-link {
    font-size: 13px;
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100px;
    height: 50px;
  }

  .sidebar-header {
    height: 50px;
  }

  .sidebar-expanded {
    width: 180px;
    height: auto;
  }

  .logo-placeholder {
    width: 28px;
    height: 28px;
  }

  .sidebar-toggle {
    width: 28px;
    height: 28px;
  }

  .nav-link {
    font-size: 12px;
  }
}
</style>
