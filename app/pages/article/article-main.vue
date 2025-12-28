<template>
  <!-- 每日一句独立板块 -->
  <section class="daily-quote-section">
    <div class="daily-quote-container">
      <h2 class="quote-section-title">每日一句</h2>
      <div class="quote-content">
        <p class="quote-text">{{ dailyQuote.english }}</p>
        <p class="quote-translation">{{ dailyQuote.chinese }}</p>
        <p class="quote-author">{{ dailyQuote.author }}</p>
      </div>
    </div>
  </section>

  <!-- 精选文章板块 -->
  <div class="newsroom-container">
    <!-- 页面头部 -->
    <header class="newsroom-header">
      <h1 class="newsroom-title">精选文章</h1>
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['category-tab', { active: category.active }]"
        >
          {{ category.name }}
        </button>
      </div>
    </header>

    <!-- 文章网格 -->
    <main class="articles-grid">
      <article
        v-for="article in featuredArticles"
        :key="article.id"
        class="article-card"
        @click="goToArticle(article.id)"
      >
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-meta">
            <span class="article-category">{{ article.category }}</span>
            <span class="article-date">{{ article.date }}</span>
          </div>
        </div>
      </article>
    </main>

    <!-- 查看更多按钮 -->
    <div class="show-more-container">
      <ShowMore />
    </div>

    <!-- 页脚 -->
    <footer class="newsroom-footer">
      <div class="stay-connected">
        <h3>Stay connected to the future of LimeQ3</h3>
        <button class="subscribe-button">Subscribe</button>
      </div>
      <div class="footer-links">
        <div class="footer-column">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Newsroom</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Products</h4>
          <ul>
            <li>The Q</li>
            <li>KCP</li>
            <li>Insurance Data Station</li>
            <li>Global Jurisdiction</li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Resources</h4>
          <ul>
            <li>White Papers</li>
            <li>Case Studies</li>
            <li>Blog</li>
            <li>Support</li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Legal</h4>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Cookies</li>
            <li>Security</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { listArticleByPage } from "~/composables/api/articleController";

// 路由
const router = useRouter();

// 每日一句数据
const dailyQuote = {
  english: "The only way to do great work is to love what you do.",
  chinese: "成就伟业的唯一途径是热爱自己的事业。",
  author: "— Steve Jobs",
};

// 文章数据
const featuredArticles = ref([]);

// 分类数据
const categories = [
  { id: 1, name: "Press Releases", active: true },
  { id: 2, name: "Events" },
  { id: 3, name: "Industry" },
];

// 分页数据
const pagination = ref({
  current: 1,
  total: 0,
  size: 9,
});

// 从 content 中提取 summary
function extractSummary(content) {
  if (!content) return "";

  // 移除 HTML 标签
  const plainText = content.replace(/<[^>]*>/g, "");

  // 截取前 150 个字符，并确保在单词边界处截断
  if (plainText.length <= 100) return plainText;

  let summary = plainText.substring(0, 100);
  const lastSpaceIndex = summary.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    summary = summary.substring(0, lastSpaceIndex);
  }

  return summary + "...";
}

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

// 获取文章列表
async function fetchArticles() {
  try {
    console.log("开始获取文章列表...");
    const response = await listArticleByPage({
      current: pagination.value.current,
      pageSize: pagination.value.size,
      sortField: "publishTime",
      sortOrder: "desc",
    });

    console.log("API 响应:", response);

    // 注意：Axios 会将响应数据包装在 response.data 中
    if (response.data.code === 0 && response.data.data) {
      console.log("响应数据:", response.data.data);
      console.log("文章记录:", response.data.data.records);

      // 处理文章数据，提取 summary 和格式化日期
      const articles = response.data.data.records.map((article) => ({
        id: article.id,
        title: article.title,
        summary: extractSummary(article.content),
        category: article.category,
        date: formatDate(article.publishTime),
      }));

      console.log("处理后的文章数据:", articles);
      featuredArticles.value = articles;
      pagination.value.total = response.data.data.total;
      console.log("featuredArticles 值:", featuredArticles.value);
    } else {
      console.log(
        "响应码不为 0 或数据为空:",
        response.data.code,
        response.data.data
      );
    }
  } catch (error) {
    console.error("获取文章列表失败:", error);
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchArticles();
});

