<template>
  <div class="magazine-home">
    <nav class="home-nav" aria-label="登录后首页导航">
      <NuxtLink class="brand" to="/home">
        <span>SYNAPSE</span>
        <strong>突触</strong>
      </NuxtLink>
      <div class="nav-links">
        <NuxtLink to="/article/article-main">文章</NuxtLink>
        <NuxtLink to="/word/word-main">单词</NuxtLink>
        <NuxtLink to="/translation/translation-text">翻译</NuxtLink>
        <NuxtLink to="/writing/writing-main">写作</NuxtLink>
      </div>
      <button type="button" class="profile-button" @click="goProfile">
        <span>{{ isLogin ? "个人" : "登录" }}</span>
        <Icon name="ph:user-circle" aria-hidden="true" />
      </button>
    </nav>

    <main class="edition" aria-label="SYNAPSE 今日学习首页">
      <header class="masthead">
        <div class="masthead-copy">
          <p>今日英语版面</p>
          <h1>SYNAPSE <span>突触</span></h1>
        </div>
        <div class="masthead-note">
          <span>今天</span>
          <time>{{ today }}</time>
        </div>
      </header>

      <section class="edition-grid" aria-label="今日学习入口">
        <NuxtLink class="panel article-panel" to="/article/article-main">
          <div class="panel-head">
            <span>今日精读</span>
            <strong>
              进入文章
              <Icon name="ph:arrow-up-right" aria-hidden="true" />
            </strong>
          </div>
          <div class="panel-copy">
            <h2>慢读一段英文，把陌生表达留在语境里。</h2>
            <p>
              从精选文章开始，点词查看单词卡，再把值得复习的表达放入今日任务。
            </p>
          </div>
          <div class="article-preview" aria-hidden="true">
            <p>
              Language becomes usable when a word returns inside a living
              <span>context</span>.
            </p>
            <div class="word-card">
              <strong>context</strong>
              <small>/ˈkɒntekst/</small>
              <em>语境，上下文</em>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink class="panel word-panel" to="/word/word-main">
          <div class="panel-head">
            <span>单词复习</span>
            <strong>
              开始
              <Icon name="ph:arrow-up-right" aria-hidden="true" />
            </strong>
          </div>
          <div class="word-focus">
            <h2>serendipity</h2>
            <p>/ˌserənˈdɪpəti/</p>
          </div>
          <div class="review-row">
            <div class="ring"><span>68%</span></div>
            <p>今天先回到昨天遇到的词，再开始新的文章。</p>
          </div>
        </NuxtLink>

        <NuxtLink class="panel translate-panel" to="/translation/translation-text">
          <div class="panel-head">
            <span>翻译工作台</span>
            <strong>
              打开
              <Icon name="ph:arrow-up-right" aria-hidden="true" />
            </strong>
          </div>
          <p>翻译一句难句，或把文档放进同一张工作台处理。</p>
          <div class="translation-strip" aria-hidden="true">
            <span>中文理解</span>
            <Icon name="ph:arrow-right" aria-hidden="true" />
            <span>英文表达</span>
          </div>
        </NuxtLink>

        <NuxtLink class="panel writing-panel" to="/writing/writing-main">
          <div class="panel-head">
            <span>写作批改</span>
            <strong>
              查看
              <Icon name="ph:arrow-up-right" aria-hidden="true" />
            </strong>
          </div>
          <p>
            The city was <span class="strike">very very</span>
            <span class="highlight">remarkably</span> quiet after rain.
          </p>
          <div class="notes">
            <span>删去重复</span>
            <span>补强衔接</span>
          </div>
        </NuxtLink>

        <section class="panel plan-panel">
          <div class="panel-head">
            <span>今日路径</span>
            <strong>4 步</strong>
          </div>
          <ol>
            <li><span>读</span>一篇文章</li>
            <li><span>查</span>一个单词</li>
            <li><span>译</span>一句难句</li>
            <li><span>改</span>一段作文</li>
          </ol>
        </section>
      </section>

      <div class="bottom-breath" aria-hidden="true">
        <span></span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLoginUserStore } from "~/stores/userLoginUserStore";

