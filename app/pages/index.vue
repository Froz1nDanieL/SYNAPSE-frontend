<template>
  <div class="intro-page">
    <nav class="intro-nav" aria-label="首页导航">
      <NuxtLink class="brand" to="/">
        <span>SYNAPSE</span>
        <strong>突触</strong>
      </NuxtLink>

      <div class="nav-links">
        <a href="#method">学习闭环</a>
        <a href="#features">核心功能</a>
        <a href="#principle">产品理念</a>
      </div>

      <div class="nav-actions">
        <NuxtLink class="ghost-link" to="/user/login">登录</NuxtLink>
        <NuxtLink class="solid-link" to="/user/register">免费注册</NuxtLink>
      </div>
    </nav>

    <main class="intro-shell">
      <section class="hero-section" aria-labelledby="hero-title">
        <p class="brand-mark" aria-label="SYNAPSE 突触" data-reveal>
          <span>SYNAPSE</span>
          <strong>突触</strong>
        </p>
        <div class="hero-copy" data-reveal>
          <h1 id="hero-title" aria-label="把英语学成一种反应。">
            <span class="typing-text" aria-hidden="true">
              <span
                v-for="(char, index) in heroChars"
                :key="`${char}-${index}`"
                :style="{ '--i': index }"
              >
                {{ char }}
              </span>
            </span>
          </h1>
          <p>
            SYNAPSE
            把文章精读、点词释义、单词复习、英汉互译和写作批改放回同一个语境。
            你不需要在工具之间来回切换，只要沿着一篇文章，把理解变成记忆，再把记忆变成表达。
          </p>
          <div class="hero-actions" aria-label="开始使用">
            <NuxtLink class="primary-action" to="/user/register"
              >开始学习</NuxtLink
            >
            <NuxtLink class="secondary-action" to="/user/login"
              >登录进入</NuxtLink
            >
          </div>
        </div>
      </section>

      <section
        id="method"
        class="method-section"
        aria-labelledby="method-title"
      >
        <div class="section-heading" data-reveal>
          <span>学习闭环</span>
          <h2 id="method-title">
            不是多几个按钮，而是让每一步自然接上下一步。
          </h2>
        </div>

        <div class="loop-board" data-reveal>
          <article
            v-for="(step, index) in methodSteps"
            :key="step.title"
            :style="{ '--index': index }"
          >
            <small>{{ step.index }}</small>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </section>

      <section id="features" class="feature-section" aria-label="核心功能介绍">
        <div class="feature-section-heading" data-reveal>
          <span>核心功能</span>
          <h2>把阅读、记忆、翻译和写作放回同一条线。</h2>
          <p>
            每个功能都不是单独的入口，而是一次英语学习中自然发生的动作。
          </p>
        </div>

        <div class="feature-list">
          <article
            v-for="(feature, index) in features"
            :key="feature.title"
            class="feature-row"
            :class="feature.theme"
            :style="{ '--index': index }"
            data-reveal
          >
            <div class="feature-copy">
              <span>{{ feature.label }}</span>
              <h2>{{ feature.title }}</h2>
              <p>{{ feature.text }}</p>
              <NuxtLink :to="feature.to">{{ feature.action }}</NuxtLink>
            </div>

            <div class="feature-proof" aria-hidden="true">
              <template v-if="feature.theme === 'reading-feature'">
                <p class="article-line">
                  Language becomes usable when a word returns inside a living
                  <span class="demo-word">
                    context
                    <i class="cursor-tap"></i>
                  </span>.
                </p>
                <div class="floating-word-card">
                  <strong>context</strong>
                  <small>/ˈkɑːntekst/</small>
                  <em>语境，上下文</em>
                </div>
              </template>

              <template v-else-if="feature.theme === 'memory-feature'">
                <div class="memory-stack">
                  <span>serendipity</span>
                  <span>convey</span>
                  <span>hesitate</span>
                  <span>precise</span>
                </div>
                <div class="review-ring"><span>68%</span></div>
              </template>

              <template v-else-if="feature.theme === 'translation-feature'">
                <div class="translation-pair">
                  <p>这句话到底想表达什么？</p>
                  <p>What is this sentence really trying to say?</p>
                </div>
              </template>

              <template v-else>
                <div class="manuscript-demo">
                  <p>
                    The city was <span class="strike">very very</span>
                    <span class="highlight">remarkably</span> quiet after rain.
                  </p>
                  <p>
                    I <span class="wave">have went</span> through the article and
                    found a sharper argument.
                  </p>
                  <div>
                    <span>删去重复</span>
                    <span>修正时态</span>
                    <span>补强衔接</span>
                  </div>
                </div>
              </template>
            </div>
          </article>
        </div>
      </section>

      <section
        id="principle"
        class="principle-section"
        aria-labelledby="principle-title"
      >
        <div class="principle-statement" data-reveal>
          <span>产品理念</span>
          <h2 id="principle-title">
            语言不是靠堆功能学会的，而是在可重复的语境里长出来的。
          </h2>
        </div>

        <div class="principle-list" data-reveal>
          <article v-for="item in principles" :key="item.title">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section class="cta-section" aria-labelledby="cta-title" data-reveal>
        <span>今日开始</span>
        <h2 id="cta-title">先读一篇文章，再带走几个真正会用的表达。</h2>
        <p>
          注册后进入你的 100vh
          今日杂志版面，从精读开始，把查、背、译、写放回同一条学习路径。
        </p>
        <div class="hero-actions">
          <NuxtLink class="primary-action" to="/user/register"
            >免费创建账号</NuxtLink
          >
          <NuxtLink class="secondary-action" to="/user/login"
            >已有账号登录</NuxtLink
          >
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLoginUserStore } from "~/stores/userLoginUserStore";

