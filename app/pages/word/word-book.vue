<template>
  <main class="word-book">
    <aside class="book-panel">
      <NuxtLink class="back-link" to="/word/word-main">单词学习</NuxtLink>
      <div class="panel-heading">
        <p class="eyebrow">Collection</p>
        <h1>生词本</h1>
      </div>

      <dl class="book-stats">
        <div>
          <dt>收藏单词</dt>
          <dd>{{ totalWords }}</dd>
        </div>
      </dl>

      <div class="actions-section">
        <button
          class="action-btn primary"
          @click="handleReview"
          :disabled="totalWords === 0 || loading"
        >
          开始复习
        </button>
        <button
          class="action-btn"
          @click="handleClear"
          :disabled="totalWords === 0 || loading"
        >
          清空
        </button>
      </div>
    </aside>

    <section class="words-panel">
      <div v-if="loading" class="state-block">加载中...</div>
      <div v-else-if="error" class="state-block">
        <p>{{ error }}</p>
        <button class="inline-button" @click="retryFetch">重新加载</button>
      </div>
      <div v-else-if="wordsList.length === 0" class="state-block">
        生词本为空
      </div>

      <div v-else class="words-list">
        <article
          v-for="word in wordsList"
          :key="word.wordId || word.id"
          class="word-item"
        >
          <button class="word-content" @click="toggleTranslation(word.wordId)">
            <span class="word-main">
              <strong>{{ word.word }}</strong>
              <span v-if="word.phonetic">/{{ word.phonetic }}/</span>
            </span>
            <span
              v-if="word.showTranslation"
              class="word-translation"
              v-html="formatText(word.translation || word.definition)"
            ></span>
          </button>

          <div class="word-actions">
            <SpeakerButton
              v-if="word.word"
              :word="word.word"
              :type="1"
              size="18px"
              @click.stop
            />
            <CollectCheck
              :model-value="word.isCollect === 1"
              @update:model-value="
                (value) => handleToggleCollect(word, value)
              "
            />
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getCollectedWords,
  clearCollectedWords,
  toggleCollect,
} from "~/composables/api/wordLearnController";
import SpeakerButton from "~/components/SpeakerButton.vue";
import CollectCheck from "~/components/CollectCheck.vue";
import { message } from "ant-design-vue";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "生词本 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "生词本",
    },
  ],
});

const wordsList = ref([]);
const totalWords = ref(0);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const error = ref(null);

function validateWordData(word) {
  if (!word) {
    return false;
  }

  const requiredFields = ["wordId", "word"];
  return requiredFields.some(
    (field) =>
      word[field] !== undefined && word[field] !== null && word[field] !== ""
  );
}

function toggleTranslation(wordId) {
  const word = wordsList.value.find((w) => w.wordId === wordId);
  if (word) {
    word.showTranslation = !word.showTranslation;
  }
}

function formatText(text) {
  if (!text) return "";
  text = text.replace(/\\n/g, "\n");
  return text.replace(/\r?\n/g, "<br>");
}

onMounted(async () => {
  await fetchCollectedWords();
});

async function fetchCollectedWords() {
  loading.value = true;
  error.value = null;
  try {
    const response = await getCollectedWords({
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
    });

    if (response.data && response.data.code === 0 && response.data.data) {
      const records = response.data.data.records || [];

      wordsList.value = records
        .map((record) => ({
          ...record,
          wordId: record.wordId || record.id,
          word: record.word || "",
          phonetic: record.phonetic || "",
          translation: record.translation || record.definition || "",
          wordType: record.wordType || "",
          isCollect: record.isCollect === 1 ? 1 : 0,
          showTranslation: false,
        }))
        .filter(validateWordData);

      totalWords.value = response.data.data.total || 0;

      if (wordsList.value.length === 0 && records.length > 0) {
        message.warning("部分单词无法显示");
      }
    } else {
      error.value = "获取生词本失败";
      message.error("获取生词本失败");
      wordsList.value = [];
      totalWords.value = 0;
    }
  } catch (fetchError) {
    console.error("获取生词本失败:", fetchError);
    error.value = "获取生词本失败";
    message.error("获取生词本失败");
    wordsList.value = [];
    totalWords.value = 0;
  } finally {
    loading.value = false;
  }
}

