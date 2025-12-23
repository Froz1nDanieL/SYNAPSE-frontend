<template>
  <div class="container">
    <UserIcon v-if="!isLogin" class="user-icon-position" @click="goToLogin" />
    <UserAvatar
      v-else
      :user="loginUserStore.loginUser"
      class="user-icon-position"
      @click="goToLogin"
    />
    <main class="main">
      <h1 class="title">SYNAPSE</h1>
      <p class="subtitle">你的英语学习港湾</p>
      <div class="button-group">
        <LineButtom title="背单词" @click="goToWordMemory" />
        <LineButtom title="文章阅读" @click="goToArticleReading" />
        <LineButtom title="英汉互译" @click="goToTranslation" />
        <LineButtom title="写作批改" @click="goToWritingCorrection" />
      </div>
    </main>

    <!-- 新增功能介绍板块 -->
    <div class="features-container">
      <!-- 背单词板块 -->
      <div class="feature-section word-memory">
        <div class="feature-content">
          <div class="feature-text">
            <span class="section-tag">科学记忆</span>
            <h2>背单词</h2>
            <p class="feature-description">
              个性化定制单词复习计划，确保每个单词都能牢牢记住。通过科学的记忆方法，让背单词不再是痛苦的经历。
            </p>
            <ul class="feature-highlights">
              <li>个性化词库推荐，贴合你的学习目标</li>
              <li>多种记忆模式，适应不同学习习惯</li>
            </ul>
            <div class="stats-container">
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

      <!-- 文章阅读板块 -->
      <div class="feature-section article-reading">
        <div class="feature-content">
          <div class="feature-image">
            <div class="placeholder-image">文章阅读示意图</div>
          </div>
          <div class="feature-text">
            <h2>文章阅读</h2>
            <p class="feature-description">
              精选外刊、新闻、故事等优质英文内容，涵盖科技、文化、经济等多个领域，全面提升你的阅读理解能力和词汇量。
            </p>
            <ul class="feature-highlights">
              <li>实时更新的热门英文资讯</li>
              <li>分级阅读，适合不同水平学习者</li>
              <li>生词即时标注与翻译</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 英汉互译板块 -->
      <div class="feature-section translation">
        <div class="feature-content">
          <div class="feature-text">
            <h2>英汉互译</h2>
            <p class="feature-description">
              强大的双语翻译引擎，支持句子、段落翻译，准确处理各类语境下的语言转换。无论是学术文献还是日常对话，都能提供高质量翻译结果。
            </p>
            <ul class="feature-highlights">
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

      <!-- 写作批改板块 -->
      <div class="feature-section writing-correction">
        <div class="feature-content">
          <div class="feature-image">
            <div class="placeholder-image">写作批改示意图</div>
          </div>
          <div class="feature-text">
            <h2>写作批改</h2>
            <p class="feature-description">
              AI智能批改系统，从语法、词汇、句式等多个维度分析英语作文并提供详细的改进建议，帮助你快速提升英文写作水平。
            </p>
            <ul class="feature-highlights">
              <li>全方位错误检测与纠正</li>
              <li>个性化写作建议和评分</li>
              <li>范文对比，明确改进方向</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLoginUserStore } from "~/stores/userLoginUserStore";
import UserAvatar from "~/components/UserAvatar.vue";

definePageMeta({
  layout: false, // 首页不使用布局
});

const router = useRouter();
const loginUserStore = useLoginUserStore();

// 判断是否登录（简单判断用户名不为"未登录"）
const isLogin = computed(() => {
  return loginUserStore.loginUser.userName !== "未登录";
});

function goToLogin() {
  if (isLogin.value) {
    // 如果已经登录，跳转到个人资料页面
    router.push("/user/profile");
  } else {
    router.push("/user/login");
  }
}

function goToWordMemory() {
  router.push("/word/word-memory");
}

function goToArticleReading() {
  router.push("/article-reading");
}

function goToTranslation() {
  router.push("/translation");
}

function goToWritingCorrection() {
  router.push("/writing-correction");
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: auto;
  background-color: #f6f6f6;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  flex-direction: column;
}

.user-icon-position {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
}

.main {
  text-align: center;
  padding: 2rem;
  box-sizing: border-box;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  width: 100%;
}

.title {
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #000076;
  font-family: "Noto Sans SC", sans-serif;
  z-index: 2;
  position: relative;
}

.subtitle {
  font-size: 1.8rem;
  color: #666;
  margin-bottom: 3rem;
  font-weight: 300;
  z-index: 2;
  position: relative;
}

.button-group {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  z-index: 2;
  position: relative;
}
/* 新增功能介绍板块样式 */
.features-container {
  width: 100%;
}

.feature-section {
  padding: 4rem 2rem;
  width: 100%;
  min-height: 60vh;
}

.word-memory {
  background-color: #f6f6f6; /* 使用指定的背景色 */
  color: #333;
}

.article-reading {
  background-color: #f6f6f6;
}

.translation {
  background-color: #f6f6f6;
}

.writing-correction {
  background-color: #f6f6f6;
}

.feature-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 3rem;
  min-height: 400px;
}

.feature-text {
  flex: 1;
}

.section-tag {
  display: inline-block;
  background: rgba(0, 0, 118, 0.1); /* 使用主色调的透明版本 */
  color: #000076; /* 主要文字色 */
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.8s ease-out;
}

.feature-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: #000076; /* 标题色 */
  animation: slideInLeft 0.8s ease-out;
}

.article-reading .feature-text h2,
.translation .feature-text h2,
.writing-correction .feature-text h2 {
  color: #000033;
}

.feature-description {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: #555;
  animation: fadeIn 1s ease-out;
}

.feature-highlights {
  list-style-type: none;
  padding: 0;
  margin-bottom: 2rem;
}

.feature-highlights li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.8rem;
  color: #444;
  animation: slideInRight 0.5s ease-out;
  animation-fill-mode: both;
}

.feature-highlights li:nth-child(1) {
  animation-delay: 0.1s;
}

.feature-highlights li:nth-child(2) {
  animation-delay: 0.2s;
}

.feature-highlights li:nth-child(3) {
  animation-delay: 0.3s;
}

.feature-highlights li:before {
  content: "✓";
  color: #000076; /* 主要强调色 */
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* 背单词板块特有样式 */
.stats-container {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: zoomIn 0.5s ease-out;
  animation-fill-mode: both;
}

.stat-item:nth-child(1) {
  animation-delay: 0.4s;
}

.stat-item:nth-child(2) {
  animation-delay: 0.5s;
}

.stat-item:nth-child(3) {
  animation-delay: 0.6s;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000076; /* 主要数字色 */
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.feature-visual {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-container {
  height: 300px;
  width: 100%;
  animation: fadeIn 1.2s ease-out;
}

.feature-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-image {
  width: 100%;
  height: 300px;
  background-color: #ddd;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-size: 1.2rem;
}

/* 特殊板块交替布局 */
.article-reading .feature-content,
.writing-correction .feature-content {
  flex-direction: row-reverse;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes progressFill {
  from {
    width: 0;
  }
  to {
    width: 60%;
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 80%;
  }

  .feature-content {
    flex-direction: column !important;
  }

  .feature-section {
    padding: 3rem 1.5rem;
    min-height: auto;
  }

  .feature-text h2 {
    font-size: 2rem;
  }

  .stats-container {
    flex-direction: column;
    gap: 1rem;
  }

  .placeholder-image {
    height: 250px;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