definePageMeta({
  layout: false,
});

const router = useRouter();
const loginUserStore = useLoginUserStore();
let revealObserver;

const heroChars = Array.from("把英语学成一种反应。");

const methodSteps = [
  {
    index: "01",
    title: "先读懂",
    text: "从真实文章进入语境，先看内容、观点和句子结构。",
  },
  {
    index: "02",
    title: "再点词",
    text: "光标点到陌生单词时，释义卡在文章旁边出现。",
  },
  {
    index: "03",
    title: "接着复习",
    text: "把今天遇到的词放进复习节奏，而不是只收藏一次。",
  },
  {
    index: "04",
    title: "最后输出",
    text: "用翻译和写作批改，把理解转成自己的表达。",
  },
];

const features = [
  {
    label: "文章精读",
    title: "在原文里查词，不打断阅读的气。",
    text: "阅读外刊、短文或考试材料时，光标点击单词即可弹出释义、音标和用法信息。单词卡贴近文字出现，让理解停留在上下文里。",
    action: "进入精读",
    to: "/article/article-main",
    theme: "reading-feature",
  },
  {
    label: "单词记忆",
    title: "把今天遇到的词，安排到明天还能想起的位置。",
    text: "复习不再只是单词表。系统会围绕熟悉度、复习节奏和学习记录，提醒你重新辨认、回忆和使用真正见过的词。",
    action: "开始记忆",
    to: "/word/word-main",
    theme: "memory-feature",
  },
  {
    label: "翻译工作台",
    title: "一句话翻顺，理解力也会变清楚。",
    text: "适合处理长句、段落、学习笔记和文档。你可以比较中文思路和英文表达之间的差异，找到更自然的说法。",
    action: "打开翻译",
    to: "/translation/translation-text",
    theme: "translation-feature",
  },
  {
    label: "写作批改",
    title: "让草稿被看见，也让问题被讲清楚。",
    text: "从语法、用词、句间衔接和段落逻辑给出修改线索，让每次批改都变成下一次写作能带走的经验。",
    action: "查看批改",
    to: "/writing/writing-main",
    theme: "writing-feature",
  },
];

