<template>
  <main class="word-main">
    <section class="overview">
      <div class="overview-copy">
        <p class="eyebrow">Word Study</p>
        <h1>单词学习</h1>
        <p class="subtitle">今天的学习节奏已经准备好。</p>
      </div>

      <button
        class="checkin-button"
        :class="{ checked: isCheckedIn }"
        @click="handleCheckIn"
      >
        <span class="checkin-mark" aria-hidden="true">✓</span>
        <span>{{ isCheckedIn ? "今日已签到" : "每日签到" }}</span>
      </button>
    </section>

    <section class="study-grid">
      <button
        class="study-primary"
        :class="{ 'is-pressed': pressedAction === 'memory' }"
        @pointerdown="pressAction('memory')"
        @pointerup="releaseAction"
        @pointerleave="releaseAction"
        @pointercancel="releaseAction"
        @click="navigateToWordMemory"
      >
        <span class="action-label">开始记忆</span>
        <span class="action-value">{{ newWordCount }}</span>
        <span class="action-meta">今日新词</span>
      </button>

      <div class="study-secondary">
        <button
          class="study-action muted"
          :class="{ 'is-pressed': pressedAction === 'review' }"
          @pointerdown="pressAction('review')"
          @pointerup="releaseAction"
          @pointerleave="releaseAction"
          @pointercancel="releaseAction"
          @click="releaseAction"
        >
          <span class="action-label">复习单词</span>
          <span class="action-value">{{ reviewWordCount }}</span>
          <span class="action-meta">待复习</span>
        </button>

        <button
          class="study-action"
          :class="{ 'is-pressed': pressedAction === 'wordBook' }"
          @pointerdown="pressAction('wordBook')"
          @pointerup="releaseAction"
          @pointerleave="releaseAction"
          @pointercancel="releaseAction"
          @click="navigateToWordBook"
        >
          <span class="action-label">生词本</span>
          <span class="action-value">{{ collectedWordCount }}</span>
          <span class="action-meta">已收藏</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getNewWordList } from "~/composables/api/wordLearnController";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "单词学习 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "单词学习主页",
    },
  ],
});

const router = useRouter();

const newWordCount = ref(0);
const reviewWordCount = ref(0);
const collectedWordCount = ref(0);
const isCheckedIn = ref(false);
const pressedAction = ref("");

onMounted(async () => {
  await fetchNewWordCount();
  await fetchCollectedWordCount();
  checkInStatus();
});

async function fetchNewWordCount() {
  try {
    const response = await getNewWordList();
    if (response.data && response.data.code === 0 && response.data.data) {
      newWordCount.value = Array.isArray(response.data.data)
        ? response.data.data.length
        : 0;
    }
  } catch (error) {
    console.error("获取新词数量失败:", error);
    newWordCount.value = 0;
  }
}

async function fetchCollectedWordCount() {
  collectedWordCount.value = 0;
}

function checkInStatus() {
  const today = new Date().toDateString();
  const lastCheckIn = localStorage.getItem("lastCheckIn");
  isCheckedIn.value = lastCheckIn === today;
}

function handleCheckIn() {
  if (isCheckedIn.value) {
    return;
  }

  const today = new Date().toDateString();
  localStorage.setItem("lastCheckIn", today);
  isCheckedIn.value = true;
}

function pressAction(action) {
  pressedAction.value = action;
}

function releaseAction() {
  pressedAction.value = "";
}

function navigateToWordMemory() {
  releaseAction();
  router.push("/word/word-memory");
}

function navigateToWordBook() {
  releaseAction();
  router.push("/word/word-book");
}
</script>

<style scoped>
.word-main {
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  display: grid;
  grid-template-columns: minmax(280px, 0.8fr) minmax(520px, 1.2fr);
  gap: 4rem;
  align-items: center;
  padding: 5rem 7vw;
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.overview-copy {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.eyebrow {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.56;
}

h1 {
  margin: 0;
  font-size: 3.5rem;
  line-height: 1.05;
  font-weight: 800;
}

.subtitle {
  margin: 0;
  max-width: 24rem;
  font-size: 1.125rem;
  line-height: 1.7;
  opacity: 0.72;
}

.checkin-button {
  width: fit-content;
  min-height: 3rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.checkin-button.checked {
  background: var(--color-accent-secondary);
  color: var(--color-text-primary);
  cursor: default;
}

.checkin-mark {
  display: inline-grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 0.8125rem;
}

.study-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(260px, 0.8fr);
  gap: 1rem;
  align-items: stretch;
}

.study-primary,
.study-action {
  border: 1px solid var(--color-accent-secondary);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition:
    background-color 220ms ease-out,
    border-color 220ms ease-out,
    color 220ms ease-out;
}

.study-primary {
  min-height: 22rem;
  padding: 2rem;
  display: grid;
  align-content: end;
  gap: 0.75rem;
}

.study-secondary {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
}

.study-action {
  min-height: 10.5rem;
  padding: 1.5rem;
  display: grid;
  align-content: end;
  gap: 0.5rem;
}

.study-primary:hover,
.study-action:hover {
  background: var(--color-accent-secondary);
}

.study-primary.is-pressed,
.study-action.is-pressed {
  border-color: var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.study-action.muted {
  opacity: 0.52;
  cursor: pointer;
}

.action-label {
  font-size: 1rem;
  font-weight: 700;
}

.action-value {
  font-size: 4.5rem;
  line-height: 0.95;
  font-weight: 800;
}

.study-action .action-value {
  font-size: 2.5rem;
}

.action-meta {
  font-size: 0.875rem;
  opacity: 0.64;
}

@media (max-width: 980px) {
  .word-main {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding: 4rem 1.5rem;
    overflow-y: auto;
    align-content: start;
  }

  .study-grid {
    grid-template-columns: 1fr;
  }

  .study-primary {
    min-height: 16rem;
  }
}

@media (max-width: 560px) {
  .word-main {
    padding: 3rem 1rem;
  }

  h1 {
    font-size: 2.5rem;
  }

  .study-secondary {
    grid-template-rows: none;
  }
}
</style>
