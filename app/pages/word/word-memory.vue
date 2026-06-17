<template>
  <main class="memory-page">
    <aside class="session-panel">
      <NuxtLink class="back-link" to="/word/word-main">单词学习</NuxtLink>

      <div class="session-heading">
        <p class="eyebrow">{{ stageLabel }}</p>
        <h1>单词记忆</h1>
      </div>

      <div class="progress-block">
        <div class="progress-copy">
          <span>{{ progressLabel }}</span>
          <strong>{{ correctWordsCount }}/{{ totalTargetWordsCount }}</strong>
        </div>
        <div class="progress-track">
          <div
            class="progress-value"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>

      <dl class="session-stats">
        <div>
          <dt>轮次</dt>
          <dd>{{ currentStage }}</dd>
        </div>
        <div>
          <dt>当前位置</dt>
          <dd>{{ currentIndex + 1 }}</dd>
        </div>
        <div>
          <dt>错误次数</dt>
          <dd>{{ totalErrorCount }}</dd>
        </div>
      </dl>
    </aside>

    <section class="study-area">
      <div v-if="loading" class="state-panel">加载中...</div>
      <div v-else-if="error" class="state-panel">加载失败</div>
      <div v-else-if="!currentWord" class="state-panel">暂无可学习单词</div>

      <div v-else class="study-card">
        <WordCard1
          v-if="currentStage === 1"
          :word="currentWord"
          :flipped="isFlipped"
          @flip="handleCardFlip"
          @collect-change="handleCollectChange"
          @first-know-change="handleFirstKnowChange"
          @next="nextWord"
        />

        <WordCardQuiz
          v-else-if="currentStage === 2"
          ref="wordCardQuiz"
          :word="currentWord"
          @answer-submit="handleQuizAnswerSubmit"
          @result="handleQuizResult"
        />

        <div v-else class="placeholder-card">
          <h2>拼写测试开发中</h2>
        </div>
      </div>

      <div class="controls">
        <button
          v-if="currentStage === 1"
          class="control-btn primary"
          @click="toggleFlip"
        >
          {{ isFlipped ? "查看单词" : "查看释义" }}
        </button>

        <button
          v-else-if="currentStage === 2 && showQuizResult"
          class="control-btn primary"
          @click="nextWord()"
        >
          {{ currentIndex === currentRoundWords.length - 1 ? "完成" : "下一题" }}
        </button>

        <template v-else-if="currentStage === 3">
          <button
            class="control-btn"
            :disabled="currentIndex === 0"
            @click="previousWord"
          >
            上一个
          </button>
          <button class="control-btn" disabled>开发中</button>
          <button
            class="control-btn"
            :disabled="currentIndex === (wordsData?.length || 0) - 1"
            @click="nextWord"
          >
            下一个
          </button>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
import {
  getNewWordList,
  batchSubmitLearnRecord,
} from "~/composables/api/wordLearnController";
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";

const router = useRouter();

const currentIndex = ref(0);
const isFlipped = ref(false);
const currentStage = ref(1);
const learnRecords = ref([]);
const wordsData = ref([]);
const loading = ref(true);
const error = ref(null);
const currentFirstKnow = ref(undefined);
const showQuizResult = ref(false);
const currentRound = ref(1);
const incorrectWordsByRound = ref([]);
const currentRoundWords = ref([]);

const currentWord = computed(() => {
  if (currentStage.value === 2 && currentRoundWords.value.length > 0) {
    return currentRoundWords.value[currentIndex.value] || null;
  }
  if (!Array.isArray(wordsData.value)) {
    return null;
  }
  return wordsData.value[currentIndex.value] || null;
});

const correctWordsCount = computed(() => {
  if (currentStage.value !== 2) {
    return wordsData.value.length === 0 ? 0 : currentIndex.value + 1;
  }
  return learnRecords.value.filter((record) => record.choiceCorrect === true)
    .length;
});

const totalErrorCount = computed(() => {
  if (currentStage.value !== 2) {
    return 0;
  }
  return learnRecords.value.reduce((total, record) => {
    return total + (record.choiceErrorCount || 0);
  }, 0);
});

const totalTargetWordsCount = computed(() => wordsData.value.length);

const progressPercent = computed(() => {
  if (totalTargetWordsCount.value <= 0) {
    return 0;
  }
  return Math.min(
    100,
    Math.round((correctWordsCount.value / totalTargetWordsCount.value) * 100)
  );
});

const stageLabel = computed(() => {
  if (currentStage.value === 1) return "第一轮";
  if (currentStage.value === 2) return `第二轮 · 第 ${currentRound.value} 次`;
  return "第三轮";
});

const progressLabel = computed(() => {
  if (currentStage.value === 2) return "已答对";
  return "已浏览";
});

async function fetchWordsData() {
  loading.value = true;
  error.value = null;
  try {
    const wordRes = await getNewWordList();
    if (wordRes.data && wordRes.data.code === 0 && wordRes.data.data) {
      wordsData.value = Array.isArray(wordRes.data.data)
        ? wordRes.data.data.map((word) => ({
            ...word,
            isCollect: word.isCollect === 1 ? 1 : 0,
          }))
        : [];
    } else {
      wordsData.value = [];
    }
  } catch (err) {
    error.value = err;
    wordsData.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchWordsData();
});

