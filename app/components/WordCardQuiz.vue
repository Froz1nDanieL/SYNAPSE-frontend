<template>
  <div class="word-card" v-if="word">
    <div class="card-front">
      <div class="card-content">
        <div class="quiz-question">
          <div class="quiz-word">{{ word.word }}</div>
        </div>

        <div class="quiz-options">
          <button
            v-for="(option, index) in currentQuizOptions"
            :key="index"
            class="quiz-option"
            :class="{
              selected: selectedOption === index,
              correct: showResult && index === correctOptionIndex,
              incorrect:
                showResult &&
                selectedOption === index &&
                index !== correctOptionIndex,
            }"
            @click="selectOption(index)"
            :disabled="showResult"
          >
            <span class="option-text">{{ option.text }}</span>
            <span
              v-if="showResult && index === selectedOption"
              class="option-icon"
            >
              <span v-if="index === correctOptionIndex" class="correct-icon"
                >✓</span
              >
              <span v-else class="incorrect-icon">✗</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="word-card-placeholder">
    <div class="loading-text">加载中...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  word: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["answerSubmit", "result"]);

// 第二轮测试相关数据
const currentQuizOptions = ref([]); // 当前题目的选项
const selectedOption = ref(null); // 用户选择的选项索引
const correctOptionIndex = ref(null); // 正确选项的索引
const showResult = ref(false); // 是否显示结果
const choiceErrorCount = ref(0); // 错误次数计数

// 只取文本中第一个换行符之前的内容
function getTextBeforeFirstNewline(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // 同时处理实际换行符和转义的\n字符
  const actualNewlineIndex = text.indexOf("\n");
  const escapedNewlineIndex = text.indexOf("\\n");

  // 找到最早出现的换行符位置
  let newlineIndex = -1;
  if (actualNewlineIndex !== -1 && escapedNewlineIndex !== -1) {
    newlineIndex = Math.min(actualNewlineIndex, escapedNewlineIndex);
  } else if (actualNewlineIndex !== -1) {
    newlineIndex = actualNewlineIndex;
  } else if (escapedNewlineIndex !== -1) {
    newlineIndex = escapedNewlineIndex;
  }

  const result = newlineIndex === -1 ? text : text.substring(0, newlineIndex);
  return result;
}

// 生成选词测试题目
function generateQuizOptions() {
  if (!props.word) {
    return [];
  }

  // 使用后端提供的选项数据
  const backendOptions = props.word.options;

  if (
    !backendOptions ||
    !Array.isArray(backendOptions) ||
    backendOptions.length === 0
  ) {
    return [];
  }

  // 获取当前单词翻译的第一部分（第一个换行符之前的内容）
  const currentWordFirstPart = getTextBeforeFirstNewline(
    props.word.translation
  );

  // 创建选项对象，标记正确答案
  const quizOptions = backendOptions.map((optionText) => {
    // 处理每个选项，只取第一个换行符之前的内容
    const processedOption = getTextBeforeFirstNewline(optionText);
    const isCorrect = processedOption === currentWordFirstPart;

    return {
      text: processedOption,
      isCorrect: isCorrect,
    };
  });

  // 打乱选项顺序
  const shuffledOptions = quizOptions.sort(() => 0.5 - Math.random());

  // 找到正确答案在新顺序中的位置
  correctOptionIndex.value = shuffledOptions.findIndex(
    (option) => option.isCorrect
  );

  currentQuizOptions.value = shuffledOptions;
}

// 选择选项
function selectOption(index) {
  if (showResult.value) return;
  selectedOption.value = index;
  // 选择后自动提交答案
  submitQuizAnswer();
}

// 提交答案
function submitQuizAnswer() {
  if (selectedOption.value === null) return;

  const isCorrect = selectedOption.value === correctOptionIndex.value;

  // 无论对错，都显示结果
  showResult.value = true;

  if (!isCorrect) {
    // 答错，增加错误次数
    choiceErrorCount.value++;
  }

  // 提交答案给父组件，无论对错
  emit("answerSubmit", {
    wordId: props.word.wordId,
    isCorrect: isCorrect,
    errorCount: choiceErrorCount.value,
  });
  emit("result", isCorrect);
}

// 监听word变化，重新生成测试选项
watch(
  () => props.word,
  (newWord) => {
    if (newWord) {
      generateQuizOptions();
      selectedOption.value = null;
      showResult.value = false;
      choiceErrorCount.value = 0; // 重置错误次数计数
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* 与WordCard1.vue保持一致的样式 */
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

.card-front {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: 1;
  transform: translateY(0);
  box-sizing: border-box;
  background: #f6f6f6;
}

.card-content {
  text-align: center;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  overflow-y: auto;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

/* 自定义滚动条样式 */
.card-content::-webkit-scrollbar {
  width: 8px;
}

.card-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.card-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 第二轮测试样式 */
.quiz-question {
  margin-bottom: 0;
}

.quiz-word {
  font-size: 3.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
  line-height: 1;
  text-align: center;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 600px;
}

.quiz-option {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.quiz-option:hover:not(:disabled) {
  border-color: #000066;
  background-color: #f6f6f6;
  transform: translateY(-2px);
}

.quiz-option.selected {
  border-color: #000066;
  background-color: #e3f2fd;
}

.quiz-option.correct {
  border-color: #4caf50;
  background-color: #e8f5e8;
  color: #2e7d32;
}

.quiz-option.incorrect {
  border-color: #f44336;
  background-color: #ffebee;
  color: #c62828;
}

.quiz-option:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.option-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.correct-icon {
  color: #4caf50;
}

.incorrect-icon {
  color: #f44336;
}

/* 占位符样式，与WordCard1.vue保持一致 */
.word-card-placeholder {
  width: 100%;
  height: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 1.2rem;
}

/* 响应式设计，与WordCard1.vue保持一致 */
@media (max-width: 768px) {
  .card-content {
    padding: 1.5rem;
  }

  .quiz-word {
    font-size: 2.5rem;
  }

  .quiz-option {
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1rem;
  }

  .quiz-word {
    font-size: 2rem;
  }

  .quiz-option {
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
  }
}
</style>
