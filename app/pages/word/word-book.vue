<template>
  <div class="word-book-container">
    <div class="content-wrapper">
      <div class="page-header">
        <h1 class="page-title">生词本</h1>
        <p class="page-subtitle">管理你的收藏单词</p>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2, 8.5C2, 5.41 4.42, 3, 7.5, 3C9.24, 3, 10.91, 3.81, 12, 5.08C13.09, 3.81, 14.76, 3, 16.5, 3C19.58, 3, 22, 5.41, 22, 8.5C22, 12.27, 18.6, 15.36, 13.45, 20.03L12, 21.35Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalWords }}</div>
            <div class="stat-label">收藏单词</div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button
          class="action-btn review-btn"
          @click="handleReview"
          :disabled="totalWords === 0 || loading"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>开始复习</span>
        </button>
        <button
          class="action-btn clear-btn"
          @click="handleClear"
          :disabled="totalWords === 0 || loading"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6H5H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 6V4C8, 3.46957 8.21071, 2.96086 8.58579, 2.58579C8.96086, 2.21071 9.46957, 2 10, 2H14C14.5304, 2 15.0391, 2.21071 15.4142, 2.58579C15.7893, 2.96086 16, 3.46957 16, 4V6M19, 6V20C19, 20.5304 18.7893, 21.0391 18.4142, 21.4142C18.0391, 21.7893 17.5304, 22 17, 22H7C6.46957, 22 5.96086, 21.7893 5.58579, 21.4142C5.21071, 21.0391 5, 20.5304 5, 20V6H19Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>清空生词本</span>
        </button>
      </div>

      <div class="words-list-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V4M12 16L12.01 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#ff6b6b"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>{{ error }}</p>
          <button class="retry-btn" @click="retryFetch">重新加载</button>
        </div>
        <div v-else-if="wordsList.length === 0" class="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2, 12.27 2, 8.5C2, 5.41 4.42, 3, 7.5, 3C9.24, 3, 10.91, 3.81, 12, 5.08C13.09, 3.81, 14.76, 3, 16.5, 3C19.58, 3, 22, 5.41, 22, 8.5C22, 12.27, 18.6, 15.36, 13.45, 20.03L12, 21.35Z"
              stroke="#e2ded1"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>生词本为空</p>
          <p class="empty-hint">在学习过程中收藏的单词会显示在这里</p>
        </div>
        <div v-else class="words-list">
          <div
            v-for="word in wordsList"
            :key="word.wordId || word.id"
            class="word-item"
          >
            <div class="word-content">
              <div
                class="word-main"
                @click.stop="toggleTranslation(word.wordId)"
              >
                <div class="word-text">{{ word.word }}</div>
                <div class="word-phonetic" v-if="word.phonetic">
                  /{{ word.phonetic }}/
                </div>
              </div>
              <div
                v-if="word.showTranslation"
                class="word-translation"
                v-html="formatText(word.translation || word.definition)"
              ></div>
            </div>
            <div class="word-actions">
              <SpeakerButton
                v-if="word.word"
                :word="word.word"
                :type="1"
                size="18px"
                @click.stop
              />
              <span v-else class="no-word-hint">无单词</span>
              <CollectCheck
                :model-value="word.isCollect === 1"
                @update:model-value="
                  (value) => handleToggleCollect(word, value)
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
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
      content: "管理你的收藏单词",
    },
  ],
});

const router = useRouter();

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
  const hasRequiredFields = requiredFields.some(
    (field) =>
      word[field] !== undefined && word[field] !== null && word[field] !== ""
  );

  return hasRequiredFields;
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

    console.log("生词本 API 响应:", response);

    if (response.data && response.data.code === 0 && response.data.data) {
      const records = response.data.data.records || [];
      console.log("生词本记录数据:", records);

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
      console.log("处理后的单词列表:", wordsList.value);

      if (wordsList.value.length === 0 && records.length > 0) {
        message.warning("生词本数据格式异常，部分单词无法显示");
      }
    } else {
      console.error("API 返回数据格式错误:", response);
      error.value = "获取生词本数据失败";
      message.error("获取生词本数据失败");
      wordsList.value = [];
      totalWords.value = 0;
    }
  } catch (error) {
    console.error("获取生词本失败:", error);
    error.value = "获取生词本失败，请稍后重试";
    message.error("获取生词本失败，请稍后重试");
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

  if (confirm("确定要清空生词本吗？此操作不可恢复。")) {
    loading.value = true;
    try {
      const response = await clearCollectedWords({});
      if (response.data && response.data.code === 0) {
        message.success("生词本已清空");
        await fetchCollectedWords();
      } else {
        message.error("清空失败，请重试");
      }
    } catch (error) {
      console.error("清空生词本失败:", error);
      message.error("清空失败，请重试");
    } finally {
      loading.value = false;
    }
  }
}

