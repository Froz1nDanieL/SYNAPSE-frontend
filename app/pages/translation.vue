<template>
  <div class="translation-page">
    <div class="header-section">
      <h1>英汉互译</h1>
      <p class="subtitle">强大的双语翻译引擎，支持句子、段落翻译</p>
    </div>

    <div class="translation-container">
      <div class="input-section">
        <textarea
          v-model="sourceText"
          placeholder="请输入要翻译的文本..."
          class="text-input"
        ></textarea>
        <div class="char-count">{{ sourceText.length }}/5000</div>
      </div>

      <div class="controls-section">
        <button @click="swapLanguages" class="swap-button" title="交换语言">
          ⇄
        </button>
        <div class="language-selector">
          <select v-model="sourceLang" class="lang-select">
            <option value="ZH">中文</option>
            <option value="EN">English</option>
          </select>
          <span class="arrow">→</span>
          <select v-model="targetLang" class="lang-select">
            <option value="EN">English</option>
            <option value="ZH">中文</option>
          </select>
        </div>
        <button @click="translate" class="translate-button">翻译</button>
      </div>

      <div class="output-section">
        <textarea
          v-model="translatedText"
          readonly
          placeholder="翻译结果将显示在这里"
          class="text-output"
        ></textarea>
        <div class="actions">
          <button @click="copyToClipboard" class="copy-button">复制</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
  middleware: "auth",
});

useHead({
  title: "英汉互译 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "强大的双语翻译引擎，支持句子、段落翻译",
    },
  ],
});

const sourceText = ref("");
const translatedText = ref("");
const sourceLang = ref("ZH");
const targetLang = ref("EN");

const swapLanguages = () => {
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;

  const tempText = sourceText.value;
  sourceText.value = translatedText.value;
  translatedText.value = tempText;
};

const translate = () => {
  // 占位符 - 实际翻译功能将在后续实现
  if (sourceText.value.trim()) {
    translatedText.value =
      sourceLang.value === "ZH"
        ? "This is a sample translation result."
        : "这是一个示例翻译结果。";
  } else {
    translatedText.value = "";
  }
};

const copyToClipboard = async () => {
  if (translatedText.value) {
    await navigator.clipboard.writeText(translatedText.value);
    // 可以添加一个提示消息
  }
};
</script>

<style scoped>
.translation-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.header-section h1 {
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0 0 0.5rem;
  color: #333;
}

.subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.translation-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.input-section,
.output-section {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.text-input,
.text-output {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 0;
  padding: 1.5rem;
  font-size: 1.1rem;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #999;
}

.char-count {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  color: #999;
}

.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.swap-button {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 0;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.swap-button:hover {
  background: #f5f5f5;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-select {
  border: 1px solid #ddd;
  padding: 0.5rem;
  font-size: 1rem;
  background: #fff;
  border-radius: 0;
  outline: none;
}

.arrow {
  font-size: 1.2rem;
  color: #666;
}

.translate-button {
  padding: 0.75rem 2rem;
  background: #000;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.translate-button:hover {
  background: #333;
}

.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

.copy-button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .translation-page {
    padding: 1rem;
  }

  .controls-section {
    flex-direction: column;
    gap: 1rem;
  }

  .language-selector {
    order: -1;
  }
}
</style>