const principles = [
  {
    title: "语境优先",
    text: "先从文章进入真实表达，再处理单词和句子，而不是孤立背诵。",
  },
  {
    title: "复习可见",
    text: "把学习状态放在每天能看到的位置，让下一步很明确。",
  },
  {
    title: "输出导向",
    text: "翻译和写作不是附加功能，而是检验你是否真正会用。",
  },
];

const isLogin = computed(() => {
  const user = loginUserStore.loginUser || {};
  const userName = String(user.userName || "");
  const isGuestName =
    !userName ||
    userName === "未登录" ||
    userName.includes("未登录") ||
    userName.includes("鏈");

  return Boolean(
    user.id || user.userAccount || user.userAvatar || !isGuestName,
  );
});

function redirectLoggedUser() {
  if (isLogin.value) {
    router.replace("/home");
  }
}

function initRevealMotion() {
  if (!import.meta.client) {
    return;
  }

  const revealElements = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

onMounted(() => {
  redirectLoggedUser();
  initRevealMotion();
});

onBeforeUnmount(() => {
  revealObserver?.disconnect();
});
</script>

<style scoped>
.intro-page {
  --paper: #fbfbfa;
  --surface: #ffffff;
  --surface-soft: #f7f7f4;
  --ink: var(--color-text-primary, #282828);
  --muted: #6e6a63;
  --quiet: #9a968e;
  --rule: #e7e4dc;
  --accent: #4f6657;
  --accent-soft: #edf3ec;
  --serif: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC",
    "Times New Roman", serif;
  --sans: "SF Pro Display", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC",
    "Source Han Sans SC", system-ui, sans-serif;

  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
}

.intro-page::before {
  position: fixed;
  inset: 0;
  pointer-events: none;
  content: "";
  background-image: linear-gradient(
      rgba(40, 40, 40, 0.028) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(40, 40, 40, 0.024) 1px, transparent 1px);
  background-size: 6rem 6rem;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}

.intro-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(11rem, 1fr) auto minmax(12rem, 1fr);
  align-items: center;
  min-height: 4.5rem;
  gap: 1.5rem;
  padding: 0 2rem;
  border-bottom: 1px solid var(--rule);
  background: rgba(251, 251, 250, 0.92);
  backdrop-filter: blur(18px);
}

.brand,
.nav-links a,
.ghost-link,
.solid-link,
.primary-action,
.secondary-action,
.feature-copy a {
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
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.brand strong {
  font-family: var(--serif);
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-links,
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  color: var(--muted);
  font-size: 0.92rem;
}

.nav-links a {
  transition: color 180ms ease;
}

.nav-links a:hover {
  color: var(--ink);
}

.nav-actions {
  justify-self: end;
}

.ghost-link,
.solid-link,
.primary-action,
.secondary-action,
.feature-copy a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.55rem;
  border: 1px solid var(--ink);
  border-radius: 6px;
  padding: 0 1rem;
  font-size: 0.92rem;
  line-height: 1;
  transition: background-color 180ms ease, border-color 180ms ease,
    color 180ms ease, transform 180ms ease;
}

.solid-link,
.primary-action {
  background: var(--ink);
  color: var(--paper);
}

.ghost-link,
.secondary-action {
  border-color: var(--rule);
  background: transparent;
}

.primary-action:hover,
.secondary-action:hover,
.solid-link:hover,
.ghost-link:hover,
.feature-copy a:hover {
  transform: translateY(-2px);
}

.primary-action:active,
.secondary-action:active,
.solid-link:active,
.ghost-link:active,
.feature-copy a:active {
  transform: scale(0.98);
}

.intro-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 1480px);
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.hero-section {
  display: grid;
  align-content: center;
  min-height: calc(100dvh - 4.5rem);
  padding: clamp(3rem, 7vw, 6rem) 0 clamp(4rem, 8vw, 7rem);
}

.hero-kicker {
  width: fit-content;
  border-bottom: 1px solid var(--ink);
  padding-bottom: 0.45rem;
  color: var(--accent);
  font-size: clamp(0.9rem, 1vw, 1rem);
}