function handleQuizAnswerSubmit(result) {
  const { wordId, isCorrect, errorCount } = result;
  const existingIndex = learnRecords.value.findIndex(
    (record) => record.wordId === wordId
  );

  if (existingIndex >= 0) {
    if (!learnRecords.value[existingIndex].choiceCorrect) {
      learnRecords.value[existingIndex].choiceCorrect = isCorrect;
    }
    learnRecords.value[existingIndex].choiceErrorCount =
      (learnRecords.value[existingIndex].choiceErrorCount || 0) + errorCount;
  } else {
    learnRecords.value.push({
      wordId,
      choiceCorrect: isCorrect,
      choiceErrorCount: errorCount,
      isCollect: currentWord.value.isCollect === 1 ? 1 : 0,
    });
  }
}

function handleQuizResult() {
  showQuizResult.value = true;
}

function canEnterStage2() {
  return wordsData.value.every((word) => {
    const record = learnRecords.value.find((r) => r.wordId === word.wordId);
    return record && record.firstKnow !== undefined;
  });
}

function enterStage2() {
  currentStage.value = 2;
  currentIndex.value = 0;
  currentRound.value = 1;
  showQuizResult.value = false;
  currentRoundWords.value = [...wordsData.value];
  incorrectWordsByRound.value = [];
}

definePageMeta({
  layout: "default",
  middleware: ["auth", "check-learn-plan"],
});

useHead({
  title: "单词记忆 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "单词记忆",
    },
  ],
});

function handleCardFlip(flipped) {
  isFlipped.value = flipped;
}

function toggleFlip() {
  isFlipped.value = !isFlipped.value;
}

function previousWord() {
  if (currentIndex.value > 0) {
    currentIndex.value--;

    if (currentStage.value === 1) {
      isFlipped.value = false;
      currentFirstKnow.value = undefined;
    } else if (currentStage.value === 2) {
      showQuizResult.value = false;
    }
  }
}

async function nextWord() {
  if (currentStage.value === 1) {
    recordCurrentWord();
  }

  if (currentStage.value === 2) {
    if (currentIndex.value < currentRoundWords.value.length - 1) {
      currentIndex.value++;
      showQuizResult.value = false;
    } else {
      const incorrectWords = learnRecords.value
        .filter((record) => record.choiceCorrect === false)
        .map((record) =>
          wordsData.value.find((word) => word.wordId === record.wordId)
        )
        .filter((word) => word !== undefined);

      incorrectWordsByRound.value.push(incorrectWords);

      if (incorrectWords.length > 0) {
        currentRound.value++;
        currentIndex.value = 0;
        showQuizResult.value = false;
        currentRoundWords.value = [...incorrectWords];
      } else {
        await submitLearningRecord();
      }
    }
    return;
  }

  if (
    wordsData.value &&
    Array.isArray(wordsData.value) &&
    currentIndex.value < wordsData.value.length - 1
  ) {
    currentIndex.value++;
    if (currentStage.value === 1) {
      isFlipped.value = false;
      currentFirstKnow.value = undefined;
    }
    return;
  }

  if (currentStage.value === 1) {
    if (canEnterStage2()) {
      enterStage2();
    } else if (confirm("还有单词未完成认识度标记，是否继续完成？")) {
      const firstIncompleteIndex = wordsData.value.findIndex((word) => {
        const record = learnRecords.value.find((r) => r.wordId === word.wordId);
        return !record || record.firstKnow === undefined;
      });
      if (firstIncompleteIndex !== -1) {
        currentIndex.value = firstIncompleteIndex;
        isFlipped.value = false;
        currentFirstKnow.value = undefined;
      }
    }
  }
}

function handleCollectChange(updatedWord) {
  const index = wordsData.value.findIndex(
    (word) => word.wordId === updatedWord.wordId
  );

  if (index !== -1) {
    wordsData.value[index] = updatedWord;
  }
}

function handleFirstKnowChange(value) {
  currentFirstKnow.value = value;
}

function recordCurrentWord() {
  const word = currentWord.value;
  if (!word) {
    return;
  }

  word.isCollect = word.isCollect === 1 ? 1 : 0;
  const existingIndex = learnRecords.value.findIndex(
    (record) => record.wordId === word.wordId
  );
  const collectStatus = word.isCollect;

  if (existingIndex >= 0) {
    learnRecords.value[existingIndex].isCollect = collectStatus;
    if (currentFirstKnow.value !== undefined) {
      learnRecords.value[existingIndex].firstKnow = currentFirstKnow.value;
    }
  } else {
    learnRecords.value.push({
      wordId: word.wordId,
      isCollect: collectStatus,
      firstKnow: currentFirstKnow.value,
    });
  }
}

