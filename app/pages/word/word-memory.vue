<template>
  <div class="word-memory-container">
    <!-- 页面头部 -->
    <div class="header">
      <h1 class="title">背单词</h1>
      <!-- 学习阶段提示 -->
      <div class="stage-indicator">
        <div class="stage-text">
          <span v-if="currentStage === 1" class="stage-label"
            >第一轮：认识度标记</span
          >

          <span v-else-if="currentStage === 2" class="stage-label"
            >第二轮：选词测试</span
          >
          <span v-else-if="currentStage === 3" class="stage-label"
            >第三轮测试</span
          >
        </div>
      </div>
      <div class="progress">
        <span class="progress-text"
          >{{ correctWordsCount }}/{{ totalTargetWordsCount }}</span
        >
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: `${
                totalTargetWordsCount > 0
                  ? (correctWordsCount / totalTargetWordsCount) * 100
                  : 0
              }%`,
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 单词卡片区域 -->
    <div class="card-container">
      <!-- 第一轮：认识度标记 -->
      <WordCard1
        v-if="currentStage === 1"
        :word="currentWord"
        :flipped="isFlipped"
        @flip="handleCardFlip"
        @collect-change="handleCollectChange"
        @first-know-change="handleFirstKnowChange"
        @next="nextWord"
      />

      <!-- 第二轮：选词测试 -->
      <WordCardQuiz
        v-else-if="currentStage === 2"
        ref="wordCardQuiz"
        :word="currentWord"
        @answer-submit="handleQuizAnswerSubmit"
        @result="handleQuizResult"
      />

      <!-- 第三轮测试（占位符） -->
      <div v-else-if="currentStage === 3" class="placeholder-card">
        <h2>第三轮测试功能开发中...</h2>
      </div>
    </div>

    <!-- 控制按钮区域 -->
    <div class="controls">
      <!-- 第一轮和第二轮都不显示通用的上一个和下一个按钮 -->
      <button
        v-if="currentStage === 3"
        class="control-btn prev-btn"
        :disabled="currentIndex === 0"
        @click="previousWord"
      >
        上一个
      </button>

      <!-- 第一轮：翻转按钮 -->
      <button
        v-if="currentStage === 1"
        class="control-btn flip-btn"
        @click="toggleFlip"
      >
        {{ isFlipped ? "查看单词" : "查看释义" }}
      </button>

      <!-- 第二轮：显示结果后的下一步按钮 -->
      <button
        v-else-if="currentStage === 2 && showQuizResult"
        class="control-btn next-btn"
        @click="nextWord()"
      >
        {{ currentIndex === currentRoundWords.length - 1 ? "完成" : "下一题" }}
      </button>

      <!-- 第三轮：占位符按钮 -->
      <button
        v-else-if="currentStage === 3"
        class="control-btn placeholder-btn"
        disabled
      >
        功能开发中
      </button>

      <!-- 只有第三轮显示通用的下一个按钮 -->
      <button
        v-if="currentStage === 3"
        class="control-btn next-btn"
        :disabled="currentIndex === (wordsData?.length || 0) - 1"
        @click="nextWord"
      >
        下一个
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  getNewWordList,
  batchSubmitLearnRecord,
} from "~/composables/api/wordLearnController";
import { useRouter } from "vue-router";
import { navigateTo } from "nuxt/app";
import { ref, computed, onMounted } from "vue";

import { getCurrentPlan } from "~/composables/api/learnPlanController";

const router = useRouter();

// 当前单词索引
const currentIndex = ref(0);
// 卡片翻转状态
const isFlipped = ref(false);

// 学习阶段（1: 认识度标记, 2: 第二轮测试, 3: 第三轮测试）
const currentStage = ref(1);
// 学习记录
const learnRecords = ref([]);
// 单词数据
const wordsData = ref([]);
// 加载状态
const loading = ref(true);
// 错误状态
const error = ref(null);
// 当前单词的firstKnow状态
const currentFirstKnow = ref(undefined);

// 第二轮测试是否显示结果
const showQuizResult = ref(false);

// 第二轮测试相关变量
const currentRound = ref(1); // 当前轮数
const incorrectWordsByRound = ref([]); // 每轮的错误单词列表
const currentRoundWords = ref([]); // 当前轮的单词列表