function handleReview() {
  if (totalWords.value === 0) {
    message.warning("生词本为空，无法开始复习");
    return;
  }

  message.info("复习功能开发中，敬请期待");

  // TODO: 待后端接口开发完成后，调用复习接口
  // 示例代码（待实现）:
  // try {
  //   const response = await getReviewWordList({
  //     wordType: 'collected',
  //     limit: '50'
  //   });
  //   if (response.data && response.data.code === 0) {
  //     const reviewWords = response.data.data || [];
  //     router.push({
  //       path: '/word/word-review',
  //       query: {
  //         words: JSON.stringify(reviewWords)
  //       }
  //     });
  //   }
  // } catch (error) {
  //   console.error('获取复习单词失败:', error);
  //   message.error('获取复习单词失败，请重试');
  // }
}

async function handleToggleCollect(word, isCollected) {
  try {
    await toggleCollect({
      wordId: word.wordId,
      wordType: word.wordType,
      isCollect: isCollected ? 1 : 0,
    });

    if (isCollected) {
      message.success("已收藏");
    } else {
      message.success("已取消收藏");
    }

    await fetchCollectedWords();
  } catch (error) {
    console.error("收藏操作失败:", error);
    message.error("操作失败，请重试");
  }
}
</script>

<style scoped>
.word-book-container {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.content-wrapper {
  width: 100%;
  max-width: 800px;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--color-text-primary);
  opacity: 0.7;
  margin: 0;
}

.stats-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--color-accent-secondary);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  opacity: 0.7;
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  max-width: 200px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-btn {
  background-color: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.clear-btn {
  background-color: var(--color-accent-secondary);
  color: var(--color-text-primary);
}

.words-list-section {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  color: var(--color-text-primary);
  opacity: 0.7;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-accent-secondary);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  color: var(--color-text-primary);
  opacity: 0.7;
}

.error-state p {
  margin: 0;
  font-size: 1.125rem;
}

.retry-btn {
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background-color: var(--color-text-primary);
  color: var(--color-bg-primary);
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  color: var(--color-text-primary);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1.125rem;
}

.empty-hint {
  font-size: 0.875rem !important;
  opacity: 0.7;
}

.words-list {
  padding: 1rem;
}

.word-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
}

.word-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  flex: 1;
}

.word-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
  cursor: pointer;
}

.word-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.word-phonetic {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  opacity: 0.6;
  font-style: italic;
}

.word-translation {
  font-size: 1rem;
  color: var(--color-text-primary);
  opacity: 0.8;
  line-height: 1.5;
}

.word-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.word-actions :deep(.container) {
  --size: 24px;
  --color: var(--color-text-primary);
}

.word-actions :deep(.container input:checked ~ .star-solid) {
  fill: #ff6b6b;
}

.no-word-hint {
  font-size: 0.75rem;
  color: var(--color-text-primary);
  opacity: 0.5;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .word-book-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .stat-card {
    padding: 1.25rem 1.5rem;
    min-width: 150px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .actions-section {
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-btn {
    max-width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  }

  .words-list-section {
    min-height: 300px;
    max-height: 500px;
  }

  .word-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .word-content {
    width: 100%;
  }

  .word-main {
    min-width: auto;
  }

  .word-translation {
    margin-top: 0.25rem;
  }

  .word-actions {
    width: 100%;
    justify-content: flex-end;
    gap: 1.25rem;
  }

  .word-actions :deep(.container) {
    --size: 22px;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.75rem;
  }

  .stats-section {
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem 1.25rem;
    min-width: 120px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.6875rem;
  }

  .actions-section {
    margin-bottom: 1.5rem;
  }

  .action-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }

  .action-btn svg {
    width: 18px;
    height: 18px;
  }

  .words-list-section {
    min-height: 250px;
    max-height: 400px;
  }

  .word-item {
    padding: 0.875rem;
  }

  .word-text {
    font-size: 1.125rem;
  }

  .word-phonetic {
    font-size: 0.75rem;
  }

  .word-translation {
    font-size: 0.875rem;
  }

  .word-actions {
    width: 100%;
    justify-content: flex-end;
    gap: 1rem;
  }

  .word-actions :deep(.container) {
    --size: 20px;
  }
}
</style>
