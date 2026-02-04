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
/* 新闻编辑室容器 */
.newsroom-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
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
  color: var(--color-text-primary);
}

/* 每日一句独立板块 */
.daily-quote-section {
  padding: 3rem 0;
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
  position: relative;
  padding-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.quote-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.quote-text {
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.6;
  font-style: italic;
  padding-left: 1rem;
  color: var(--color-text-primary);
}

.quote-translation {
  font-size: 1.1rem;
  line-height: 1.5;
  padding-left: 1rem;
  color: var(--color-text-primary);
}

.quote-author {
  font-size: 0.9rem;
  align-self: flex-end;
  margin-top: 0.5rem;
  padding-right: 1rem;
  color: var(--color-text-primary);
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
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

.article-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  transform: scaleY(0);
}

.article-card:hover {
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
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.article-summary {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  font-weight: 300;
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  border-top: none;
  padding-top: 0;
  color: var(--color-text-primary);
}

/* 查看更多按钮容器 */
.show-more-container {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
  padding: 1rem 0;
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