.brand-mark {
  display: flex;
  align-items: baseline;
  gap: clamp(0.8rem, 2vw, 1.7rem);
  margin: clamp(1.2rem, 3vw, 2rem) 0 0;
}

.brand-mark span {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(5.2rem, 17vw, 16.5rem);
  font-weight: 700;
  letter-spacing: -0.08em;
  line-height: 0.78;
}

.brand-mark strong {
  font-family: var(--serif);
  font-size: clamp(2.2rem, 6vw, 7rem);
  font-weight: 400;
  line-height: 1;
}

.hero-copy {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.48fr);
  gap: clamp(2rem, 5vw, 6rem);
  align-items: end;
  margin-top: clamp(2.2rem, 5vw, 4rem);
  border-top: 1px solid var(--ink);
  padding-top: clamp(1.4rem, 3vw, 2.4rem);
}

.hero-copy h1 {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(3.2rem, 8vw, 8.5rem);
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: -0.05em;
}

.typing-text {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
}

.typing-text span {
  opacity: 0;
  transform: translateY(0.28em);
  animation: type-in 360ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--i) * 90ms + 260ms);
}

.hero-copy p {
  max-width: 43rem;
  margin: 0;
  color: var(--muted);
  font-size: clamp(1rem, 1.25vw, 1.16rem);
  line-height: 1.95;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.7rem;
}

.section-heading {
  display: grid;
  gap: 0.9rem;
  max-width: 70rem;
}

.section-heading span,
.feature-section-heading span,
.principle-statement span,
.cta-section > span,
.feature-copy span {
  color: var(--accent);
  font-size: 0.9rem;
}

.section-heading h2,
.feature-section-heading h2,
.principle-statement h2,
.cta-section h2 {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2.5rem, 5.8vw, 6.2rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.045em;
}

.method-section,
.principle-section,
.cta-section {
  border-top: 1px solid var(--ink);
  padding: clamp(4rem, 8vw, 7rem) 0;
}

.loop-board {
  display: grid;
  grid-template-columns: 1.05fr 0.92fr 1.18fr 0.85fr;
  gap: 1px;
  margin-top: clamp(2rem, 5vw, 4rem);
  border: 1px solid var(--rule);
  background: var(--rule);
}

.loop-board article {
  min-height: 17rem;
  padding: clamp(1.2rem, 2vw, 1.8rem);
  background: var(--surface);
  animation: lift-in 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--index) * 90ms);
}

.loop-board small {
  display: block;
  color: var(--quiet);
  font-family: "SF Mono", "JetBrains Mono", Consolas, monospace;
  font-size: 0.75rem;
}

.loop-board h3 {
  margin: clamp(3rem, 6vw, 5rem) 0 0.8rem;
  font-family: var(--serif);
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 400;
}

.loop-board p,
.feature-copy p,
.principle-list p,
.cta-section p {
  margin: 0;
  color: var(--muted);
  line-height: 1.82;
}

.feature-section {
  display: grid;
  gap: clamp(2.2rem, 5vw, 4rem);
  border-top: 1px solid var(--ink);
  padding: clamp(4rem, 8vw, 7rem) 0;
  background: transparent;
}

.feature-section-heading {
  display: grid;
  max-width: 72rem;
  gap: 1rem;
}

.feature-section-heading p {
  max-width: 42rem;
  margin: 0;
  color: var(--muted);
  line-height: 1.82;
}

.feature-list {
  display: grid;
  gap: 1px;
  border: 1px solid var(--rule);
  background: var(--rule);
}

.feature-row {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(22rem, 0.8fr);
  gap: clamp(2rem, 5vw, 6rem);
  align-items: stretch;
  min-height: 31rem;
  padding: clamp(1.4rem, 3vw, 2.4rem);
  background: var(--paper);
}

.feature-row:nth-child(even) {
  grid-template-columns: minmax(22rem, 0.8fr) minmax(0, 0.9fr);
}