// 计算当前单词
const currentWord = computed(() => {
  if (currentStage.value === 2 && currentRoundWords.value.length > 0) {
    // 第二轮测试使用当前轮的单词列表
    return currentRoundWords.value[currentIndex.value] || null;
  } else if (!wordsData.value || !Array.isArray(wordsData.value)) {
    return null;
  }
  const word = wordsData.value[currentIndex.value];
  return word || null;
});

// 计算第二轮测试中已正确的单词数量
const correctWordsCount = computed(() => {
  if (currentStage.value !== 2) {
    return currentIndex.value + 1;
  }
  // 统计所有单词中choiceCorrect为true的数量
  return learnRecords.value.filter((record) => record.choiceCorrect === true)
    .length;
});

// 计算第二轮测试中的总错误次数
const totalErrorCount = computed(() => {
  if (currentStage.value !== 2) {
    return 0; // 第一轮测试不统计错误次数
  }
  // 统计所有单词的错误次数总和
  return learnRecords.value.reduce((total, record) => {
    return total + (record.choiceErrorCount || 0);
  }, 0);
});

// 计算第二轮测试的总目标单词数量（所有需要测试的单词）
const totalTargetWordsCount = computed(() => {
  if (currentStage.value !== 2) {
    return wordsData.value.length;
  }
  return wordsData.value.length;
});

// 获取单词数据
async function fetchWordsData() {
  loading.value = true;
  error.value = null;
  try {
    // 获取今日新词
    const wordRes = await getNewWordList();
    if (wordRes.data && wordRes.data.code === 0 && wordRes.data.data) {
      // 确保data是数组
      if (Array.isArray(wordRes.data.data)) {
        // 为每个单词设置默认的isCollect值为0（未收藏），避免null值
        const processedWords = wordRes.data.data.map((word) => {
          return {
            ...word,
            isCollect: word.isCollect === 1 ? 1 : 0,
          };
        });

        wordsData.value = processedWords;
      } else {
        // 如果data不是数组，设置为空数组
        wordsData.value = [];
      }
    } else {
      // 如果API返回错误或没有数据，设置为空数组
      wordsData.value = [];
    }
  } catch (err) {
    error.value = err;
    // 发生错误时，设置为空数组
    wordsData.value = [];
  } finally {
    loading.value = false;
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchWordsData();
});

// 处理第二轮测试答案提交
function handleQuizAnswerSubmit(result) {
  const { wordId, isCorrect, errorCount } = result;

  // 检查是否已经记录过该单词
  const existingIndex = learnRecords.value.findIndex(
    (record) => record.wordId === wordId
  );

  if (existingIndex >= 0) {
    // 更新已有记录
    // 只有当当前回答正确，或者之前尚未正确时，才更新choiceCorrect
    // 一旦单词被标记为正确，就不再改变
    if (!learnRecords.value[existingIndex].choiceCorrect) {
      learnRecords.value[existingIndex].choiceCorrect = isCorrect;
    }
    // 累加错误次数
    learnRecords.value[existingIndex].choiceErrorCount =
      (learnRecords.value[existingIndex].choiceErrorCount || 0) + errorCount;
  } else {
    // 如果没有记录，创建新记录
    const newRecord = {
      wordId: wordId,
      choiceCorrect: isCorrect,
      choiceErrorCount: errorCount,
      isCollect: currentWord.value.isCollect === 1 ? 1 : 0,
    };
    learnRecords.value.push(newRecord);
  }
}

// 处理第二轮测试结果
function handleQuizResult(isCorrect) {
  showQuizResult.value = true;
}

// 检查是否可以进入第二轮测试
function canEnterStage2() {
  // 检查是否所有单词都完成了第一轮测试（有firstKnow字段记录）
  return wordsData.value.every((word) => {
    const record = learnRecords.value.find((r) => r.wordId === word.wordId);
    return record && record.firstKnow !== undefined;
  });
}

// 切换到第二轮测试
function enterStage2() {
  currentStage.value = 2;
  currentIndex.value = 0;
  currentRound.value = 1;
  showQuizResult.value = false;

  // 初始化第一轮测试的单词列表（所有单词）
  currentRoundWords.value = [...wordsData.value];

  // 初始化错误单词列表
  incorrectWordsByRound.value = [];
}

definePageMeta({
  layout: "default", // 使用 default 布局
  middleware: ["auth", "check-learn-plan"], // 保留认证中间件并添加学习计划检查中间件
});

useHead({
  title: "背单词 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "极简高级的单词记忆界面",
    },
  ],
});