async function retryFetch() {
  await fetchCollectedWords();
}

async function handleClear() {
  if (totalWords.value === 0) {
    return;
  }

  if (confirm("确定清空生词本吗？")) {
    loading.value = true;
    try {
      const response = await clearCollectedWords({});
      if (response.data && response.data.code === 0) {
        message.success("生词本已清空");
        await fetchCollectedWords();
      } else {
        message.error("清空失败");
      }
    } catch (clearError) {
      console.error("清空生词本失败:", clearError);
      message.error("清空失败");
    } finally {
      loading.value = false;
    }
  }
}

function handleReview() {
  if (totalWords.value === 0) {
    message.warning("生词本为空");
    return;
  }

  message.info("复习功能开发中");
}

async function handleToggleCollect(word, isCollected) {
  try {
    await toggleCollect({
      wordId: word.wordId,
      wordType: word.wordType,
      isCollect: isCollected ? 1 : 0,
    });

    message.success(isCollected ? "已收藏" : "已取消收藏");
    await fetchCollectedWords();
  } catch (toggleError) {
    console.error("收藏操作失败:", toggleError);
    message.error("操作失败");
  }
}
</script>

<style scoped>
.word-book {
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(240px, 18rem) minmax(560px, 1fr);
  gap: 3rem;
  padding: 3rem 6vw;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.book-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1rem;
  overflow: hidden;
}

.back-link {
  width: fit-content;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 0.875rem;
  opacity: 0.64;
}

.panel-heading {
  display: grid;
  gap: 0.75rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.56;
}

h1 {
  margin: 0;
  font-size: 3rem;
  line-height: 1.08;
  font-weight: 800;
}

.book-stats {
  margin: 0;
  padding: 0;
}

.book-stats div {
  padding: 1rem 0;
  border-top: 1px solid var(--color-accent-secondary);
  border-bottom: 1px solid var(--color-accent-secondary);
}

dt,
dd {
  margin: 0;
}

dt {
  font-size: 0.875rem;
  opacity: 0.64;
}

dd {
  margin-top: 0.5rem;
  font-size: 3rem;
  line-height: 1;
  font-weight: 800;
}

.actions-section {
  display: grid;
  gap: 0.75rem;
}

.action-btn,
.inline-button {
  min-height: 2.75rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.action-btn.primary {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.action-btn:disabled {
  border-color: var(--color-accent-secondary);
  opacity: 0.44;
  cursor: not-allowed;
}

.words-panel {
  min-width: 0;
  min-height: 0;
  align-self: start;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 8px;
  max-height: 100%;
  overflow: hidden;
}

.state-block {
  min-height: 28rem;
  display: grid;
  place-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--color-text-primary);
  opacity: 0.72;
}

.state-block p {
  margin: 0;
}

.inline-button {
  padding: 0 1rem;
  opacity: 1;
}

.words-list {
  display: grid;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.word-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.word-item:last-child {
  border-bottom: 0;
}

.word-content {
  min-width: 0;
  display: grid;
  gap: 0.5rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.word-main {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.word-main strong {
  font-size: 1.375rem;
}

.word-main span,
.word-translation {
  opacity: 0.68;
}

.word-translation {
  max-width: 48rem;
  line-height: 1.6;
}

.word-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.word-actions :deep(.container) {
  --size: 24px;
  --color: var(--color-text-primary);
}

.word-actions :deep(.container input:checked ~ .star-solid) {
  fill: var(--color-text-primary);
}

@media (max-width: 980px) {
  .word-book {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
    overflow-y: auto;
    align-content: start;
  }

  .book-panel {
    overflow: visible;
  }

  .words-panel {
    overflow: visible;
  }

  .words-list {
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 560px) {
  .word-book {
    padding: 1rem;
  }

  h1 {
    font-size: 2.25rem;
  }

  .word-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .word-actions {
    justify-content: flex-end;
  }
}
</style>