definePageMeta({
  layout: false,
});

const router = useRouter();
const loginUserStore = useLoginUserStore();

const isLogin = computed(() => {
  const user = loginUserStore.loginUser || {};
  const userName = String(user.userName || "");

  return Boolean(
    user.id ||
      user.userAccount ||
      user.userAvatar ||
      (userName && userName !== "未登录" && !userName.includes("鏈"))
  );
});

const today = computed(() => {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

function goProfile() {
  router.push(isLogin.value ? "/user/profile" : "/user/login");
}

onMounted(() => {
  if (!isLogin.value) {
    router.replace("/");
  }
});
</script>

<style scoped>
.magazine-home {
  --paper: var(--color-bg-primary, #f1efe9);
  --surface: #fbfaf6;
  --paper-soft: #f7f6f1;
  --ink: var(--color-text-primary, #282828);
  --muted: #6b665f;
  --quiet: #948f86;
  --rule: var(--color-accent-secondary, #e2ded1);
  --accent: #516b5b;
  --accent-soft: #e8eee7;
  --serif: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC",
    Georgia, serif;
  --sans: "SF Pro Display", "PingFang SC", "Microsoft YaHei",
    "Noto Sans CJK SC", "Source Han Sans SC", system-ui, sans-serif;

  height: 100dvh;
  overflow: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
}

.home-nav {
  display: grid;
  grid-template-columns: minmax(11rem, 1fr) auto minmax(3rem, 1fr);
  align-items: center;
  height: 4.5rem;
  gap: 1.5rem;
  padding: 0 clamp(1rem, 3vw, 2.5rem);
  border-bottom: 1px solid color-mix(in srgb, var(--rule) 82%, transparent);
  background: color-mix(in srgb, var(--paper) 92%, white);
}

.brand,
.nav-links a,
.panel,
.profile-button {
  color: inherit;
  text-decoration: none;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
}

.brand span {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0;
}

.brand strong {
  font-family: var(--serif);
  font-size: 0.98rem;
  font-weight: 500;
}

.nav-links {
  display: flex;
  gap: clamp(0.85rem, 2vw, 1.35rem);
  color: var(--muted);
  font-size: 0.92rem;
}

.nav-links a {
  transition:
    color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-links a:hover {
  color: var(--ink);
}

.profile-button {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
  min-width: 4.5rem;
  height: 2.45rem;
  padding: 0 0.85rem;
  border: 1px solid color-mix(in srgb, var(--rule) 86%, var(--ink));
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  transition:
    background-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-button :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.profile-button:hover {
  border-color: color-mix(in srgb, var(--ink) 28%, var(--rule));
  background: var(--paper-soft);
}

.profile-button:active {
  transform: scale(0.98);
}

.edition {
  display: grid;
  grid-template-rows: auto auto minmax(2.25rem, 1fr);
  gap: clamp(0.9rem, 1.8vh, 1.35rem);
  width: min(100%, 1440px);
  height: calc(100dvh - 4.5rem);
  margin: 0 auto;
  padding: clamp(0.85rem, 1.5vh, 1.2rem) clamp(1rem, 2.5vw, 2rem)
    clamp(1.35rem, 3vh, 2.45rem);
}

.masthead {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: clamp(1rem, 3vw, 2rem);
  min-height: clamp(7.25rem, 15vh, 8.6rem);
  padding-bottom: clamp(0.75rem, 1.6vh, 1.15rem);
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 86%, transparent);
}

.masthead-copy {
  min-width: 0;
}

.masthead p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.masthead h1 {
  margin: 0.5rem 0 0;
  font-family: Georgia, var(--serif);
  font-size: 6.7rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.9;
  text-wrap: balance;
}

.masthead h1 span {
  font-family: var(--serif);
  font-weight: 400;
}

.masthead-note {
  display: grid;
  justify-items: end;
  gap: 0.35rem;
  min-width: 8rem;
  padding-bottom: 0.35rem;
}

.masthead-note span {
  color: var(--quiet);
  font-size: 0.78rem;
}

.masthead-note time {
  color: var(--muted);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1rem;
  white-space: nowrap;
}

.edition-grid {
  align-self: start;
  display: grid;
  grid-template-columns: minmax(0, 1.24fr) minmax(17rem, 0.72fr) minmax(
      16rem,
      0.62fr
    );
  grid-template-rows: minmax(12rem, 1fr) minmax(10rem, 0.82fr);
  grid-template-areas:
    "article word plan"
    "article translate writing";
  gap: clamp(0.9rem, 1.25vw, 1.35rem);
  height: clamp(27rem, 54vh, 37rem);
  min-height: 0;
}

.bottom-breath {
  display: grid;
  align-items: end;
  min-height: 0;
  pointer-events: none;
}

.bottom-breath span {
  display: block;
  width: min(18rem, 28vw);
  height: 1px;
  background: color-mix(in srgb, var(--rule) 72%, transparent);
}

.panel {
  position: relative;
  display: grid;
  gap: clamp(1rem, 1.6vh, 1.45rem);
  align-content: start;
  min-height: 0;
  padding: clamp(1.1rem, 1.8vw, 1.55rem);
  border: 1px solid color-mix(in srgb, var(--rule) 88%, white);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface) 88%, var(--paper));
  overflow: hidden;
  transition:
    background-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.panel:hover {
  border-color: color-mix(in srgb, var(--accent) 28%, var(--rule));
  background: var(--surface);
  transform: translateY(-2px);
}

.panel:focus-visible,
.profile-button:focus-visible,
.nav-links a:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 62%, white);
  outline-offset: 3px;
}

.article-panel {
  grid-area: article;
  align-content: space-between;
  padding: clamp(1.35rem, 2.5vw, 2.1rem);
}

.word-panel {
  grid-area: word;
}

.translate-panel {
  grid-area: translate;
}

.writing-panel {
  grid-area: writing;
}

.plan-panel {
  grid-area: plan;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  color: var(--muted);
  font-size: 0.86rem;
  line-height: 1.3;
}

.panel-head strong {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--ink);
  font-weight: 500;
  white-space: nowrap;
}

.panel-head :deep(svg) {
  width: 0.95rem;
  height: 0.95rem;
}

.panel h2 {
  margin: 0;
  font-family: var(--serif);
  font-size: 2.35rem;
  font-weight: 500;
  line-height: 1.16;
  text-wrap: balance;
}

.panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.panel-copy {
  display: grid;
  gap: 1rem;
  max-width: 38rem;
}

.article-panel h2 {
  font-size: 3.7rem;
  line-height: 1.06;
}

.article-preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(11rem, 0.42fr);
  gap: 1rem;
  align-items: end;
  margin-top: auto;
}

.article-preview p {
  max-width: 25rem;
  color: color-mix(in srgb, var(--muted) 88%, var(--ink));
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.55rem;
  line-height: 1.34;
}

.article-preview p span {
  background: var(--accent-soft);
  color: var(--ink);
}

.word-card {
  display: grid;
  gap: 0.32rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--ink) 80%, var(--rule));
  border-radius: 8px;
  background: var(--surface);
}

