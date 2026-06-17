<template>
  <div class="article-reading-page" @click="closeTranslation">
    <header class="reading-topbar">
      <button class="back-button" type="button" @click.stop="goBack">
        返回
      </button>
      <div class="topbar-meta" aria-label="文章信息">
        <span>{{ article.category || "Article" }}</span>
        <time>{{ formatDate(article.publishTime) || "未发布" }}</time>
      </div>
    </header>

    <main class="reading-shell">
      <aside class="reading-sidebar" aria-label="阅读概览">
        <dl>
          <div>
            <dt>来源</dt>
            <dd>{{ article.source || "未知" }}</dd>
          </div>
          <div>
            <dt>阅读量</dt>
            <dd>{{ article.viewCount || 0 }}</dd>
          </div>
          <div>
            <dt>文章类型</dt>
            <dd>{{ article.category || "Article" }}</dd>
          </div>
        </dl>
      </aside>

      <article class="reading-article">
        <div v-if="isLoading" class="article-loading" aria-label="文章加载中">
          <div class="loading-title"></div>
          <div class="loading-meta"></div>
          <div v-for="item in 7" :key="item" class="loading-line"></div>
        </div>

        <div v-else-if="errorMessage" class="state-panel" role="status">
          <p>{{ errorMessage }}</p>
          <button type="button" @click.stop="fetchArticle">重新加载</button>
        </div>

        <div v-else-if="!article.title" class="state-panel">
          <p>没有找到这篇文章。</p>
        </div>

        <template v-else>
          <h1>{{ article.title }}</h1>

          <div class="article-meta">
            <span>{{ article.category || "Article" }}</span>
            <time>{{ formatDate(article.publishTime) }}</time>
            <span>来源: {{ article.source || "未知" }}</span>
            <span>阅读量: {{ article.viewCount || 0 }}</span>
          </div>

          <div
            class="article-body"
            v-html="processedContent"
            @click="handleArticleBodyClick"
            @keydown.enter.prevent="handleArticleBodyKeydown"
            @keydown.space.prevent="handleArticleBodyKeydown"
          ></div>
        </template>

        <div
          v-if="showTranslation && wordTranslation"
          class="word-trans-card-wrapper"
          :style="{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
          }"
          @click.stop
        >
          <WordTransCard :word-data="wordTranslation" />
        </div>
      </article>
    </main>

    <footer v-if="relatedArticles.length" class="article-footer">
      <h2>相关文章</h2>
      <div class="related-list">
        <article
          v-for="related in relatedArticles"
          :key="related.id"
          class="related-item"
          tabindex="0"
          @click="goToArticle(related.id)"
          @keydown.enter.prevent="goToArticle(related.id)"
          @keydown.space.prevent="goToArticle(related.id)"
        >
          <h3>{{ related.title }}</h3>
          <time>{{ formatDate(related.publishTime) }}</time>
        </article>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getArticleById } from "~/composables/api/articleController";
import { translateWord } from "~/composables/api/engdictController";
import WordTransCard from "~/components/WordTransCard.vue";

const router = useRouter();
const route = useRoute();

const article = ref({
  title: "",
  content: "",
  category: "",
  publishTime: "",
  source: "",
  viewCount: 0,
});

const relatedArticles = ref([]);
const selectedWord = ref("");
const wordTranslation = ref(null);
const showTranslation = ref(false);
const cardPosition = ref({ x: 0, y: 0 });
const processedContent = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function wrapWords(paragraph) {
  return paragraph
    .split(/([a-zA-Z]+)/g)
    .map((part) => {
      if (/^[a-zA-Z]+$/.test(part)) {
        const word = escapeHtml(part);
        return `<span class="clickable-word" role="button" tabindex="0" data-word="${word}">${word}</span>`;
      }

      return escapeHtml(part);
    })
    .join("");
}