.feature-row:nth-child(even) .feature-copy {
  grid-column: 2;
}

.feature-row:nth-child(even) .feature-proof {
  grid-column: 1;
  grid-row: 1;
}

.feature-copy {
  display: grid;
  align-content: space-between;
  justify-items: start;
  gap: 1.5rem;
}

.feature-copy h2 {
  max-width: 48rem;
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2.3rem, 4.8vw, 5.3rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.045em;
}

.feature-copy p {
  max-width: 43rem;
  font-size: 1rem;
}

.feature-copy a {
  border-color: var(--ink);
}

.feature-proof {
  position: relative;
  display: grid;
  min-height: 23rem;
  align-content: center;
  border: 1px solid var(--rule);
  background: var(--surface);
  padding: clamp(1.2rem, 3vw, 2.4rem);
  overflow: hidden;
}

.feature-proof::before {
  position: absolute;
  inset: 1.2rem;
  content: "";
  border: 1px solid rgba(40, 40, 40, 0.055);
  pointer-events: none;
}

.article-line {
  max-width: 24rem;
  color: var(--muted);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.65rem, 3vw, 3rem);
  line-height: 1.24;
}

.article-line .demo-word {
  position: relative;
  display: inline-block;
  isolation: isolate;
  color: var(--ink);
}

.article-line .demo-word::after {
  position: absolute;
  right: -0.04em;
  bottom: 0.04em;
  left: -0.04em;
  z-index: -1;
  height: 0.44em;
  content: "";
  background: var(--accent-soft);
}

.cursor-tap {
  position: absolute;
  right: -0.38rem;
  bottom: 0.16em;
  width: 0.9rem;
  height: 0.9rem;
  border: 1px solid var(--ink);
  border-radius: 50%;
  background: var(--surface);
  animation: cursor-tap 3.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.floating-word-card {
  position: absolute;
  right: clamp(1.5rem, 4vw, 3rem);
  bottom: clamp(1.5rem, 4vw, 3rem);
  display: grid;
  gap: 0.3rem;
  width: min(15rem, calc(100% - 3rem));
  border: 1px solid var(--ink);
  background: var(--surface);
  padding: 1rem;
  animation: card-reveal 3.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.floating-word-card strong {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.65rem;
  font-weight: 400;
}

.floating-word-card small,
.floating-word-card em {
  color: var(--muted);
  font-style: normal;
}

.memory-stack {
  display: grid;
  gap: 0.7rem;
  width: min(23rem, 100%);
}

.memory-stack span {
  border-bottom: 1px solid var(--rule);
  padding: 0.85rem 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.6rem, 3vw, 2.8rem);
}

.review-ring {
  position: absolute;
  right: clamp(1.5rem, 4vw, 3rem);
  top: clamp(1.5rem, 4vw, 3rem);
  display: grid;
  width: 6.2rem;
  height: 6.2rem;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(var(--accent) 0 68%, var(--rule) 68% 100%);
}

.review-ring span {
  display: grid;
  width: 4.7rem;
  height: 4.7rem;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
  font-family: Georgia, "Times New Roman", serif;
}

.translation-pair {
  display: grid;
  gap: 1px;
  border: 1px solid var(--rule);
  background: var(--rule);
}

.translation-pair p {
  margin: 0;
  background: var(--surface);
  padding: clamp(1.1rem, 3vw, 2rem);
  font-family: var(--serif);
  font-size: clamp(1.65rem, 3vw, 3.2rem);
  line-height: 1.22;
}

.translation-pair p + p {
  font-family: Georgia, "Times New Roman", serif;
  color: var(--accent);
}

.manuscript-demo {
  display: grid;
  gap: 1.2rem;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.2rem, 2.2vw, 2.2rem);
  line-height: 1.62;
}

.manuscript-demo p {
  margin: 0;
}

.strike {
  position: relative;
  color: rgba(40, 40, 40, 0.52);
}