// 处理卡片翻转
function handleCardFlip(flipped) {
  isFlipped.value = flipped;
}

// 切换卡片翻转
function toggleFlip() {
  isFlipped.value = !isFlipped.value;
}

// 上一个单词
function previousWord() {
  if (currentIndex.value > 0) {
    currentIndex.value--;

    // 根据不同阶段重置状态
    if (currentStage.value === 1) {
      isFlipped.value = false;
      // 重置认识度状态
      currentFirstKnow.value = undefined;
    } else if (currentStage.value === 2) {
      // 重置第二轮测试状态
      showQuizResult.value = false;
    }
  }
}

// 下一个单词
async function nextWord() {
  // 记录当前单词的学习记录（只在第一轮）
  if (currentStage.value === 1) {
    recordCurrentWord();
  }

  // 处理当前轮的下一个单词
  if (currentStage.value === 2) {
    // 第二轮测试逻辑
    if (currentIndex.value < currentRoundWords.value.length - 1) {
      // 当前轮还有单词，继续下一个
      currentIndex.value++;
      showQuizResult.value = false;
    } else {
      // 当前轮完成，收集错误的单词
      const incorrectWords = learnRecords.value
        .filter((record) => record.choiceCorrect === false)
        .map((record) => {
          // 找到对应的单词对象
          return wordsData.value.find((word) => word.wordId === record.wordId);
        })
        .filter((word) => word !== undefined); // 确保找到了单词

      // 记录当前轮的错误单词
      incorrectWordsByRound.value.push(incorrectWords);

      if (incorrectWords.length > 0) {
        // 有错误单词，进入下一轮
        currentRound.value++;
        currentIndex.value = 0;
        showQuizResult.value = false;

        // 当前轮的单词列表设置为上一轮错误的单词
        currentRoundWords.value = [...incorrectWords];
      } else {
        // 没有错误单词，第二轮测试完成
        await submitLearningRecord();
      }
    }
  } else {
    // 非第二轮测试的逻辑（第一轮）
    if (
      wordsData.value &&
      Array.isArray(wordsData.value) &&
      currentIndex.value < wordsData.value.length - 1
    ) {
      currentIndex.value++;

      // 重置状态
      if (currentStage.value === 1) {
        isFlipped.value = false;
        // 重置认识度状态
        currentFirstKnow.value = undefined;
      }
    } else {
      // 当前阶段完成
      if (currentStage.value === 1) {
        // 第一轮完成，检查是否可以进入第二轮
        if (canEnterStage2()) {
          // 进入第二轮测试
          enterStage2();
        } else {
          // 有未完成第一轮测试的单词，提示用户
          if (
            confirm("还有单词未完成第一轮测试（标记记忆难度），是否继续完成？")
          ) {
            // 找到第一个未完成的单词
            const firstIncompleteIndex = wordsData.value.findIndex((word) => {
              const record = learnRecords.value.find(
                (r) => r.wordId === word.wordId
              );
              return !record || record.firstKnow === undefined;
            });
            if (firstIncompleteIndex !== -1) {
              currentIndex.value = firstIncompleteIndex;
              isFlipped.value = false;
              // 重置认识度状态
              currentFirstKnow.value = undefined;
            }
            return;
          }
        }
      }
    }
  }
}

// 处理收藏状态变化
function handleCollectChange(updatedWord) {
  // 在words数组中找到对应的单词并更新其isCollect状态
  const index = wordsData.value.findIndex(
    (word) => word.wordId === updatedWord.wordId
  );

  if (index !== -1) {
    wordsData.value[index] = updatedWord;
  }
}

// 处理认识度标记变化
function handleFirstKnowChange(value) {
  currentFirstKnow.value = value;
}

function recordCurrentWord() {
  const word = currentWord.value;
  if (word) {
    // 直接确保word.isCollect的值是1或0，避免null或undefined
    word.isCollect = word.isCollect === 1 ? 1 : 0;

    // 检查是否已经记录过该单词
    const existingIndex = learnRecords.value.findIndex(
      (record) => record.wordId === word.wordId
    );
    // 现在可以直接使用word.isCollect，因为它已经被修正为1或0
    const collectStatus = word.isCollect;

    if (existingIndex >= 0) {
      // 更新已有记录
      learnRecords.value[existingIndex].isCollect = collectStatus;
      // 只有当currentFirstKnow有值时才更新（用户已经选择了）
      if (currentFirstKnow.value !== undefined) {
        learnRecords.value[existingIndex].firstKnow = currentFirstKnow.value;
      }
    } else {
      // 添加新记录
      const newRecord = {
        wordId: word.wordId,
        isCollect: collectStatus,
        firstKnow: currentFirstKnow.value,
      };
      learnRecords.value.push(newRecord);
    }
  }
}