function formatArticleContent(content) {
  if (!content) return "";

  const plainText = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n/g, "\n");

  return plainText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${wrapWords(paragraph)}</p>`)
    .join("");
}

async function fetchArticle() {
  const articleId = route.query.id;
  showTranslation.value = false;
  wordTranslation.value = null;
  errorMessage.value = "";

  if (!articleId) {
    article.value = {
      title: "",
      content: "",
      category: "",
      publishTime: "",
      source: "",
      viewCount: 0,
    };
    processedContent.value = "";
    errorMessage.value = "文章 ID 不存在。";
    return;
  }

  isLoading.value = true;

  try {
    const response = await getArticleById({
      id: Number(articleId),
    });

    const payload = response?.data;
    if (payload?.code === 0 && payload.data) {
      const fetchedArticle = payload.data;
      article.value = fetchedArticle;
      processedContent.value = formatArticleContent(fetchedArticle.content);
      return;
    }

    errorMessage.value = "文章加载失败，请稍后再试。";
  } catch (error) {
    console.error("获取文章详情失败:", error);
    errorMessage.value = "文章加载失败，请稍后再试。";
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.back();
}

function goToArticle(articleId) {
  router.push(`/article/article-reading?id=${articleId}`);
}

function calculateCardPosition(target) {
  const rect = target.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const cardWidth = Math.min(340, viewportWidth - 24);
  const cardHeight = 260;

  let x = rect.right + 18;
  if (x + cardWidth > viewportWidth - 12) {
    x = rect.left - cardWidth - 18;
  }
  if (x < 12) {
    x = (viewportWidth - cardWidth) / 2;
  }

  let y = rect.top - 18;
  if (y + cardHeight > viewportHeight - 12) {
    y = viewportHeight - cardHeight - 12;
  }
  if (y < 12) {
    y = 12;
  }

  return { x, y };
}

async function handleWordClick(word, event) {
  event.stopPropagation();

  const trimmedWord = word?.trim();
  if (!trimmedWord) return;

  selectedWord.value = trimmedWord;
  cardPosition.value = calculateCardPosition(event.target);

  try {
    const response = await translateWord({ word: trimmedWord });
    const payload = response?.data;

    if (payload?.code === 0 && payload.data) {
      wordTranslation.value = payload.data;
      showTranslation.value = true;
      return;
    }

    showTranslation.value = false;
  } catch (error) {
    console.error("翻译失败:", error);
    showTranslation.value = false;
  }
}

function closeTranslation() {
  showTranslation.value = false;
}

function getWordElement(event) {
  return event.target?.closest?.(".clickable-word");
}

function handleArticleBodyClick(event) {
  const wordElement = getWordElement(event);
  if (!wordElement) return;

  handleWordClick(wordElement.dataset.word, event);
}

function handleArticleBodyKeydown(event) {
  const wordElement = getWordElement(event);
  if (!wordElement) return;

  handleWordClick(wordElement.dataset.word, event);
}

watch(
  () => route.query.id,
  () => {
    fetchArticle();
  },
  { immediate: true }
);
</script>

<style scoped>
.article-reading-page {
  min-height: 100dvh;
  padding: clamp(1.5rem, 4vw, 4rem);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.reading-topbar {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 0 auto clamp(2rem, 4vw, 3.5rem);
  max-width: 1320px;
  border-bottom: 1px solid var(--color-accent-secondary);
  padding-bottom: 1rem;
}

.back-button,
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

.back-button:hover,
.state-panel button:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.back-button:active,
.state-panel button:active {
  transform: translateY(1px);
}

.topbar-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem 1.25rem;
  font-size: 0.9rem;
  color: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

.reading-shell {
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(13rem, 0.36fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 6rem);
  align-items: start;
}

.reading-sidebar {
  position: sticky;
  top: 2rem;
  padding-right: clamp(1rem, 2vw, 2.5rem);
  border-right: 1px solid var(--color-accent-secondary);
}

.reading-sidebar dl {
  display: grid;
  gap: 1.5rem;
  margin: 0;
}

.reading-sidebar div {
  padding-top: 1rem;
  border-top: 1px solid var(--color-accent-secondary);
}

.reading-sidebar dt,
.article-meta {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.reading-sidebar dd {
  margin: 0.45rem 0 0;
  font-size: 1rem;
  line-height: 1.5;
  word-break: break-word;
}

.reading-article {
  width: min(100%, 820px);
  margin: 0 auto;
}

.reading-article h1 {
  margin: 0;
  font-size: clamp(2.2rem, 4.6vw, 4.7rem);
  line-height: 1.05;
  letter-spacing: 0;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1.25rem;
  margin: 1.5rem 0 clamp(2.5rem, 5vw, 4rem);
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.article-body {
  font-size: clamp(1.05rem, 1.2vw, 1.18rem);
  line-height: 2;
}

.article-body :deep(p) {
  margin: 0 0 1.65rem;
}

.article-body :deep(.clickable-word) {
  display: inline;
  border-bottom: 1px solid transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  outline: none;
  transition: background-color 140ms ease, border-color 140ms ease;
}

.article-body :deep(.clickable-word:hover),
.article-body :deep(.clickable-word:focus-visible) {
  border-color: var(--color-text-primary);
  background: var(--color-accent-secondary);
}

.word-trans-card-wrapper {
  position: fixed;
  z-index: 1000;
  width: min(340px, calc(100vw - 24px));
}

.word-trans-card-wrapper :deep(.word-trans-card) {
  position: static;
  min-width: 0;
  max-width: none;
  width: 100%;
  border: 1px solid var(--color-text-primary);
  border-radius: 0;
  box-shadow: none;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.word-trans-card-wrapper :deep(.card-header) {
  border-bottom-color: var(--color-accent-secondary);
}

.word-trans-card-wrapper :deep(.word),
.word-trans-card-wrapper :deep(.translation),
.word-trans-card-wrapper :deep(.definition p),
.word-trans-card-wrapper :deep(.definition h4),
.word-trans-card-wrapper :deep(.exchange-info h4),
.word-trans-card-wrapper :deep(.exchange-info li) {
  color: var(--color-text-primary);
}

.word-trans-card-wrapper :deep(.phonetic),
.word-trans-card-wrapper :deep(.card-footer) {
  color: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

.word-trans-card-wrapper :deep(.pos),
.word-trans-card-wrapper :deep(.collins),
.word-trans-card-wrapper :deep(.oxford) {
  border-radius: 0;
  background: var(--color-accent-secondary);
  color: var(--color-text-primary);
}

.state-panel,
.article-loading {
  min-height: 24rem;
  padding: 2rem;
  border: 1px solid var(--color-accent-secondary);
}

.state-panel {
  display: grid;
  place-items: center;
  gap: 1rem;
  text-align: center;
}

.state-panel p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 72%, transparent);
}

.loading-title,
.loading-meta,
.loading-line {
  background: color-mix(in srgb, var(--color-text-primary) 14%, transparent);
}

.loading-title {
  width: min(90%, 36rem);
  height: clamp(3rem, 7vw, 5rem);
}

.loading-meta {
  width: 18rem;
  height: 0.9rem;
  margin: 1.5rem 0 4rem;
}

.loading-line {
  height: 1rem;
  margin-bottom: 1.3rem;
}

.loading-line:nth-child(odd) {
  width: 88%;
}

.loading-line:nth-child(even) {
  width: 98%;
}

.article-footer {
  max-width: 1320px;
  margin: clamp(3rem, 6vw, 5rem) auto 0;
  padding-top: 2rem;
  border-top: 1px solid var(--color-accent-secondary);
}

.article-footer h2 {
  margin: 0 0 1.5rem;
  font-size: 1.4rem;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--color-accent-secondary);
  border: 1px solid var(--color-accent-secondary);
}

.related-item {
  min-height: 10rem;
  padding: 1.25rem;
  background: var(--color-bg-primary);
  cursor: pointer;
  outline: none;
}

.related-item:hover,
.related-item:focus-visible {
  background: var(--color-accent-secondary);
}

.related-item h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  line-height: 1.35;
}

.related-item time {
  color: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

@media (max-width: 980px) {
  .reading-shell {
    grid-template-columns: 1fr;
  }

  .reading-sidebar {
    position: static;
    border-right: 0;
    border-bottom: 1px solid var(--color-accent-secondary);
    padding: 0 0 1.5rem;
  }

  .reading-sidebar dl {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .reading-article {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .article-reading-page {
    padding: 1.25rem;
  }

  .reading-topbar,
  .topbar-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-meta {
    justify-content: flex-start;
  }

  .reading-sidebar dl,
  .related-list {
    grid-template-columns: 1fr;
  }

  .article-meta {
    text-transform: none;
    letter-spacing: 0;
  }
}
</style>
