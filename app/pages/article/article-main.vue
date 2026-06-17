<template>
  <section class="article-page">
    <aside class="article-rail" aria-labelledby="article-page-title">
      <div class="rail-heading">
        <p class="rail-kicker">Reading</p>
        <h1 id="article-page-title">精选文章</h1>
        <p class="rail-description">
          用一篇短文进入语境，把单词留在句子里记住。
        </p>
      </div>

      <div class="quote-block">
        <p class="quote-label">每日一句</p>
        <blockquote>
          <p class="quote-text">{{ dailyQuote.english }}</p>
          <p class="quote-translation">{{ dailyQuote.chinese }}</p>
          <cite>{{ dailyQuote.author }}</cite>
        </blockquote>
      </div>

      <dl class="reading-stats" aria-label="文章统计">
        <div>
          <dt>已加载</dt>
          <dd>{{ featuredArticles.length }}</dd>
        </div>
        <div>
          <dt>总文章</dt>
          <dd>{{ pagination.total || "--" }}</dd>
        </div>
      </dl>
    </aside>

    <main class="article-list-panel">
      <div class="list-toolbar">
        <div>
          <p class="toolbar-kicker">Latest</p>
          <h2>阅读列表</h2>
        </div>
        <button class="refresh-button" type="button" @click="refreshArticles">
          刷新
        </button>
      </div>

      <div v-if="isLoading" class="articles-grid" aria-label="文章加载中">
        <article v-for="item in 6" :key="item" class="article-card skeleton">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-meta"></div>
        </article>
      </div>

      <div v-else-if="errorMessage" class="state-panel" role="status">
        <p>{{ errorMessage }}</p>
        <button type="button" @click="refreshArticles">重新加载</button>
      </div>

      <div v-else-if="featuredArticles.length === 0" class="state-panel">
        <p>暂时没有可阅读的文章。</p>
      </div>

      <div v-else class="articles-grid">
        <article
          v-for="article in featuredArticles"
          :key="article.id"
          class="article-card"
          tabindex="0"
          @click="goToArticle(article.id)"
          @keydown.enter.prevent="goToArticle(article.id)"
          @keydown.space.prevent="goToArticle(article.id)"
        >
          <div class="article-meta">
            <span>{{ article.category || "Article" }}</span>
            <time>{{ article.date }}</time>
          </div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.summary }}</p>
          <span class="article-action">开始阅读</span>
        </article>
      </div>

      <div v-if="canLoadMore && !isLoading" class="load-more-row">
        <button
          class="load-more-button"
          type="button"
          :disabled="isLoadingMore"
          @click="loadMoreArticles"
        >
          {{ isLoadingMore ? "加载中" : "查看更多" }}
        </button>
      </div>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { listArticleByPage } from "~/composables/api/articleController";

const router = useRouter();

const dailyQuote = {
  english: "The only way to do great work is to love what you do.",
  chinese: "成就伟业的唯一途径，是热爱自己所做的事。",
  author: "Steve Jobs",
};

const featuredArticles = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const errorMessage = ref("");

const pagination = ref({
  current: 1,
  total: 0,
  size: 9,
});

const canLoadMore = computed(() => {
  return (
    pagination.value.total > 0 &&
    featuredArticles.value.length < pagination.value.total
  );
});