.word-card strong,
.word-focus h2 {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
}

.word-card strong {
  font-size: 1.65rem;
}

.word-card small,
.word-card em {
  color: var(--muted);
  font-style: normal;
}

.word-focus {
  display: grid;
  gap: 0.45rem;
}

.word-focus h2 {
  font-size: 2.9rem;
  line-height: 1;
  word-break: break-word;
}

.review-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.ring {
  display: grid;
  width: 4.7rem;
  height: 4.7rem;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(var(--accent) 0 68%, var(--rule) 68% 100%);
}

.ring span {
  display: grid;
  width: 3.45rem;
  height: 3.45rem;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
  font-family: Georgia, "Times New Roman", serif;
}

.translate-panel,
.writing-panel,
.plan-panel {
  align-content: space-between;
}

.translation-strip {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--accent);
  font-size: 0.9rem;
}

.translation-strip span {
  padding: 0.48rem 0.62rem;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: var(--paper-soft);
  white-space: nowrap;
}

.translation-strip :deep(svg) {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
}

.writing-panel p {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.32rem;
  line-height: 1.56;
}

.strike {
  position: relative;
  color: rgba(40, 40, 40, 0.5);
}

.strike::after {
  position: absolute;
  right: -0.1rem;
  bottom: 0.48em;
  left: -0.1rem;
  height: 2px;
  content: "";
  background: var(--accent);
  transform: rotate(-4deg);
}

