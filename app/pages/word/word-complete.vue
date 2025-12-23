<template>
  <div class="container">
    <div class="header">
      <h1>学习完成</h1>
      <p class="subtitle">本次学习共 {{ learnRecords.length }} 个单词</p>
    </div>
    <div class="content">
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-number">{{ totalWords }}</span>
          <span class="stat-label">总单词数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ knownWords }}</span>
          <span class="stat-label">认识</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ unknownWords }}</span>
          <span class="stat-label">不认识</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalErrorCount }}</span>
          <span class="stat-label">错误次数</span>
        </div>
      </div>
      <div class="table-container">
        <table class="record-table">
          <thead>
            <tr>
              <th>单词</th>
              <th>音标</th>
              <th>翻译</th>
              <th>初印象</th>
              <th>错误次数</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(record, index) in displayRecords"
              :key="index"
              class="record-row"
            >
              <td class="word-cell">{{ record.word?.word || "-" }}</td>
              <td class="phonetic-cell">
                {{
                  record.word?.phonetic ? "/" + record.word.phonetic + "/" : "-"
                }}
              </td>
              <td
                class="translation-cell"
                v-html="formatTranslation(record.word?.translation)"
              ></td>
              <td class="firstknow-cell">
                <span
                  class="tag"
                  :class="
                    record.learnRecord.firstKnow === 1 ? 'known' : 'unknown'
                  "
                >
                  {{ record.learnRecord.firstKnow === 1 ? "认识" : "不认识" }}
                </span>
              </td>
              <td class="choice-cell">
                <span
                  class="tag"
                  :class="
                    record.learnRecord.choiceCorrect ? 'correct' : 'incorrect'
                  "
                >
                  {{ record.learnRecord.choiceErrorCount || 0 }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="button-container">
        <button class="primary-button" @click="goBack">返回学习计划</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// 学习记录数据
const learnRecords = ref<API.WordLearnRequest[]>([]);
// 单词数据
const wordsData = ref<API.WordCardVO[]>([]);
// 加载状态
const loading = ref(true);

// 从路由参数获取学习记录和单词数据
onMounted(() => {
  try {
    const learnRecordsParam = route.query.learnRecords;
    const wordsDataParam = route.query.wordsData;

    if (learnRecordsParam && typeof learnRecordsParam === "string") {
      const parsedRecords = JSON.parse(decodeURIComponent(learnRecordsParam));
      learnRecords.value = parsedRecords as API.WordLearnRequest[];
      console.log("解析后的学习记录:", learnRecords.value);
    }

    if (wordsDataParam && typeof wordsDataParam === "string") {
      const parsedWords = JSON.parse(decodeURIComponent(wordsDataParam));
      wordsData.value = parsedWords as API.WordCardVO[];
      console.log("解析后的单词数据:", wordsData.value);
    }
  } catch (error) {
    console.error("解析数据失败:", error);
  } finally {
    loading.value = false;
  }
});

// 合并学习记录和单词详情
const displayRecords = computed(() => {
  const records = learnRecords.value.map((record) => {
    const wordId = record.wordId;
    // 从wordsData中查找对应的单词
    const word = wordsData.value.find((w) => w.wordId === wordId);
    return {
      learnRecord: record,
      word,
    };
  });
  console.log("合并后的显示记录:", records);
  return records;
});

// 统计信息
const totalWords = computed(() => learnRecords.value.length);
const knownWords = computed(
  () => learnRecords.value.filter((record) => record.firstKnow === 1).length
);
const unknownWords = computed(
  () => learnRecords.value.filter((record) => record.firstKnow === 0).length
);
const correctChoices = computed(
  () =>
    learnRecords.value.filter((record) => record.choiceCorrect === true).length
);

// 统计总错误次数
const totalErrorCount = computed(() =>
  learnRecords.value.reduce((total, record) => {
    return total + (record.choiceErrorCount || 0);
  }, 0)
);

// 只取翻译中第一个换行符之前的内容
function formatTranslation(translation?: string): string {
  if (!translation) return "-";
  if (typeof translation !== "string") return "-";

  // 同时处理实际换行符和转义的\n字符
  const actualNewlineIndex = translation.indexOf("\n");
  const escapedNewlineIndex = translation.indexOf("\\n");

  // 找到最早出现的换行符位置
  let newlineIndex = -1;
  if (actualNewlineIndex !== -1 && escapedNewlineIndex !== -1) {
    newlineIndex = Math.min(actualNewlineIndex, escapedNewlineIndex);
  } else if (actualNewlineIndex !== -1) {
    newlineIndex = actualNewlineIndex;
  } else if (escapedNewlineIndex !== -1) {
    newlineIndex = escapedNewlineIndex;
  }

  const result =
    newlineIndex === -1 ? translation : translation.substring(0, newlineIndex);
  return result;
}

// 返回学习计划页面
function goBack() {
  router.push("/word");
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #000066;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 120px;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #000066;
  margin-bottom: 0.5rem;
}

.stat-label {
  display: block;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.table-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.record-table {
  width: 100%;
  border-collapse: collapse;
}

.record-table th {
  background-color: #f5f5f5;
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.record-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  color: #333;
}

.record-row:hover {
  background-color: #fafafa;
}

.word-cell {
  font-weight: 600;
  color: #000066;
}

.phonetic-cell {
  color: #666;
  font-style: italic;
}

.translation-cell {
  max-width: 300px;
}

.tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.tag.known,
.tag.correct {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.tag.unknown,
.tag.incorrect {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.primary-button {
  background-color: #000066;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background-color: #00004d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 66, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .stats-card {
    flex-direction: column;
    align-items: center;
  }

  .stat-item {
    min-width: auto;
  }

  .table-container {
    overflow-x: auto;
  }

  .record-table {
    min-width: 600px;
  }

  .record-table th,
  .record-table td {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