// 提交学习记录
async function submitLearningRecord() {
  try {
    // 如果有学习记录，批量提交
    if (learnRecords.value.length > 0) {
      // 获取词书类型（从单词数据中获取，所有单词的wordType应该相同）
      const wordType = wordsData.value[0]?.wordType;
      if (!wordType) {
        return;
      }

      // 检查并修复learnRecords中的字段
      const fixedRecords = learnRecords.value.map((record) => {
        return {
          ...record,
          isCollect: record.isCollect === 1 ? 1 : 0, // 确保isCollect始终为1或0
          wordType: wordType, // 添加词书类型字段
          choiceCorrect:
            record.choiceCorrect !== undefined ? record.choiceCorrect : false, // 确保选词测试结果始终为布尔值
          choiceErrorCount:
            record.choiceErrorCount !== undefined ? record.choiceErrorCount : 0, // 添加选词测试错误次数
        };
      });

      await batchSubmitLearnRecord({
        wordType: wordType, // 批量提交请求中添加词书类型字段
        learnRecords: fixedRecords,
      });

      // 第一轮学习完成，批量提交学习记录后跳转到学习完成页面
      router.push({
        path: "/word/word-complete",
        query: {
          words: wordsData.value.length,
          // 传递学习记录数据，需要转义为JSON字符串
          learnRecords: encodeURIComponent(JSON.stringify(fixedRecords)),
          // 传递完整的单词数据
          wordsData: encodeURIComponent(JSON.stringify(wordsData.value)),
        },
      });
    }
  } catch (error) {
    // 发生错误时保持静默，避免干扰用户体验
  }
}
</script>

<style scoped>
.word-memory-container {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  gap: 2rem;
}

.header {
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.stage-indicator {
  margin-bottom: 1rem;
}

.stage-text {
  text-align: center;
}

.stage-label {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background-color: #000066;
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #000066;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.card-container {
  width: 100%;
  max-width: 800px;
  height: 500px;
  flex-shrink: 0;
}

.word-card {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  background-color: white;
  overflow: hidden;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  flex-shrink: 0;
}

.control-btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #e9ecef;
  color: #333;
  flex: 1;
  max-width: 200px;
}

.control-btn:hover:not(:disabled) {
  background-color: #dee2e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.control-btn.flip-btn {
  background-color: #000066;
  color: white;
}

.control-btn.flip-btn:hover {
  background-color: #000066dd;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  flex-shrink: 0;
  padding: 1rem 0;
  justify-content: center;
  align-items: center;
}

.action-btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 250px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.hard-btn {
  background-color: #94a3b8;
  color: white;
}

.action-btn.medium-btn {
  background-color: #64748b;
  color: white;
}

.action-btn.easy-btn {
  background-color: #475569;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.hard-btn:hover {
  background-color: #64748b;
}

.action-btn.medium-btn:hover {
  background-color: #475569;
}

.action-btn.easy-btn:hover {
  background-color: #334155;
}

.placeholder-card {
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-card h2 {
  color: #666;
  font-size: 1.5rem;
}

/* 控制按钮样式更新 */
.control-btn.submit-btn {
  background-color: #4caf50;
  color: white;
}

.control-btn.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.control-btn.submit-btn:disabled {
  background-color: #cccccc;
  color: #666666;
}

.control-btn.placeholder-btn {
  background-color: #cccccc;
  color: #666666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .word-memory-container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .card-container {
    height: 350px;
  }

  .card-front,
  .card-back {
    padding: 1.5rem;
  }

  .word {
    font-size: 2.5rem;
  }

  .phonetic {
    font-size: 1.1rem;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  .control-btn {
    width: 100%;
    max-width: 100%;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .word-memory-container {
    padding: 0.5rem;
    gap: 1rem;
  }

  .card-container {
    height: 300px;
  }

  .card-front,
  .card-back {
    padding: 1rem;
  }

  .word {
    font-size: 2rem;
  }

  .phonetic {
    font-size: 1rem;
  }

  .meaning li,
  .example p {
    font-size: 0.9rem;
  }
}
</style>
