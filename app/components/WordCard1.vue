<template>
  <div class="word-card" @click="toggleFlip" v-if="word">
    <div class="card-front" :class="{ hidden: isFlipped }">
      <div class="collect-button">
        <CollectCheck v-model="isCollected" />
      </div>
      <div class="card-content">
        <div class="word-container">
          <div class="word">{{ word.word }}</div>
          <div class="pronunciation-buttons">
            <SpeakerButton :word="word.word" :type="1" size="20px" />
            <SpeakerButton :word="word.word" :type="2" size="20px" />
          </div>
        </div>
        <div class="phonetic">/{{ word.phonetic }}/</div>
        <div class="memory-level" @click.stop>
          <KnowLevelButtons
            v-model="localFirstKnow"
            @update:modelValue="handleFirstKnowChange"
            @next="handleNextWord"
          />
        </div>
      </div>
    </div>
    <div class="card-back" :class="{ hidden: !isFlipped }">
      <div class="meaning">
        <h3>释义</h3>
        <div class="definition" v-html="formatText(word.definition)"></div>
        <div class="translation" v-html="formatText(word.translation)"></div>
      </div>
      <div class="exchange" v-if="word.exchangeInfo">
        <h3>词形变化</h3>
        <div class="exchange-list">
          <div class="exchange-item" v-if="word.exchangeInfo.plurals">
            <span class="exchange-label">复数:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.plurals)"
            ></span>
          </div>
          <div class="exchange-item" v-if="word.exchangeInfo.pastTense">
            <span class="exchange-label">过去式:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.pastTense)"
            ></span>
          </div>
          <div class="exchange-item" v-if="word.exchangeInfo.presentParticiple">
            <span class="exchange-label">现在分词:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.presentParticiple)"
            ></span>
          </div>
          <div class="exchange-item" v-if="word.exchangeInfo.pastParticiple">
            <span class="exchange-label">过去分词:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.pastParticiple)"
            ></span>
          </div>
          <div
            class="exchange-item"
            v-if="word.exchangeInfo.thirdPersonSingular"
          >
            <span class="exchange-label">第三人称单数:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.thirdPersonSingular)"
            ></span>
          </div>
          <div class="exchange-item" v-if="word.exchangeInfo.comparative">
            <span class="exchange-label">比较级:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.comparative)"
            ></span>
          </div>
          <div class="exchange-item" v-if="word.exchangeInfo.superlative">
            <span class="exchange-label">最高级:</span>
            <span
              class="exchange-value"
              v-html="formatText(word.exchangeInfo.superlative)"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="word-card-placeholder">
    <div class="loading-text">加载中...</div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { toggleCollect } from "~/composables/api/wordLearnController";
import CollectCheck from "./CollectCheck.vue";
import KnowLevelButtons from "./KnowLevelButtons.vue";
import SpeakerButton from "./SpeakerButton.vue";

const props = defineProps({
  word: {
    type: Object,
    required: false,
    default: null,
  },
  flipped: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["flip", "collectChange", "firstKnowChange", "next"]);

const isFlipped = ref(props.flipped);
// 确保isCollect有明确的值，避免null
const collectStatus = props.word ? (props.word.isCollect === 1 ? 1 : 0) : 0;
// 更新props.word中的isCollect字段，确保数据一致性
if (props.word) {
  props.word.isCollect = collectStatus;
}
const isCollected = ref(collectStatus === 1);

// 使用KnowLevelButtons组件来收集firstKnow状态
const localFirstKnow = ref(undefined);

// 监听外部flipped属性变化
watch(
  () => props.flipped,
  (newVal) => {
    isFlipped.value = newVal;
  }
);

// 监听word属性变化，更新收藏状态和重置认识度标记
watch(
  () => props.word,
  (newWord) => {
    if (newWord) {
      // 确保isCollect有明确的值，避免null
      const collectStatus = newWord.isCollect === 1 ? 1 : 0;
      isCollected.value = collectStatus === 1;

      // 更新props.word中的isCollect字段，确保数据一致性
      newWord.isCollect = collectStatus;
    }
    // 重置认识度标记
    localFirstKnow.value = undefined;
  },
  { immediate: true }
);

// 处理认识度标记变化
function handleFirstKnowChange(value) {
  localFirstKnow.value = value;
  emit("firstKnowChange", value);
}

// 处理跳转到下一个单词
function handleNextWord() {
  emit("next");
}

function toggleFlip() {
  isFlipped.value = !isFlipped.value;
  emit("flip", isFlipped.value);
}

// 监听isCollected变化，触发收藏请求
watch(
  () => isCollected.value,
  async (newVal) => {
    try {
      console.log("收藏状态变化:", newVal);

      await toggleCollect({
        wordId: props.word.wordId,
        wordType: props.word.wordType,
        isCollect: newVal ? 1 : 0,
      });

      // 更新props.word中的isCollect字段，确保数据一致性
      const updatedWord = { ...props.word, isCollect: newVal ? 1 : 0 };
      console.log("更新后的单词数据:", updatedWord);

      emit("collectChange", updatedWord);
    } catch (error) {
      console.error("收藏/取消收藏失败:", error);
      // 发生错误时恢复原状态
      isCollected.value = !newVal;
    }
  }
);

// 处理收藏按钮点击事件（不再直接发送请求，仅用于调试）
function handleCollect() {
  console.log("收藏按钮被点击");
}

// 解析换行符为<br>标签
function formatText(text) {
  if (!text) return "";
  // 先处理转义的换行符\n为实际换行符
  text = text.replace(/\\n/g, "\n");
  // 然后将所有类型的换行符转换为<br>
  return text.replace(/\r?\n/g, "<br>");
}
</script>

<style scoped>
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

.card-front,
.card-back {
  position: absolute;
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
}

.card-front.hidden,
.card-back.hidden {
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  z-index: -1;
}

.card-front {
  background: #f6f6f6;
  position: relative;
  z-index: 2;
}

.collect-button {
  position: absolute;
  top: 2rem;
  right: 2rem;
  cursor: pointer;
  z-index: 10;
  transform: scale(0.8);
}

.collect-button label {
  cursor: pointer;
}

.card-back {
  background: #ffffff;
  align-items: flex-start;
  text-align: left;
  padding: 2rem;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.word {
  font-size: 3.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
  line-height: 1;
  text-align: center;
}

.word-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.pronunciation-buttons {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
}

.phonetic {
  font-size: 1.3rem;
  color: #666;
  font-style: italic;
  line-height: 1;
  text-align: center;
}

.card-content {
  text-align: center;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.meaning,
.example {
  margin-bottom: 2rem;
  width: 100%;
}

.meaning h3,
.example h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meaning ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.meaning li {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.definition {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  font-style: italic;
}

.translation {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.exchange {
  margin-top: 1.5rem;
}

.exchange h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.memory-level {
  margin-top: 1.5rem;
  width: 100%;
  text-align: center;
}

.memory-level .radio-inputs {
  margin: 0 auto;
}

.exchange-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.exchange-item {
  background: #f6f6f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.exchange-label {
  font-weight: 600;
  color: #555;
  margin-right: 0.5rem;
}

.exchange-value {
  color: #333;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
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

  .pronunciation-buttons {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
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

  .pronunciation-buttons {
    gap: 0.8rem;
  }
}

/* 占位符样式 */
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
</style>
