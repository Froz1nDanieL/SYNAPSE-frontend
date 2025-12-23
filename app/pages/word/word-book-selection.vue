<template>
  <div class="container">
    <div class="content">
      <div class="word-books-grid">
        <!-- 前4个词书卡片 -->
        <WordBookCard
          v-for="(book, index) in wordBooks.slice(0, 4)"
          :key="book.type"
          :book="book"
          :position="index + 1"
          @select="selectWordBook"
        />

        <!-- 第五个位置：页面标题 -->
        <div class="word-book-card position-5 page-title-card">
          <h1 class="page-title">选择<br />词书</h1>
        </div>

        <!-- 后4个词书卡片 -->
        <WordBookCard
          v-for="(book, index) in wordBooks.slice(4, 8)"
          :key="book.type"
          :book="book"
          :position="index + 6"
          @select="selectWordBook"
        />
      </div>
    </div>

    <!-- 确认学习对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>是否学习该词书？</h2>
        <p>{{ selectedBook?.name }}</p>
        <div class="dialog-buttons">
          <button @click="closeConfirmDialog" class="btn btn-cancel">
            取消
          </button>
          <button @click="handleConfirmStudy" class="btn btn-confirm">
            是
          </button>
        </div>
      </div>
    </div>

    <!-- 设置每日学习量对话框 -->
    <div v-if="showDailyCountDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>设置每日学习量</h2>
        <div class="daily-count-input">
          <button @click="decreaseDailyCount" class="count-btn">-</button>
          <input
            type="number"
            v-model.number="dailyNewCount"
            min="1"
            max="100"
            class="count-input"
          />
          <button @click="increaseDailyCount" class="count-btn">+</button>
        </div>
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

    <!-- 切换词书确认对话框 -->
    <div v-if="showSwitchDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>切换词书</h2>
        <p>
          您当前正在学习 {{ currentPlan?.wordTypeName }}，是否切换到
          {{ selectedBook?.name }}？
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
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "选择词书 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "选择适合您学习目标的词书：中考、高考、四级、六级、雅思、托福等",
    },
  ],
});

// 导入必要的API
import { getWordBookList } from "~/composables/api/wordLearnController";
import {
  createLearnPlan,
  getCurrentPlan,
  switchWordBook,
} from "~/composables/api/learnPlanController";

// 导航
import { navigateTo } from "nuxt/app";
const router = useRouter();

// 词书列表
const { data: wordBooks } = useAsyncData("wordBooks", async () => {
  try {
    const response = await getWordBookList();
    return response.data.code === 0 ? response.data.data : [];
  } catch (error) {
    console.error("获取词书列表失败:", error);
    return [];
  }
});

// 获取当前学习计划
const { data: currentPlan } = useAsyncData("currentPlan", async () => {
  try {
    const response = await getCurrentPlan();
    return response.data.code === 0 ? response.data.data : null;
  } catch (error) {
    console.error("获取当前学习计划失败:", error);
    return null;
  }
});

// 状态变量
const selectedBook = ref(null);
const showConfirmDialog = ref(false);
const showDailyCountDialog = ref(false);
const showSwitchDialog = ref(false);
const dailyNewCount = ref(20);

// 选择词书的方法
const selectWordBook = (book) => {
  selectedBook.value = book;

  // 检查当前计划
  if (!currentPlan.value) {
    // 情况1: 无计划 → 弹窗设置每日量
    showDailyCountDialog.value = true;
  } else if (currentPlan.value.wordType === book.type) {
    // 情况2: 有计划且是当前词书 → 直接进入学习
    navigateToLearningPage();
  } else {
    // 情况3: 有计划但不是当前词书 → 弹窗确认切换
    showSwitchDialog.value = true;
  }
};

// 对话框控制函数
const closeConfirmDialog = () => {
  showConfirmDialog.value = false;
};

const closeDailyCountDialog = () => {
  showDailyCountDialog.value = false;
  selectedBook.value = null;
};

const closeSwitchDialog = () => {
  showSwitchDialog.value = false;
  selectedBook.value = null;
};

// 每日学习量控制
const decreaseDailyCount = () => {
  if (dailyNewCount.value > 1) {
    dailyNewCount.value--;
  }
};

const increaseDailyCount = () => {
  if (dailyNewCount.value < 100) {
    dailyNewCount.value++;
  }
};

// 处理确认学习
const handleConfirmStudy = () => {
  closeConfirmDialog.value;
  // 这里可以添加直接进入学习的逻辑，如果需要的话
};

// 创建学习计划
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
      // 可以添加错误提示
    }
  } catch (error) {
    console.error("创建学习计划失败:", error);
    // 可以添加错误提示
  }
};

// 切换词书
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
      // 可以添加错误提示
    }
  } catch (error) {
    console.error("切换词书失败:", error);
    // 可以添加错误提示
  }
};

// 导航到学习页面
const navigateToLearningPage = () => {
  // 从路由参数中获取重定向地址
  const route = useRoute();
  const redirectPath = route.query.redirect || "/word/word-memory";

  // 使用navigateTo并添加force选项，确保页面正确刷新
  navigateTo(redirectPath, { force: true });
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f9f8f5;
  height: 100vh;
  overflow: hidden;
  padding: 2rem;
  box-sizing: border-box;
}

/* 页面标题卡片样式 */
.page-title-card {
  cursor: default;
  background-color: transparent !important;
  box-shadow: none !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 150px;
  height: 180px;
}

/* 取消中间选择词书卡片的hover效果 */
.page-title-card:hover {
  transform: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #000033;
  margin: 0 0 0.5rem 0;
  line-height: 1.1;
  text-align: center;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  padding: 0 1rem;
}

.content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.word-books-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  justify-items: center;
  align-items: center;
}

/* 标题卡片保持不同颜色 */
.position-5 {
  background-color: transparent; /* 透明背景，与标题卡片样式一致 */
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-content h2 {
  color: #000033;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.dialog-content p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.dialog-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm {
  background-color: #000033;
  color: white;
}

.btn-confirm:hover {
  background-color: #000066;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

/* 每日学习量输入样式 */
.daily-count-input {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  gap: 1rem;
}

.count-btn {
  width: 40px;
  height: 40px;
  background-color: #000033;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.count-btn:hover {
  background-color: #000066;
  transform: scale(1.1);
}

.count-input {
  width: 80px;
  height: 40px;
  text-align: center;
  font-size: 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 0.5rem;
}

.count-input:focus {
  outline: none;
  border-color: #000033;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .page-title-card {
    border-width: 1px;
    width: calc(50% - 0.5rem);
    max-width: 150px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
    padding: 0 0.5rem;
  }

  .word-books-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    max-width: 100%;
    justify-content: center;
  }

  .book-cover-placeholder {
    width: 40px;
    height: 40px;
  }

  .placeholder-icon {
    font-size: 1rem;
  }

  .dialog-content {
    padding: 1.5rem;
    width: 95%;
  }

  .dialog-content h2 {
    font-size: 1.3rem;
  }

  .dialog-content p {
    font-size: 1rem;
  }

  .daily-count-input {
    gap: 0.5rem;
  }

  .count-btn {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }

  .count-input {
    width: 70px;
    height: 35px;
    font-size: 1.1rem;
  }
}
</style>
