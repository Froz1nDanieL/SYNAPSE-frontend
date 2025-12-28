<template>
  <div class="container">
    <nav class="nav">
      <div class="nav-content">
        <div class="nav-logo">SYNAPSE</div>
        <div class="nav-user" @click="goToLogin">
          <UserIcon v-if="!isLogin" class="user-icon" />
          <UserAvatar
            v-else
            :user="loginUserStore.loginUser"
            class="user-avatar"
          />
        </div>
      </div>
    </nav>

    <header class="hero">
      <div class="hero-decoration">
        <div class="decoration-circle decoration-circle--1"></div>
        <div class="decoration-circle decoration-circle--2"></div>
        <div class="decoration-circle decoration-circle--3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="hero-tag">ENGLISH LEARNING PLATFORM</p>
          <h1 class="hero-title">
            <span class="title-line">SYN</span>
            <span class="title-line title-line--accent">APSE</span>
          </h1>
          <p class="hero-subtitle">你的英语学习港湾</p>
        </div>
        <div class="hero-actions">
          <div class="action-primary">
            <GoToButtom title="背单词" to="/word/word-memory" />
            <GoToButtom title="文章阅读" to="/article/article-main" />
          </div>
          <div class="action-secondary">
            <GoToButtom title="英汉互译" to="/translation" />
            <GoToButtom title="写作批改" to="/writing-correction" />
          </div>
        </div>
      </div>
      <div class="hero-scroll">
        <span class="scroll-text">Scroll</span>
        <div class="scroll-line"></div>
      </div>
    </header>

    <section class="features">
      <div class="feature-section word-memory">
        <div class="feature-container">
          <div class="feature-content">
            <div class="feature-visual">
              <span class="feature-tag">科学记忆</span>
              <h2 class="feature-title">背单词</h2>
              <p class="feature-description">
                个性化定制单词复习计划，确保每个单词都能牢牢记住。通过科学的记忆方法，让背单词不再是痛苦的经历。
              </p>
              <ul class="feature-list">
                <li>个性化词库推荐，贴合你的学习目标</li>
                <li>多种记忆模式，适应不同学习习惯</li>
              </ul>
              <div class="feature-stats">
                <div class="stat-item">
                  <span class="stat-number">95%</span>
                  <span class="stat-label">记忆保持率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">3x</span>
                  <span class="stat-label">学习效率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">10000+</span>
                  <span class="stat-label">词库容量</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-section article-reading">
        <div class="feature-container">
          <div class="feature-content feature-content--reverse">
            <div class="feature-visual">
              <h2 class="feature-title">文章阅读</h2>
              <p class="feature-description">
                精选外刊、新闻、故事等优质英文内容，涵盖科技、文化、经济等多个领域，全面提升你的阅读理解能力和词汇量。
              </p>
              <ul class="feature-list">
                <li>实时更新的热门英文资讯</li>
                <li>分级阅读，适合不同水平学习者</li>
                <li>生词即时标注与翻译</li>
              </ul>
            </div>
            <div class="feature-image">
              <ArticleReadingDemo />
            </div>
          </div>
        </div>
      </div>

      <div class="feature-section translation">
        <div class="feature-container">
          <div class="feature-content">
            <div class="feature-visual">
              <h2 class="feature-title">英汉互译</h2>
              <p class="feature-description">
                强大的双语翻译引擎，支持句子、段落翻译，准确处理各类语境下的语言转换。无论是学术文献还是日常对话，都能提供高质量翻译结果。
              </p>
              <ul class="feature-list">
                <li>上下文语境识别，提高翻译准确性</li>
                <li>专业术语库，覆盖各行业领域</li>
                <li>语音输入输出，便捷的口语翻译</li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="placeholder-image">翻译功能示意图</div>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-section writing-correction">
        <div class="feature-container">
          <div class="feature-content feature-content--reverse">
            <div class="feature-visual">
              <h2 class="feature-title">写作批改</h2>
              <p class="feature-description">
                AI智能批改系统，从语法、词汇、句式等多个维度分析英语作文并提供详细的改进建议，帮助你快速提升英文写作水平。
              </p>
              <ul class="feature-list">
                <li>全方位错误检测与纠正</li>
                <li>个性化写作建议和评分</li>
                <li>范文对比，明确改进方向</li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="placeholder-image">写作批改示意图</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useLoginUserStore } from "~/stores/userLoginUserStore";

definePageMeta({
  layout: false,
});

const router = useRouter();
const loginUserStore = useLoginUserStore();

const isLogin = computed(() => {
  return loginUserStore.loginUser.userName !== "未登录";
});