.strike::after {
  position: absolute;
  right: -0.08rem;
  bottom: 0.48em;
  left: -0.08rem;
  height: 2px;
  content: "";
  background: var(--accent);
  transform: rotate(-4deg);
}

.highlight {
  background: var(--accent-soft);
}

.wave {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 1.5px;
}

.manuscript-demo div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.5rem;
  font-family: var(--sans);
  font-size: 0.9rem;
}

.manuscript-demo div span {
  border: 1px solid var(--rule);
  background: var(--surface-soft);
  padding: 0.5rem 0.65rem;
  color: var(--accent);
}

.principle-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(24rem, 0.75fr);
  gap: clamp(2rem, 7vw, 8rem);
  align-items: start;
}

.principle-list {
  display: grid;
  border-top: 1px solid var(--rule);
}

.principle-list article {
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--rule);
}

.principle-list h3 {
  margin: 0 0 0.45rem;
  font-family: var(--serif);
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 400;
}

.cta-section {
  display: grid;
  justify-items: start;
  gap: 1rem;
  padding-bottom: 7rem;
}

.cta-section h2 {
  max-width: 65rem;
}

.cta-section p {
  max-width: 44rem;
  font-size: 1rem;
}

[data-reveal] {
  opacity: 0;
  transform: translateY(18px);
}

[data-reveal].is-visible {
  animation: reveal-up 760ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes type-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes reveal-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes lift-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cursor-tap {
  0%,
  24% {
    opacity: 0;
    transform: translate(1.2rem, 0.75rem) scale(0.76);
  }

  36%,
  54% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }

  64%,
  100% {
    opacity: 0;
    transform: translate(0, 0) scale(0.7);
  }
}

@keyframes card-reveal {
  0%,
  48% {
    opacity: 0;
    transform: translateY(0.9rem);
  }

  62%,
  86% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-0.4rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }

  [data-reveal] {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 1180px) {
  .intro-nav {
    grid-template-columns: 1fr auto;
  }

  .nav-links {
    display: none;
  }

  .hero-copy,
  .feature-row,
  .feature-row:nth-child(even),
  .principle-section {
    grid-template-columns: 1fr;
  }

  .feature-row:nth-child(even) .feature-copy,
  .feature-row:nth-child(even) .feature-proof {
    grid-column: auto;
    grid-row: auto;
  }

  .loop-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .intro-nav {
    min-height: 4rem;
    padding: 0 1rem;
  }

  .nav-actions {
    gap: 0.5rem;
  }

  .ghost-link {
    display: none;
  }

  .solid-link,
  .primary-action,
  .secondary-action {
    min-height: 2.45rem;
    padding: 0 0.8rem;
  }

  .intro-shell {
    padding: 0 1rem 3rem;
  }

  .hero-section {
    min-height: calc(100dvh - 4rem);
    padding: 2.4rem 0 4rem;
  }

  .brand-mark {
    display: grid;
    gap: 0.7rem;
  }

  .brand-mark span {
    font-size: clamp(4rem, 25vw, 7.4rem);
  }

  .brand-mark strong {
    font-size: clamp(2rem, 14vw, 3.8rem);
  }

  .hero-copy h1 {
    font-size: clamp(3rem, 14vw, 5rem);
  }

  .loop-board {
    grid-template-columns: 1fr;
  }

  .loop-board article {
    min-height: 12rem;
  }

  .loop-board h3 {
    margin-top: 2.5rem;
  }

  .feature-row {
    min-height: auto;
    padding: 1rem;
  }

  .feature-proof {
    min-height: 18rem;
  }

  .feature-copy h2,
  .section-heading h2,
  .principle-statement h2,
  .cta-section h2 {
    letter-spacing: -0.035em;
  }

  .floating-word-card,
  .review-ring {
    position: relative;
    right: auto;
    bottom: auto;
    top: auto;
    margin-top: 1.2rem;
  }

  .cursor-tap {
    right: -0.32rem;
    bottom: 0.12em;
  }
}
</style>