// 跳转到文章阅读页面
function goToArticle(articleId) {
  router.push(`/article/article-reading?id=${articleId}`);
}
</script>

<style scoped>
/* 全局样式 */
:root {
  --primary-color: #000000;
  --secondary-color: #666666;
  --accent-color: #000076;
  --bg-color: #ffffff;
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

/* 新闻编辑室容器 */
.newsroom-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
}

/* 页面头部 */
.newsroom-header {
  margin-bottom: 2rem;
}

.newsroom-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  color: var(--primary-color);
}

.category-tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
}

.category-tab {
  background: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--secondary-color);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  position: relative;
}

.category-tab::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background-color: var(--accent-color);
  transform: scaleX(0);
  transition: transform var(--transition-speed) ease;
}

.category-tab.active {
  color: var(--primary-color);
  border-color: var(--border-color);
  font-weight: 500;
}

.category-tab.active::after {
  transform: scaleX(1);
}

.category-tab:hover {
  color: var(--primary-color);
}

/* 每日一句独立板块 */
.daily-quote-section {
  background-color: var(--bg-color);
  padding: 3rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.daily-quote-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.quote-section-title {
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  position: relative;
  padding-bottom: 0.5rem;
}

.quote-section-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60px;
  height: 2px;
  background-color: var(--accent-color);
}

.quote-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.quote-content::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: var(--accent-color);
}

.quote-text {
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--primary-color);
  font-style: italic;
  padding-left: 1rem;
}

.quote-translation {
  font-size: 1.1rem;
  color: var(--secondary-color);
  line-height: 1.5;
  padding-left: 1rem;
}

.quote-author {
  font-size: 0.9rem;
  color: var(--secondary-color);
  align-self: flex-end;
  margin-top: 0.5rem;
  padding-right: 1rem;
}

/* 文章网格 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.article-card {
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.article-card::before {
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

.article-card:hover {
  opacity: var(--hover-opacity);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.article-card:hover::before {
  transform: scaleY(1);
}

/* 移除图片相关样式 */

.article-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 2rem; /* 为绝对定位的meta留出空间 */
}

.article-title {
  font-size: 1.6rem;
  font-weight: 700;
  font-family: "Times New Roman", Times, serif;
  line-height: 1.4;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.article-summary {
  font-size: 0.9rem;
  color: var(--secondary-color);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--secondary-color);
  font-weight: 300;
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  border-top: none;
  padding-top: 0;
}

/* 查看更多按钮容器 */
.show-more-container {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

/* 移除不再使用的分页按钮样式 */

/* 页脚 */
.newsroom-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 3rem;
  margin-top: 2rem;
}

.stay-connected {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.stay-connected h3 {
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--primary-color);
}

.subscribe-button {
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity var(--transition-speed) ease;
}

.subscribe-button:hover {
  opacity: var(--hover-opacity);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.footer-column h4 {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-column ul {
  list-style: none;
}

.footer-column li {
  margin-bottom: 0.5rem;
}

.footer-column li a,
.footer-column li {
  font-size: 0.85rem;
  color: var(--secondary-color);
  text-decoration: none;
  transition: color var(--transition-speed) ease;
}

.footer-column li a:hover,
.footer-column li:hover {
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .newsroom-container {
    padding: 1.5rem;
    margin: 1rem auto;
  }

  .newsroom-title {
    font-size: 2rem;
  }

  .category-tabs {
    gap: 1rem;
  }

  .daily-quote-section {
    padding: 2rem 0;
  }

  .daily-quote-container {
    padding: 0 1.5rem;
  }

  .quote-section-title {
    font-size: 1.5rem;
  }

  .quote-content {
    padding: 1.5rem;
  }

  .quote-text {
    font-size: 1.1rem;
  }

  .quote-translation {
    font-size: 1rem;
  }

  .article-card {
    padding: 1rem;
  }

  .article-meta {
    bottom: 1rem;
    left: 1rem;
  }

  .stay-connected {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .newsroom-title {
    font-size: 1.8rem;
  }

  .category-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }

  .article-card {
    padding: 1rem;
  }
}
</style>
