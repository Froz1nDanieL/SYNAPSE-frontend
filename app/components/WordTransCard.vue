<template>
  <div class="word-trans-card" v-if="wordData">
    <div class="card-header">
      <h3 class="word">{{ wordData.word }}</h3>
      <span class="phonetic" v-if="wordData.phonetic"
        >[{{ wordData.phonetic }}]</span
      >
    </div>

    <div class="card-body">
      <div class="pos-trans" v-if="wordData.pos">
        <span class="pos">{{ wordData.pos }}</span>
        <span
          class="translation"
          v-html="formatText(wordData.translation)"
        ></span>
      </div>

      <div class="definition" v-if="wordData.translation">
        <h4>释义</h4>
        <p v-html="formatText(wordData.translation)"></p>
      </div>

      <div class="exchange-info" v-if="wordData.exchangeInfo">
        <h4>词形变化</h4>
        <ul>
          <li v-if="wordData.exchangeInfo.plurals">
            复数: {{ wordData.exchangeInfo.plurals }}
          </li>
          <li v-if="wordData.exchangeInfo.pastTense">
            过去式: {{ wordData.exchangeInfo.pastTense }}
          </li>
          <li v-if="wordData.exchangeInfo.presentParticiple">
            现在分词: {{ wordData.exchangeInfo.presentParticiple }}
          </li>
          <li v-if="wordData.exchangeInfo.pastParticiple">
            过去分词: {{ wordData.exchangeInfo.pastParticiple }}
          </li>
          <li v-if="wordData.exchangeInfo.thirdPersonSingular">
            第三人称单数: {{ wordData.exchangeInfo.thirdPersonSingular }}
          </li>
          <li v-if="wordData.exchangeInfo.comparative">
            比较级: {{ wordData.exchangeInfo.comparative }}
          </li>
          <li v-if="wordData.exchangeInfo.superlative">
            最高级: {{ wordData.exchangeInfo.superlative }}
          </li>
        </ul>
      </div>
    </div>

    <div class="card-footer">
      <span class="collins" v-if="wordData.collins"
        >柯林斯 {{ wordData.collins }} 星</span
      >
      <span class="oxford" v-if="wordData.oxford">牛津 3000</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  wordData: {
    type: Object,
    default: null,
  },
});

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
.word-trans-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 300px;
  max-width: 400px;
  position: absolute;
  z-index: 1000;
  animation: slideDown 0.3s ease forwards;
}

/* 进入动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.word {
  font-size: 1.5rem;
  font-weight: 700;
  margin-right: 0.75rem;
  color: #333;
}

.phonetic {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.card-body {
  margin-bottom: 0.75rem;
}

.pos-trans {
  margin-bottom: 0.75rem;
}

.pos {
  font-size: 0.8rem;
  color: #0066cc;
  background-color: #e6f2ff;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  margin-right: 0.5rem;
}

.translation {
  font-size: 1rem;
  color: #333;
}

.definition {
  margin-bottom: 0.75rem;
}

.definition h4,
.exchange-info h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.3rem;
}

.definition p {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
}

.exchange-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exchange-info li {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.2rem;
}

.card-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.collins,
.oxford {
  padding: 0.1rem 0.4rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
