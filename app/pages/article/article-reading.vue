<template>
  <div class="article-reading-container">
    <header class="article-header">
      <button class="back-button" @click="goBack">&lt; 返回</button>
    </header>

    <main class="article-content-wrapper">
      <article class="article-main">
        <h1 class="article-title">{{ article.title }}</h1>

        <div class="article-meta">
          <span class="article-category">{{ article.category }}</span>
          <span class="article-date">{{
            formatDate(article.publishTime)
          }}</span>
          <span class="article-source"
            >来源: {{ article.source || "未知" }}</span
          >
          <span class="article-views"
            >阅读量: {{ article.viewCount || 0 }}</span
          >
        </div>

        <div class="article-body" v-html="processedContent"></div>

        <!-- 单词翻译卡片 -->
        <div
          v-if="showTranslation && wordTranslation"
          class="word-trans-card-wrapper"
          :style="{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
          }"
        >
          <WordTransCard :wordData="wordTranslation" />
        </div>
      </article>
    </main>

    <footer class="article-footer">
      <div class="related-articles">
        <h2 class="related-title">相关文章</h2>
        <div class="related-list">
          <div
            v-for="related in relatedArticles"
            :key="related.id"
            class="related-item"
            @click="goToArticle(related.id)"
          >
            <h3 class="related-item-title">{{ related.title }}</h3>
            <p class="related-item-date">
              {{ formatDate(related.publishTime) }}
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getArticleById } from "~/composables/api/articleController";
import { translateWord } from "~/composables/api/engdictController";
import WordTransCard from "~/components/WordTransCard.vue";

// 路由
const router = useRouter();
const route = useRoute();

// 文章数据
const article = ref({
  title: "",
  content: "",
  category: "",
  publishTime: "",
  source: "",
  viewCount: 0,
});

// 相关文章
const relatedArticles = ref([]);

// 翻译功能相关
const selectedWord = ref("");
const wordTranslation = ref(null);
const showTranslation = ref(false);
const cardPosition = ref({ x: 0, y: 0 });
const processedContent = ref("");

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };

  return date.toLocaleDateString("en-US", options);
}

// 转换文章内容格式，将单词转换为可点击元素
function formatArticleContent(content) {
  if (!content) return "";

  // 统一换行符格式，将Windows风格的\r\n转换为\n
  const normalizedContent = content.replace(/\r\n/g, "\n");

  // 处理空一行的情况，转换为HTML段落
  // 支持多个连续空行的情况
  return normalizedContent
    .split(/\n{2,}/) // 按两个或更多换行符分割段落
    .map((paragraph) => paragraph.trim()) // 去除每个段落的前后空白
    .filter((paragraph) => paragraph) // 过滤掉空段落
    .map((paragraph) => {
      // 将段落中的单词转换为可点击的span元素
      // 使用更严格的正则表达式来分割单词，只匹配字母
      const processedParagraph = paragraph.replace(/([a-zA-Z]+)/g, (match) => {
        // 确保只匹配纯字母的单词，并将其包装为clickable-word元素，添加内联样式确保cursor显示
        return `<span class="clickable-word" data-word="${match}" style="cursor: pointer; display: inline-block;">${match}</span>`;
      });
      return `<p>${processedParagraph}</p>`;
    })
    .join("\n<br>\n"); // 合并所有段落，之间添加一个换行符和一个<br>标签
}

// 获取文章详情
async function fetchArticle() {
  try {
    const articleId = route.query.id;
    if (!articleId) {
      console.error("文章ID不存在");
      return;
    }

    const response = await getArticleById({
      id: Number(articleId),
    });

    if (response.data.code === 0 && response.data.data) {
      const fetchedArticle = response.data.data;
      // 转换文章内容格式
      fetchedArticle.content = formatArticleContent(fetchedArticle.content);
      article.value = fetchedArticle;
      // 将处理后的内容赋值给processedContent，以便使用v-html渲染
      processedContent.value = fetchedArticle.content;
      // 可以在这里添加获取相关文章的逻辑
      // fetchRelatedArticles(article.value.category);
    }
  } catch (error) {
    console.error("获取文章详情失败:", error);
  }
}

// 获取相关文章
async function fetchRelatedArticles(category) {
  // 这里可以调用相关文章的API
  // 暂时使用模拟数据
  relatedArticles.value = [
    {
      id: 2,
      title: "Related Article Title 1",
      publishTime: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Related Article Title 2",
      publishTime: new Date().toISOString(),
    },
  ];
}

// 返回上一页
function goBack() {
  router.back();
}

// 跳转到其他文章
function goToArticle(articleId) {
  router.push(`/article/article-reading?id=${articleId}`);
}

