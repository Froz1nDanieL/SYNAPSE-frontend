<template>
  <main class="complete-page">
    <aside class="result-panel">
      <p class="eyebrow">Complete</p>
      <h1>学习完成</h1>
      <p class="subtitle">本次学习 {{ learnRecords.length }} 个单词</p>

      <dl class="stats-list">
        <div>
          <dt>总数</dt>
          <dd>{{ totalWords }}</dd>
        </div>
        <div>
          <dt>认识</dt>
          <dd>{{ knownWords }}</dd>
        </div>
        <div>
          <dt>不认识</dt>
          <dd>{{ unknownWords }}</dd>
        </div>
        <div>
          <dt>错误次数</dt>
          <dd>{{ totalErrorCount }}</dd>
        </div>
      </dl>

      <button class="primary-button" @click="goBack">返回学习计划</button>
    </aside>

    <section class="record-panel">
      <div v-if="loading" class="state-block">加载中...</div>
      <div v-else class="table-wrap">
        <table class="record-table">
          <thead>
            <tr>
              <th>单词</th>
              <th>音标</th>
              <th>翻译</th>
              <th>初印象</th>
              <th>错误</th>
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
              <td>
                <span
                  class="tag"
                  :class="
                    record.learnRecord.firstKnow === 1 ? 'known' : 'unknown'
                  "
                >
                  {{ record.learnRecord.firstKnow === 1 ? "认识" : "不认识" }}
                </span>
              </td>
              <td>
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
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const learnRecords = ref<API.WordLearnRequest[]>([]);
const wordsData = ref<API.WordCardVO[]>([]);
const loading = ref(true);

onMounted(() => {
  try {
    const learnRecordsParam = route.query.learnRecords;
    const wordsDataParam = route.query.wordsData;

    if (learnRecordsParam && typeof learnRecordsParam === "string") {
      const parsedRecords = JSON.parse(decodeURIComponent(learnRecordsParam));
      learnRecords.value = parsedRecords as API.WordLearnRequest[];
    }

    if (wordsDataParam && typeof wordsDataParam === "string") {
      const parsedWords = JSON.parse(decodeURIComponent(wordsDataParam));
      wordsData.value = parsedWords as API.WordCardVO[];
    }
  } catch (error) {
    console.error("解析学习结果失败:", error);
  } finally {
    loading.value = false;
  }
});

const displayRecords = computed(() => {
  return learnRecords.value.map((record) => {
    const word = wordsData.value.find((w) => w.wordId === record.wordId);
    return {
      learnRecord: record,
      word,
    };
  });
});

const totalWords = computed(() => learnRecords.value.length);
const knownWords = computed(
  () => learnRecords.value.filter((record) => record.firstKnow === 1).length
);
const unknownWords = computed(
  () => learnRecords.value.filter((record) => record.firstKnow === 0).length
);
const totalErrorCount = computed(() =>
  learnRecords.value.reduce((total, record) => {
    return total + (record.choiceErrorCount || 0);
  }, 0)
);

function formatTranslation(translation?: string): string {
  if (!translation || typeof translation !== "string") return "-";

  const actualNewlineIndex = translation.indexOf("\n");
  const escapedNewlineIndex = translation.indexOf("\\n");

  let newlineIndex = -1;
  if (actualNewlineIndex !== -1 && escapedNewlineIndex !== -1) {
    newlineIndex = Math.min(actualNewlineIndex, escapedNewlineIndex);
  } else if (actualNewlineIndex !== -1) {
    newlineIndex = actualNewlineIndex;
  } else if (escapedNewlineIndex !== -1) {
    newlineIndex = escapedNewlineIndex;
  }

  return newlineIndex === -1
    ? translation
    : translation.substring(0, newlineIndex);
}

function goBack() {
  router.push("/word/word-main");
}
</script>

<style scoped>
.complete-page {
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(240px, 18rem) minmax(620px, 1fr);
  gap: 3rem;
  padding: 3rem 6vw;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.result-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
  overflow: hidden;
}

.eyebrow {
  margin: 0;
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

.subtitle {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  opacity: 0.72;
}

.stats-list {
  display: grid;
  gap: 0;
  margin: 1rem 0 0;
}

.stats-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.stats-list div:first-child {
  border-top: 1px solid var(--color-accent-secondary);
}

dt,
dd {
  margin: 0;
}

dt {
  font-size: 0.875rem;
  opacity: 0.64;
}

dd {
  font-size: 1.5rem;
  font-weight: 800;
}

.primary-button {
  min-height: 3rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.record-panel {
  min-width: 0;
  min-height: 0;
  align-self: start;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 8px;
  overflow: hidden;
  max-height: 100%;
}

.state-block {
  min-height: 24rem;
  display: grid;
  place-items: center;
  opacity: 0.72;
}

.table-wrap {
  width: 100%;
  max-height: calc(100vh - 6rem);
  overflow: auto;
}

.record-table {
  width: 100%;
  min-width: 48rem;
  border-collapse: collapse;
}

.record-table th,
.record-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-accent-secondary);
  color: var(--color-text-primary);
}

.record-table th {
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
  opacity: 0.64;
}

.record-table tbody tr:last-child td {
  border-bottom: 0;
}

.record-row:hover {
  background: var(--color-accent-secondary);
}

.word-cell {
  font-size: 1rem;
  font-weight: 800;
}

.phonetic-cell,
.translation-cell {
  opacity: 0.72;
}

.translation-cell {
  max-width: 20rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.875rem;
  padding: 0 0.625rem;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
}

.tag.known,
.tag.correct {
  border-color: var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.tag.unknown,
.tag.incorrect {
  background: transparent;
  color: var(--color-text-primary);
}

@media (max-width: 980px) {
  .complete-page {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
    overflow-y: auto;
    align-content: start;
  }

  .result-panel {
    overflow: visible;
  }

  .record-panel {
    max-height: none;
  }

  .table-wrap {
    max-height: none;
  }
}

@media (max-width: 560px) {
  .complete-page {
    padding: 1rem;
  }

  h1 {
    font-size: 2.25rem;
  }
}
</style>
