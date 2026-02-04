<template>
  <div class="translate-container">
    <div class="translate-wrapper">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">英汉互译</h1>
        <p class="page-subtitle">精准翻译，畅通无阻</p>
      </div>

      <!-- 翻译主区域 -->
      <div class="translate-card">
        <!-- 语言选择栏 -->
        <div class="lang-selector">
          <div class="lang-item active">
            <span class="lang-text">{{
              sourceLang === "zh" ? "中文" : "英语"
            }}</span>
          </div>

          <button
            class="swap-btn"
            @click="swapLanguages"
            :disabled="isTranslating"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 16V4M7 4L3 8M7 4L11 8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 8V20M17 20L21 16M17 20L13 16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div class="lang-item">
            <span class="lang-text">{{
              targetLang === "zh" ? "中文" : "英语"
            }}</span>
          </div>
        </div>

        <!-- 输入输出区域 -->
        <div class="translate-area">
          <!-- 输入框 -->
          <div class="input-section">
            <textarea
              v-model="inputText"
              class="translate-input"
              :placeholder="
                sourceLang === 'zh'
                  ? '请输入要翻译的中文'
                  : 'Enter English text to translate'
              "
              @keydown.enter.prevent="handleEnter"
            ></textarea>
            <div class="input-actions">
              <span class="char-count">{{ inputText.length }} / 5000</span>
              <button v-if="inputText" class="clear-btn" @click="clearInput">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="divider"></div>

          <!-- 输出框 -->
          <div class="output-section">
            <div v-if="isTranslating" class="loading-state">
              <div class="loading-spinner"></div>
              <span>翻译中...</span>
            </div>
            <div v-else-if="translatedText" class="output-content">
              <p class="translated-text">{{ translatedText }}</p>
            </div>
            <div v-else class="placeholder-state">
              <span>翻译结果将显示在这里</span>
            </div>

            <!-- 输出操作按钮 -->
            <div v-if="translatedText && !isTranslating" class="output-actions">
              <button class="action-btn" @click="copyResult" title="复制结果">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 翻译按钮 -->
        <div class="translate-actions">
          <button
            class="translate-btn"
            @click="handleTranslate"
            :disabled="!inputText.trim() || isTranslating"
          >
            <span v-if="isTranslating">翻译中...</span>
            <span v-else>翻 译</span>
          </button>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="history.length > 0" class="history-section">
        <div class="history-header">
          <h3 class="history-title">最近翻译</h3>
          <button class="clear-history" @click="clearHistory">清空历史</button>
        </div>
        <div class="history-list">
          <div
            v-for="(item, index) in history"
            :key="index"
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <div class="history-lang">
              <span class="lang-tag">{{
                item.from === "zh" ? "中" : "EN"
              }}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="lang-tag">{{ item.to === "zh" ? "中" : "EN" }}</span>
            </div>
            <p class="history-source">{{ item.source }}</p>
            <p class="history-target">{{ item.target }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  translateToEnglish,
  translateToChinese,
} from "~/composables/api/translateController";

definePageMeta({
  layout: "default",
});

useHead({
  title: "英汉互译 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "英汉互译 - 精准翻译工具",
    },
  ],
});

// 状态
const inputText = ref("");
const translatedText = ref("");
const sourceLang = ref("zh");
const targetLang = ref("en");
const isTranslating = ref(false);
const history = ref([]);
const toast = ref({
  show: false,
  message: "",
  type: "success",
});

// 计算属性
const canTranslate = computed(() => {
  return inputText.value.trim().length > 0 && !isTranslating.value;
});

// 显示提示
function showToast(message, type = "success") {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 2000);
}

// 切换语言
function swapLanguages() {
  const temp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;

  // 清空翻译结果，保留输入文本，让用户可以重新翻译
  translatedText.value = "";
}

// 清空输入
function clearInput() {
  inputText.value = "";
  translatedText.value = "";
}

// 处理回车键
function handleEnter(event) {
  if (!event.shiftKey && canTranslate.value) {
    handleTranslate();
  }
}

// 执行翻译
async function handleTranslate() {
  const text = inputText.value.trim();
  if (!text || isTranslating.value) return;

  isTranslating.value = true;
  translatedText.value = "";

  try {
    let response;

    if (sourceLang.value === "zh") {
      // 中文翻译成英文
      response = await translateToEnglish({ text });
    } else {
      // 英文翻译成中文
      response = await translateToChinese({ text });
    }

    if (response.data && response.data.code === 0) {
      const result = response.data.data;
      if (result.trans_result && result.trans_result.length > 0) {
        translatedText.value = result.trans_result[0].dst;
        addToHistory(text, translatedText.value);
      } else {
        showToast("翻译失败，请重试", "error");
      }
    } else {
      showToast(response.data?.message || "翻译失败，请重试", "error");
    }
  } catch (error) {
    console.error("翻译错误:", error);
    showToast("网络错误，请检查网络连接", "error");
  } finally {
    isTranslating.value = false;
  }
}