// 处理单词点击事件，调用翻译API
async function handleWordClick(word, event) {
  event.stopPropagation(); // 阻止事件冒泡

  // 验证word参数，确保不是空字符串或只包含空白字符
  const trimmedWord = word?.trim();
  if (!trimmedWord) {
    console.error("Word is empty or null");
    return;
  }

  selectedWord.value = trimmedWord;

  try {
    console.log("Translating word:", trimmedWord);
    const response = await translateWord({ word: trimmedWord });
    console.log("Translation response:", response);
    if (response.data.code === 0 && response.data.data) {
      wordTranslation.value = response.data.data;

      // 计算翻译卡片的位置，使用fixed定位确保跟随视窗滚动
      const rect = event.target.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const cardWidth = 300;
      const cardHeight = 200;

      // 计算居中位置，稍微偏向页面中下部
      let x = (windowWidth - cardWidth) / 2;
      // 确保卡片不超出视窗左右边界
      x = Math.max(10, Math.min(x, windowWidth - cardWidth - 10));

      // 计算Y坐标：优先显示在单词下方10px处，但保持在视窗可见区域
      let y = rect.bottom + 10;
      // 如果卡片底部超出视窗，就显示在单词上方
      if (y + cardHeight > windowHeight) {
        y = rect.top - cardHeight - 10;
      }
      // 确保卡片在视窗可见区域内
      y = Math.max(10, Math.min(y, windowHeight - cardHeight - 10));

      cardPosition.value = { x, y };
      showTranslation.value = true;
    }
  } catch (error) {
    console.error("翻译失败:", error);
  }
}

// 点击页面其他区域关闭翻译卡片
function closeTranslation() {
  showTranslation.value = false;
}

// 处理文章内容点击事件（事件委托）
function handleArticleBodyClick(event) {
  const target = event.target;
  // 使用closest方法查找最近的clickable-word元素，提高代码健壮性
  const wordElement = target.closest(".clickable-word");
  if (wordElement) {
    event.stopPropagation();
    const word = wordElement.dataset.word;
    console.log("Clicked word:", word);
    console.log("Word element:", wordElement);
    console.log("Word element HTML:", wordElement.outerHTML);
    handleWordClick(word, event);
  }
}

// 页面加载时获取文章数据
onMounted(() => {
  fetchArticle();

  // 添加点击事件监听，点击页面其他区域关闭翻译卡片
  document.addEventListener("click", closeTranslation);

  // 使用事件委托处理单词点击
  const articleBody = document.querySelector(".article-body");
  if (articleBody) {
    articleBody.addEventListener("click", handleArticleBodyClick);
  }
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener("click", closeTranslation);

  // 移除事件委托监听器
  const articleBody = document.querySelector(".article-body");
  if (articleBody) {
    articleBody.removeEventListener("click", handleArticleBodyClick);
  }
});
</script>

<style scoped>
/* 全局样式 */
:root {
  --primary-color: #000000;
  --secondary-color: ##f6f6f6;
  --accent-color: #000076;
  --bg-color: #f6f6f6;
  --border-color: #e0e0e0;
  --hover-opacity: 0.9;
  --transition-speed: 0.2s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--primary-color);
  background-color: var(--bg-color);
}

/* 文章阅读容器 */
.article-reading-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
}

/* 头部 */
.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.back-button {
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.back-button:hover {
  opacity: var(--hover-opacity);
  border-color: var(--accent-color);
}

/* 文章内容包装器 */
.article-content-wrapper {
  margin-bottom: 3rem;
}

/* 文章主体 */
.article-main {
  position: relative;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: "Times New Roman", Times, serif;
  line-height: 1.3;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.article-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--primary-color);
}

.article-body p {
  margin-bottom: 1rem;
}

.article-body h2 {
  font-size: 1.8rem;
  font-weight: 400;
  margin: 2rem 0 1rem;
  color: var(--primary-color);
}

.article-body h3 {
  font-size: 1.5rem;
  font-weight: 400;
  margin: 1.5rem 0 0.75rem;
  color: var(--primary-color);
}

.article-body ul,
.article-body ol {
  margin: 1rem 0 1.5rem 2rem;
}

.article-body li {
  margin-bottom: 0.5rem;
}

/* 可点击单词样式 */
.article-body .clickable-word {
  cursor: pointer !important;
  color: #666666;
  position: relative;
  display: inline-block;
  transition: all 0.2s ease;
}

.article-body .clickable-word:hover {
  text-decoration: underline;
  background-color: rgba(102, 102, 102, 0.1);
  color: #333333;
  cursor: pointer !important;
}

/* 翻译卡片包装器 */
.word-trans-card-wrapper {
  position: fixed;
  z-index: 1000;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

/* 页脚 */
.article-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
}

.related-articles {
  margin-top: 2rem;
}

.related-title {
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  position: relative;
  padding-bottom: 0.5rem;
}

.related-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60px;
  height: 2px;
  background-color: var(--accent-color);
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.related-item {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  position: relative;
  overflow: hidden;
}

.related-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: var(--accent-color);
  transform: scaleY(0);
  transition: transform var(--transition-speed) ease;
}

.related-item:hover {
  opacity: var(--hover-opacity);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.related-item:hover::before {
  transform: scaleY(1);
}

.related-item-title {
  font-size: 1.1rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.related-item-date {
  font-size: 0.85rem;
  color: var(--secondary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-reading-container {
    padding: 1.5rem;
    margin: 1rem auto;
  }

  .article-title {
    font-size: 2rem;
  }

  .article-meta {
    gap: 1rem;
    font-size: 0.85rem;
  }

  .article-body {
    font-size: 1rem;
  }

  .related-list {
    grid-template-columns: 1fr;
  }

  .related-item {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .article-reading-container {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .back-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