async function submitLearningRecord() {
  try {
    if (learnRecords.value.length > 0) {
      const wordType = wordsData.value[0]?.wordType;
      if (!wordType) {
        return;
      }

      const fixedRecords = learnRecords.value.map((record) => ({
        ...record,
        isCollect: record.isCollect === 1 ? 1 : 0,
        wordType,
        choiceCorrect:
          record.choiceCorrect !== undefined ? record.choiceCorrect : false,
        choiceErrorCount:
          record.choiceErrorCount !== undefined ? record.choiceErrorCount : 0,
      }));

      await batchSubmitLearnRecord({
        wordType,
        learnRecords: fixedRecords,
      });

      router.push({
        path: "/word/word-complete",
        query: {
          words: wordsData.value.length,
          learnRecords: encodeURIComponent(JSON.stringify(fixedRecords)),
          wordsData: encodeURIComponent(JSON.stringify(wordsData.value)),
        },
      });
    }
  } catch (error) {
    console.error("提交学习记录失败:", error);
  }
}
</script>

<style scoped>
.memory-page {
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

.session-panel {
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

.session-heading {
  display: flex;
  flex-direction: column;
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
  font-size: 2.75rem;
  line-height: 1.08;
  font-weight: 800;
}

.progress-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-copy {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.875rem;
}

.progress-copy span {
  opacity: 0.64;
}

.progress-copy strong {
  font-size: 1.25rem;
}

.progress-track {
  height: 0.5rem;
  background: var(--color-accent-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-value {
  height: 100%;
  background: var(--color-text-primary);
  transition: width 0.25s ease;
}

.session-stats {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}

.session-stats div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0.75rem 0;
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
  font-size: 1.25rem;
  font-weight: 800;
}

.study-area {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-content: center;
}

.study-card,
.state-panel {
  width: min(100%, 60rem);
  height: 100%;
  min-height: 0;
  justify-self: center;
}

.state-panel,
.placeholder-card {
  display: grid;
  place-items: center;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 8px;
  color: var(--color-text-primary);
  opacity: 0.72;
}

.placeholder-card {
  width: 100%;
  height: 100%;
  opacity: 1;
}

.placeholder-card h2 {
  margin: 0;
  font-size: 1.25rem;
}

.controls {
  min-height: 3rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.control-btn {
  min-width: 9rem;
  min-height: 3rem;
  padding: 0 1rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.control-btn.primary {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.control-btn:disabled {
  border-color: var(--color-accent-secondary);
  color: var(--color-text-primary);
  opacity: 0.44;
  cursor: not-allowed;
}

.study-card :deep(.word-card),
.study-card :deep(.word-card-placeholder) {
  border: 1px solid var(--color-accent-secondary);
  border-radius: 8px;
  box-shadow: none;
  background: var(--color-bg-primary);
}

.study-card :deep(.card-front),
.study-card :deep(.card-back) {
  border-radius: 8px;
  background: var(--color-bg-primary);
}

.study-card :deep(.card-content) {
  padding: 3rem;
}

.study-card :deep(.word),
.study-card :deep(.quiz-word) {
  color: var(--color-text-primary);
  font-size: 4rem;
  font-weight: 800;
}

.study-card :deep(.phonetic),
.study-card :deep(.definition),
.study-card :deep(.translation),
.study-card :deep(.exchange),
.study-card :deep(.loading-text) {
  color: var(--color-text-primary);
}

.study-card :deep(.phonetic),
.study-card :deep(.definition) {
  opacity: 0.68;
}

.study-card :deep(.meaning h3),
.study-card :deep(.exchange h3) {
  color: var(--color-text-primary);
}

.study-card :deep(.exchange-item) {
  background: var(--color-accent-secondary);
  border-radius: 6px;
}

.study-card :deep(.level-button),
.study-card :deep(.quiz-option) {
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  box-shadow: none;
}

.study-card :deep(.level-button:hover:not(:disabled)),
.study-card :deep(.quiz-option:hover:not(:disabled)),
.study-card :deep(.quiz-option.selected) {
  border-color: var(--color-text-primary);
  background: var(--color-accent-secondary);
  color: var(--color-text-primary);
  transform: none;
  box-shadow: none;
}

.study-card :deep(.level-button.active),
.study-card :deep(.quiz-option.correct) {
  border-color: var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.study-card :deep(.quiz-option.incorrect) {
  border-color: var(--color-text-primary);
  background: var(--color-accent-secondary);
  color: var(--color-text-primary);
}

.study-card :deep(.correct-icon),
.study-card :deep(.incorrect-icon) {
  color: currentColor;
}

@media (max-width: 980px) {
  .memory-page {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1.5rem;
    overflow-y: auto;
    align-content: start;
  }

  .session-panel {
    padding-top: 0;
    overflow: visible;
  }

  .session-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .session-stats div {
    display: block;
  }

  .study-area {
    grid-template-rows: minmax(26rem, auto) auto;
  }

  .study-card,
  .state-panel {
    height: auto;
    min-height: 26rem;
  }
}

@media (max-width: 560px) {
  .memory-page {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .session-stats {
    grid-template-columns: 1fr;
  }

  .study-card :deep(.word),
  .study-card :deep(.quiz-word) {
    font-size: 2.5rem;
  }

  .study-card :deep(.card-content) {
    padding: 1.5rem;
  }

  .controls {
    flex-direction: column;
  }
}
</style>
