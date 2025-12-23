<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>S</h2>
    </div>
    <nav class="nav-menu">
      <ul>
        <li
          v-for="item in menuItems"
          :key="item.path"
          :class="{ active: isActive(item.path) }"
          @click="navigateTo(item.path)"
          :title="item.name"
        >
          <div class="icon-placeholder"></div>
        </li>
      </ul>
    </nav>
    <div class="user-profile" @click="goToProfile">
      <UserAvatar :user="loginUserStore.loginUser" />
    </div>
  </aside>
</template>

<script setup>
import UserAvatar from "./UserAvatar.vue";
import { useLoginUserStore } from "~/stores/userLoginUserStore";

const route = useRoute();
const router = useRouter();
const loginUserStore = useLoginUserStore();

const menuItems = [
  { name: "背单词", path: "/word/word-memory" },
  { name: "文章阅读", path: "/article-reading" },
  { name: "英汉互译", path: "/translation" },
  { name: "写作批改", path: "/writing-correction" },
];

const isActive = (path) => {
  return route.path === path;
};

const navigateTo = (path) => {
  router.push(path);
};

const goToProfile = () => {
  router.push("/user/profile");
};
</script>

<style scoped>
.sidebar {
  width: 100px;
  background-color: #000045;
  color: white;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
}

.logo {
  padding: 0 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  text-align: center;
}

.logo h2 {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: center;
}

.nav-menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon-placeholder {
  width: 24px;
  height: 24px;
  background-color: #ffffff50;
  border-radius: 4px;
}

.nav-menu li.active {
  background-color: #000076;
}

.user-profile {
  margin-top: auto;
  padding: 1rem 0 2rem;
  cursor: pointer;
}
</style>