function extractSummary(content) {
  if (!content) return "暂无摘要";

  const plainText = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  if (plainText.length <= 120) return plainText || "暂无摘要";

  const summary = plainText.substring(0, 120);
  const lastSpaceIndex = summary.lastIndexOf(" ");

  return `${summary.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : 120)}...`;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function normalizeArticle(article) {
  return {
    id: article.id,
    title: article.title || "Untitled",
    summary: extractSummary(article.content),
    category: article.category,
    date: formatDate(article.publishTime),
  };
}

async function fetchArticles({ append = false } = {}) {
  errorMessage.value = "";
  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const response = await listArticleByPage({
      current: pagination.value.current,
      pageSize: pagination.value.size,
      sortField: "publishTime",
      sortOrder: "desc",
    });

    const payload = response?.data;
    if (payload?.code === 0 && payload.data) {
      const articles = (payload.data.records || []).map(normalizeArticle);
      featuredArticles.value = append
        ? [...featuredArticles.value, ...articles]
        : articles;
      pagination.value.total = payload.data.total || 0;
      return;
    }

    errorMessage.value = "文章加载失败，请稍后再试。";
  } catch (error) {
    console.error("获取文章列表失败:", error);
    errorMessage.value = "文章加载失败，请稍后再试。";
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

function refreshArticles() {
  pagination.value.current = 1;
  fetchArticles();
}

async function loadMoreArticles() {
  if (isLoadingMore.value || !canLoadMore.value) return;

  pagination.value.current += 1;
  await fetchArticles({ append: true });
}

function goToArticle(articleId) {
  router.push(`/article/article-reading?id=${articleId}`);
}

onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.article-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.62fr);
  gap: clamp(2rem, 5vw, 5.5rem);
  padding: clamp(2rem, 5vw, 4.5rem);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.article-rail {
  position: sticky;
  top: clamp(2rem, 5vw, 4.5rem);
  align-self: start;
  min-height: calc(100dvh - clamp(4rem, 10vw, 9rem));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3rem;
  padding-right: clamp(1rem, 3vw, 3rem);
  border-right: 1px solid var(--color-accent-secondary);
}

.rail-kicker,
.toolbar-kicker,
.quote-label,
.reading-stats dt {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

.rail-heading h1 {
  margin: 1rem 0 1.25rem;
  max-width: 8ch;
  font-size: clamp(3rem, 6.2vw, 6.75rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: 0;
}

.rail-description {
  max-width: 24rem;
  margin: 0;
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.8;
  color: color-mix(in srgb, var(--color-text-primary) 72%, transparent);
}

.quote-block {
  padding-top: 2rem;
  border-top: 1px solid var(--color-accent-secondary);
}

.quote-block blockquote {
  margin: 1.5rem 0 0;
}

.quote-text {
  margin: 0;
  font-size: clamp(1.2rem, 1.8vw, 1.7rem);
  line-height: 1.45;
  font-weight: 600;
}

.quote-translation {
  margin: 1rem 0 0;
  font-size: 0.98rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-text-primary) 68%, transparent);
}

.quote-block cite {
  display: block;
  margin-top: 1.25rem;
  font-size: 0.9rem;
  font-style: normal;
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.reading-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
}

.reading-stats div {
  padding-top: 1rem;
  border-top: 1px solid var(--color-accent-secondary);
}

.reading-stats dd {
  margin: 0.5rem 0 0;
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1;
}

.article-list-panel {
  min-width: 0;
}

.list-toolbar {
  min-height: 4rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: clamp(1.5rem, 3vw, 2.75rem);
}

.list-toolbar h2 {
  margin: 0.4rem 0 0;
  font-size: clamp(1.5rem, 2vw, 2.15rem);
  line-height: 1.15;
}

.refresh-button,
.load-more-button,
.state-panel button {
  min-height: 2.5rem;
  padding: 0 1rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 0;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.refresh-button:hover,
.load-more-button:hover,
.state-panel button:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.refresh-button:active,
.load-more-button:active,
.state-panel button:active,
.article-card:active {
  transform: translateY(1px);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--color-accent-secondary);
  border: 1px solid var(--color-accent-secondary);
}

.article-card {
  min-height: 19rem;
  display: flex;
  flex-direction: column;
  padding: clamp(1.25rem, 2vw, 1.75rem);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  outline: none;
  transition: background-color 160ms ease;
}

.article-card:hover,
.article-card:focus-visible {
  background: var(--color-accent-secondary);
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 1.25rem;
  margin-bottom: 2rem;
  font-size: 0.82rem;
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.article-card h3 {
  margin: 0;
  font-size: clamp(1.25rem, 1.65vw, 1.75rem);
  line-height: 1.24;
  letter-spacing: 0;
}

.article-card p {
  margin: 1rem 0 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-text-primary) 70%, transparent);
}

.article-action {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.9rem;
  font-weight: 700;
}

.state-panel {
  min-height: 18rem;
  display: grid;
  place-items: center;
  gap: 1rem;
  padding: 2rem;
  border: 1px solid var(--color-accent-secondary);
  text-align: center;
}

.state-panel p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 72%, transparent);
}

.load-more-row {
  display: flex;
  justify-content: center;
  padding: 2.5rem 0 0;
}

.load-more-button:disabled {
  cursor: wait;
  opacity: 0.62;
}

.skeleton {
  cursor: default;
}

.skeleton:hover {
  background: var(--color-bg-primary);
}

.skeleton-line,
.skeleton-meta {
  background: color-mix(in srgb, var(--color-text-primary) 14%, transparent);
}

.skeleton-line {
  height: 0.875rem;
  margin-top: 0.9rem;
}

.skeleton-title {
  width: 76%;
  height: 1.45rem;
  margin-top: 2.5rem;
}

.skeleton-line.short {
  width: 54%;
}

.skeleton-meta {
  width: 8rem;
  height: 0.875rem;
  margin-top: auto;
}

@media (max-width: 1180px) {
  .article-page {
    grid-template-columns: 1fr;
  }

  .article-rail {
    position: static;
    min-height: auto;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
    border-right: 0;
    border-bottom: 1px solid var(--color-accent-secondary);
    padding: 0 0 2rem;
  }

  .reading-stats {
    grid-column: 1 / -1;
  }

  .rail-heading h1 {
    max-width: none;
  }

  .articles-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .article-page {
    padding: 1.25rem;
  }

  .article-rail,
  .articles-grid {
    grid-template-columns: 1fr;
  }

  .list-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .refresh-button {
    align-self: flex-start;
  }

  .article-card {
    min-height: 15rem;
  }
}
</style>