function goToLogin() {
  if (isLogin.value) {
    router.push("/user/profile");
  } else {
    router.push("/user/login");
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f1efe9;
  overflow-x: hidden;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  padding: 1.5rem 3rem;
  transition: background-color 0.3s ease;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #282828;
  letter-spacing: 2px;
}

.nav-user {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.nav-user:hover {
  opacity: 0.8;
}

.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.decoration-circle--1 {
  width: 600px;
  height: 600px;
  background: #282828;
  top: -200px;
  right: -150px;
  animation: float 20s ease-in-out infinite;
}

.decoration-circle--2 {
  width: 400px;
  height: 400px;
  background: #282828;
  bottom: -100px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

.decoration-circle--3 {
  width: 250px;
  height: 250px;
  background: #282828;
  top: 50%;
  left: 10%;
  animation: float 12s ease-in-out infinite 2s;
}

.hero-content {
  text-align: center;
  padding: 2rem;
  max-width: 1200px;
  z-index: 1;
  animation: fadeInUp 1s ease-out;
}

.hero-text {
  margin-bottom: 4rem;
}

.hero-tag {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 4px;
  color: #282828;
  opacity: 0.6;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.hero-title {
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 900;
  margin-bottom: 1.5rem;
  color: #282828;
  letter-spacing: -0.02em;
  line-height: 0.95;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.title-line {
  display: block;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-line--accent {
  color: #282828;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 2rem);
  color: #282828;
  margin-bottom: 0;
  font-weight: 300;
  opacity: 0.7;
  letter-spacing: 0.02em;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.action-primary,
.action-secondary {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-scroll {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
  animation: fadeIn 1.5s ease-out 1s both;
}

.scroll-text {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: #282828;
  opacity: 0.5;
  text-transform: uppercase;
}

.scroll-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, #282828, transparent);
  animation: scrollDown 2s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -20px) scale(1.02);
  }
  50% {
    transform: translate(-10px, 10px) scale(0.98);
  }
  75% {
    transform: translate(-20px, -10px) scale(1.01);
  }
}

@keyframes scrollDown {
  0% {
    transform: scaleY(0);
    transform-origin: top;
  }
  50% {
    transform: scaleY(1);
    transform-origin: top;
  }
  51% {
    transform: scaleY(1);
    transform-origin: bottom;
  }
  100% {
    transform: scaleY(0);
    transform-origin: bottom;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.features {
  width: 100%;
}

.feature-section {
  padding: 8rem 2rem;
  width: 100%;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.feature-section:nth-child(even) {
  background-color: #f1efe9;
}

.feature-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.feature-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  min-height: 500px;
}

.feature-content--reverse {
  flex-direction: row-reverse;
}

.feature-visual {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-image {
  width: 100%;
  height: 400px;
  background-color: #e2ded1;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #282828;
  font-size: 1.25rem;
  font-weight: 500;
}

.feature-tag {
  display: inline-block;
  background-color: #e2ded1;
  color: #282828;
  padding: 0.5rem 1.25rem;
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.feature-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: #282828;
  line-height: 1.2;
  margin: 0;
}

.feature-description {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #282828;
  opacity: 0.85;
  margin: 0;
}

.feature-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.75rem;
  color: #282828;
  font-size: 1rem;
  line-height: 1.6;
}

.feature-list li:before {
  content: "✓";
  color: #282828;
  position: absolute;
  left: 0;
  font-weight: bold;
  font-size: 1.125rem;
}

.feature-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: #e2ded1;
  border-radius: 12px;
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #282828;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #282828;
  opacity: 0.8;
  margin-top: 0.5rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .hero-title {
    font-size: clamp(3.5rem, 10vw, 6rem);
  }

  .decoration-circle--1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -80px;
  }

  .decoration-circle--2 {
    width: 300px;
    height: 300px;
    bottom: -80px;
    left: -80px;
  }

  .decoration-circle--3 {
    width: 200px;
    height: 200px;
    left: 5%;
  }

  .feature-content {
    flex-direction: column !important;
    gap: 3rem;
  }

  .feature-stats {
    flex-wrap: wrap;
    justify-content: center;
  }

  .stat-item {
    flex: 1;
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .nav {
    padding: 0.5rem 1rem;
  }

  .nav-logo {
    font-size: 1.125rem;
  }

  .hero-content {
    padding: 1.5rem;
  }

  .hero-tag {
    font-size: 0.75rem;
    letter-spacing: 3px;
  }

  .hero-title {
    font-size: clamp(2.5rem, 15vw, 4rem);
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-actions {
    gap: 1.25rem;
  }

  .action-primary,
  .action-secondary {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .hero-scroll {
    bottom: 2rem;
  }

  .scroll-line {
    height: 40px;
  }

  .feature-section {
    padding: 5rem 1.5rem;
    min-height: auto;
  }

  .feature-stats {
    gap: 1rem;
  }

  .stat-item {
    padding: 1rem;
    min-width: 80px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .placeholder-image {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: clamp(2rem, 18vw, 3rem);
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-tag {
    font-size: 0.625rem;
    letter-spacing: 2px;
  }

  .feature-title {
    font-size: 1.75rem;
  }

  .feature-description {
    font-size: 1rem;
  }

  .decoration-circle--1 {
    width: 300px;
    height: 300px;
    top: -80px;
    right: -60px;
  }

  .decoration-circle--2 {
    width: 200px;
    height: 200px;
    bottom: -60px;
    left: -60px;
  }

  .decoration-circle--3 {
    width: 150px;
    height: 150px;
  }
}
</style>
