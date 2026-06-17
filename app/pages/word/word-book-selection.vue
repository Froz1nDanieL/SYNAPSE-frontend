<template>
  <main class="book-selection">
    <header class="selection-header">
      <NuxtLink class="back-link" to="/word/word-main">单词学习</NuxtLink>
      <div>
        <p class="eyebrow">Book</p>
        <h1>选择词书</h1>
      </div>
    </header>

    <section class="library-panel">
      <div class="library-top">
        <p class="library-count">{{ bookList.length }} 本词书</p>
      </div>
      <div class="book-grid">
        <WordBookCard
          v-for="book in bookList"
          :key="book.type"
          :book="book"
          :position="1"
          @select="selectWordBook"
        />
      </div>
    </section>

    <div v-if="showDailyCountDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>{{ selectedBook?.name }}</h2>
        <label class="daily-count-input">
          <span>每日新词</span>
          <div class="count-control">
            <button @click="decreaseDailyCount" class="count-btn">-</button>
            <input
              type="number"
              v-model.number="dailyNewCount"
              min="20"
              max="100"
              class="count-input"
            />
            <button @click="increaseDailyCount" class="count-btn">+</button>
          </div>
        </label>
        <div class="dialog-buttons">
          <button @click="closeDailyCountDialog" class="btn btn-cancel">
            取消
          </button>
          <button @click="handleCreatePlan" class="btn btn-confirm">
            确定
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSwitchDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>切换词书</h2>
        <p>
          {{ currentPlan?.wordTypeName }} → {{ selectedBook?.name }}
        </p>
        <div class="dialog-buttons">
          <button @click="closeSwitchDialog" class="btn btn-cancel">
            取消
          </button>
          <button @click="handleSwitchPlan" class="btn btn-confirm">
            切换
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { getWordBookList } from "~/composables/api/wordLearnController";
import {
  createLearnPlan,
  getCurrentPlan,
  switchWordBook,
} from "~/composables/api/learnPlanController";
import { navigateTo } from "nuxt/app";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "选择词书 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "选择词书",
    },
  ],
});

const route = useRoute();

const { data: wordBooks } = useAsyncData("wordBooks", async () => {
  try {
    const response = await getWordBookList();
    return response.data.code === 0 ? response.data.data : [];
  } catch (error) {
    console.error("获取词书列表失败:", error);
    return [];
  }
});

const { data: currentPlan } = useAsyncData("currentPlan", async () => {
  try {
    const response = await getCurrentPlan();
    return response.data.code === 0 ? response.data.data : null;
  } catch (error) {
    console.error("获取当前学习计划失败:", error);
    return null;
  }
});

const bookList = computed(() => wordBooks.value || []);
const selectedBook = ref(null);
const showDailyCountDialog = ref(false);
const showSwitchDialog = ref(false);
const dailyNewCount = ref(20);

const selectWordBook = (book) => {
  selectedBook.value = book;

  if (!currentPlan.value) {
    showDailyCountDialog.value = true;
  } else if (currentPlan.value.wordType === book.type) {
    navigateToLearningPage();
  } else {
    showSwitchDialog.value = true;
  }
};

const closeDailyCountDialog = () => {
  showDailyCountDialog.value = false;
  selectedBook.value = null;
};

const closeSwitchDialog = () => {
  showSwitchDialog.value = false;
  selectedBook.value = null;
};

const decreaseDailyCount = () => {
  if (dailyNewCount.value > 20) {
    dailyNewCount.value--;
  }
};

const increaseDailyCount = () => {
  if (dailyNewCount.value < 100) {
    dailyNewCount.value++;
  }
};

const handleCreatePlan = async () => {
  try {
    const response = await createLearnPlan({
      wordType: selectedBook.value.type,
      dailyNewCount: dailyNewCount.value,
    });

    if (response.data.code === 0) {
      showDailyCountDialog.value = false;
      navigateToLearningPage();
    } else {
      console.error("创建学习计划失败:", response.data.message);
    }
  } catch (error) {
    console.error("创建学习计划失败:", error);
  }
};