.highlight {
  background: rgba(81, 107, 91, 0.13);
}

.notes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.notes span {
  padding: 0.42rem 0.58rem;
  border: 1px solid color-mix(in srgb, var(--rule) 82%, white);
  border-radius: 6px;
  background: var(--paper-soft);
  color: var(--accent);
  font-size: 0.86rem;
}

.plan-panel ol {
  display: grid;
  gap: 0.62rem;
  margin: 0;
  padding: 0;
  color: var(--muted);
  list-style: none;
}

.plan-panel li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 2.5rem;
  padding: 0.42rem 0.55rem;
  border-radius: 6px;
  background: color-mix(in srgb, var(--paper-soft) 74%, white);
}

.plan-panel li span {
  display: grid;
  flex: 0 0 auto;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  border: 1px solid var(--rule);
  border-radius: 6px;
  color: var(--accent);
  font-size: 0.78rem;
}

@media (max-width: 1280px) {
  .masthead h1 {
    font-size: 5.15rem;
  }

  .article-panel h2 {
    font-size: 3rem;
  }

  .panel h2 {
    font-size: 2.05rem;
  }

  .word-focus h2 {
    font-size: 2.45rem;
  }
}

@media (min-width: 901px) and (max-height: 760px) {
  .edition {
    grid-template-rows: auto auto minmax(1.75rem, 1fr);
    gap: 0.8rem;
    padding-top: 0.75rem;
    padding-bottom: 1.55rem;
  }

  .masthead {
    min-height: 6.7rem;
  }

  .masthead h1 {
    font-size: 4.8rem;
  }

  .edition-grid {
    height: clamp(21.5rem, 48vh, 29rem);
    grid-template-rows: minmax(9.75rem, 1fr) minmax(7.75rem, 0.82fr);
  }

  .panel {
    gap: 0.8rem;
    padding: 1rem;
  }

  .article-panel {
    padding: 1.25rem;
  }

  .article-panel h2 {
    font-size: 2.65rem;
  }

  .article-preview p,
  .writing-panel p {
    font-size: 1.2rem;
  }
}

@media (max-width: 900px) {
  .magazine-home {
    overflow-y: auto;
  }

  .home-nav {
    grid-template-columns: 1fr auto;
    padding: 0 1rem;
  }

  .nav-links {
    display: none;
  }

  .edition {
    height: auto;
    min-height: calc(100dvh - 4.5rem);
    gap: 1rem;
    padding: 1rem;
  }

  .masthead {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .masthead h1 {
    font-size: 3.7rem;
  }

  .masthead-note {
    justify-items: start;
    min-width: 0;
  }

  .edition-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-template-areas:
      "article"
      "word"
      "translate"
      "writing"
      "plan";
    height: auto;
  }

  .panel {
    min-height: 16rem;
  }

  .article-preview {
    grid-template-columns: 1fr;
  }

  .bottom-breath {
    min-height: 2rem;
  }

  .bottom-breath span {
    width: 9rem;
  }
}

@media (max-width: 540px) {
  .home-nav {
    height: 4.1rem;
  }

  .brand span {
    font-size: 1rem;
  }

  .brand strong {
    font-size: 0.9rem;
  }

  .profile-button span {
    display: none;
  }

  .profile-button {
    min-width: 2.65rem;
    padding: 0;
  }

  .edition {
    min-height: calc(100dvh - 4.1rem);
  }

  .masthead h1 {
    font-size: 2.85rem;
  }

  .article-panel h2,
  .panel h2 {
    font-size: 2rem;
  }

  .word-focus h2 {
    font-size: 2.15rem;
  }

  .review-row {
    grid-template-columns: 1fr;
  }

  .panel {
    min-height: 14rem;
  }

  .bottom-breath {
    min-height: 1.5rem;
  }
}
</style>