// 添加到历史记录
function addToHistory(source, target) {
  const item = {
    source,
    target,
    from: sourceLang.value,
    to: targetLang.value,
    time: Date.now(),
  };

  // 避免重复
  history.value = history.value.filter((h) => h.source !== source);
  history.value.unshift(item);

  // 最多保存10条
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10);
  }

  // 保存到本地存储
  localStorage.setItem("translateHistory", JSON.stringify(history.value));
}

// 从历史记录加载
function loadFromHistory(item) {
  sourceLang.value = item.from;
  targetLang.value = item.to;
  inputText.value = item.source;
  translatedText.value = item.target;
}

// 清空历史记录
function clearHistory() {
  history.value = [];
  localStorage.removeItem("translateHistory");
}

// 复制结果
async function copyResult() {
  try {
    await navigator.clipboard.writeText(translatedText.value);
    showToast("已复制到剪贴板");
  } catch (err) {
    showToast("复制失败", "error");
  }
}

// 加载历史记录
onMounted(() => {
  const saved = localStorage.getItem("translateHistory");
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch (e) {
      console.error("解析历史记录失败:", e);
    }
  }
});
</script>

<style scoped>
.translate-container {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1.5rem;
}

.translate-wrapper {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--color-text-primary);
  opacity: 0.6;
  margin: 0;
}

/* 翻译卡片 */
.translate-card {
  background-color: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 语言选择器 */
.lang-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #fafafa;
}

.lang-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  background-color: transparent;
  transition: all 0.3s ease;
}

.lang-item.active {
  background-color: var(--color-text-primary);
}

.lang-item.active .lang-text {
  color: #fff;
}

.lang-item:not(.active) {
  background-color: var(--color-accent-secondary);
}

.lang-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.lang-item.active .lang-text {
  color: #fff;
}

.swap-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: var(--color-accent-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.swap-btn:hover:not(:disabled) {
  background-color: var(--color-text-primary);
  color: #fff;
  transform: rotate(180deg);
}

.swap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 翻译区域 */
.translate-area {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  min-height: 280px;
}

.input-section,
.output-section {
  position: relative;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.divider {
  width: 1px;
  background-color: rgba(0, 0, 0, 0.08);
  margin: 1.5rem 0;
}

/* 输入框 */
.translate-input {
  width: 100%;
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  background: transparent;
  font-family: inherit;
}

.translate-input::placeholder {
  color: rgba(40, 40, 40, 0.35);
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.char-count {
  font-size: 0.75rem;
  color: rgba(40, 40, 40, 0.4);
}

.clear-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: rgba(40, 40, 40, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: rgba(0, 0, 0, 0.06);
  color: var(--color-text-primary);
}

/* 输出区域 */
.output-content {
  flex: 1;
}

.translated-text {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(40, 40, 40, 0.5);
  font-size: 0.875rem;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.placeholder-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(40, 40, 40, 0.3);
  font-size: 0.9375rem;
}

.output-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background-color: transparent;
  color: rgba(40, 40, 40, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--color-accent-secondary);
  color: var(--color-text-primary);
}

/* 翻译按钮 */
.translate-actions {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #fafafa;
}

.translate-btn {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  background-color: var(--color-text-primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.translate-btn:hover:not(:disabled) {
  background-color: #3a3a3a;
  transform: translateY(-1px);
}

.translate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.translate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 历史记录 */
.history-section {
  background-color: #fff;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.clear-history {
  font-size: 0.8125rem;
  color: rgba(40, 40, 40, 0.5);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-history:hover {
  color: var(--color-text-primary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  padding: 1rem 1.25rem;
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background-color: var(--color-accent-secondary);
  transform: translateX(4px);
}

.history-lang {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.lang-tag {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(40, 40, 40, 0.5);
  padding: 0.125rem 0.375rem;
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}

.history-source {
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-target {
  font-size: 0.875rem;
  color: rgba(40, 40, 40, 0.6);
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Toast 提示 */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background-color: var(--color-text-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.toast.error {
  background-color: #dc2626;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .translate-container {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .translate-area {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto 1fr;
  }

  .divider {
    width: auto;
    height: 1px;
    margin: 0 1.5rem;
  }

  .input-section,
  .output-section {
    min-height: 180px;
  }

  .translate-input,
  .translated-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .lang-selector {
    padding: 1rem;
    gap: 0.75rem;
  }

  .lang-item {
    padding: 0.4rem 1rem;
  }

  .lang-text {
    font-size: 0.875rem;
  }

  .input-section,
  .output-section {
    padding: 1rem;
    min-height: 150px;
  }

  .translate-btn {
    padding: 0.875rem 1.5rem;
  }

  .history-section {
    padding: 1rem;
  }
}
</style>