const handleSwitchPlan = async () => {
  try {
    const response = await switchWordBook({
      wordType: selectedBook.value.type,
    });

    if (response.data.code === 0) {
      showSwitchDialog.value = false;
      navigateToLearningPage();
    } else {
      console.error("切换词书失败:", response.data.message);
    }
  } catch (error) {
    console.error("切换词书失败:", error);
  }
};

const navigateToLearningPage = () => {
  const redirectPath = route.query.redirect || "/word/word-memory";
  navigateTo(redirectPath, { force: true });
};
</script>

<style scoped>
.book-selection {
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: clamp(2rem, 5vh, 4rem) clamp(2rem, 6vw, 6rem);
  display: grid;
  grid-template-columns: minmax(13rem, 18rem) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
}

.selection-header {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 0.5rem;
}

.back-link {
  width: fit-content;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 0.875rem;
  opacity: 0.64;
}

.eyebrow {
  margin: 0 0 0.75rem;
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

.library-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-left: 1px solid var(--color-accent-secondary);
  padding-left: clamp(1.5rem, 3vw, 3rem);
}

.library-top {
  display: flex;
  align-items: center;
  min-height: 2rem;
  margin-bottom: 1rem;
  padding: 0 1.25rem;
}

.library-count {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  font-weight: 700;
  opacity: 0.56;
  text-transform: uppercase;
}

.book-grid {
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 16rem));
  grid-auto-rows: 12.75rem;
  align-content: start;
  justify-content: start;
  gap: 1.25rem;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.book-grid :deep(.word-book-card) {
  width: 100%;
  height: 100%;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 8px;
  box-shadow: none;
  background: transparent;
  color: var(--color-text-primary);
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.book-grid :deep(.word-book-card:hover) {
  background: var(--color-accent-secondary);
  border-color: var(--color-text-primary);
  transform: translateY(-2px);
}

.book-grid :deep(.book-info) {
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  text-align: center;
}

.book-grid :deep(.book-title) {
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.book-grid :deep(.book-description),
.book-grid :deep(.book-stats) {
  color: var(--color-text-primary);
  opacity: 0.68;
}

.book-grid :deep(.book-description) {
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 4.5rem;
  margin: 0.75rem 0;
}

.book-grid :deep(.book-stats) {
  justify-content: center;
  font-size: 0.8125rem;
}

.book-grid :deep(.word-count::after) {
  color: var(--color-text-primary);
  opacity: 0.36;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: transparent;
}

.dialog-content {
  width: min(100% - 2rem, 26rem);
  padding: 1.5rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 8px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.dialog-content h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.dialog-content p {
  margin: 0 0 1.5rem;
  opacity: 0.72;
}

.daily-count-input {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.count-control,
.dialog-buttons {
  display: flex;
  gap: 0.75rem;
}

.count-btn,
.btn {
  min-height: 2.75rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.count-btn {
  width: 2.75rem;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.count-input {
  width: 6rem;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-weight: 700;
  text-align: center;
}

.count-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.dialog-buttons {
  justify-content: flex-end;
}

.btn {
  padding: 0 1rem;
}

.btn-confirm {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.btn-cancel {
  background: transparent;
  color: var(--color-text-primary);
}

@media (max-width: 1120px) {
  .book-selection {
    grid-template-columns: 1fr;
    overflow-y: auto;
    align-content: start;
  }

  .library-panel {
    border-left: 0;
    padding-left: 0;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
    overflow: visible;
    padding: 0;
  }
}

@media (max-width: 720px) {
  .book-selection {
    padding: 2rem 1rem;
  }

  .book-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 12rem;
  }

  h1 {
    font-size: 2.25rem;
  }
}
</style>
