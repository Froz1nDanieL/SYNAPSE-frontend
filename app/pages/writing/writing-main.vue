<template>
  <main class="writing-main-page">
    <section class="writing-rail" aria-labelledby="writing-title">
      <p class="rail-kicker">Writing Desk</p>
      <h1 id="writing-title">作文批改</h1>
      <p class="rail-copy">
        从题目、草稿到批改报告，把语法和拼写问题放在同一张清晰版面里。
      </p>

      <div class="rail-proof" aria-label="批改重点">
        <span>Grammar</span>
        <span>Spelling</span>
        <span>Rewrite</span>
      </div>

      <NuxtLink class="primary-entry" to="/writing/writing-essay">
        <span>开始写作</span>
        <Icon name="ph:arrow-right" aria-hidden="true" />
      </NuxtLink>
    </section>

    <section class="writing-board" aria-label="写作批改工作区">
      <div class="board-head">
        <div>
          <p class="board-date">{{ todayLabel }}</p>
          <h2>今日写作台</h2>
        </div>
        <NuxtLink class="ghost-entry" to="/writing/writing-correction">
          查看批改报告
        </NuxtLink>
      </div>

      <div class="feature-grid">
        <NuxtLink class="feature-card editor-card" to="/writing/writing-essay">
          <div class="card-topline">
            <span>Draft</span>
            <Icon name="ph:pen-nib" aria-hidden="true" />
          </div>
          <h3>写一篇可被精确批改的作文</h3>
          <p>
            输入题目和正文，系统会检查拼写、语法和整体表达。
          </p>
          <div class="manuscript-preview" aria-hidden="true">
            <span class="wide"></span>
            <span></span>
            <span class="short"></span>
          </div>
        </NuxtLink>

        <NuxtLink class="feature-card report-card" to="/writing/writing-correction">
          <div class="card-topline">
            <span>Report</span>
            <Icon name="ph:seal-check" aria-hidden="true" />
          </div>
          <h3>{{ lastScoreLabel }}</h3>
          <p>{{ lastResultCopy }}</p>
          <dl class="mini-score">
            <div>
              <dt>拼写</dt>
              <dd>{{ lastErrorWordCount }}</dd>
            </div>
            <div>
              <dt>语法</dt>
              <dd>{{ lastGrammarCount }}</dd>
            </div>
          </dl>
        </NuxtLink>

        <section class="feature-card topic-card">
          <div class="card-topline">
            <span>Prompts</span>
            <Icon name="ph:book-open-text" aria-hidden="true" />
          </div>
          <h3>可直接练的题目</h3>
          <div class="topic-list">
            <button
              v-for="topic in suggestedTopics"
              :key="topic"
              class="topic-button"
              type="button"
              @click="startWithTopic(topic)"
            >
              {{ topic }}
            </button>
          </div>
        </section>

        <section class="feature-card correction-sample">
          <div class="sample-line">
            <span class="wrong">I has a dreem.</span>
            <span class="right">I have a dream.</span>
          </div>
          <div class="margin-note">
            <strong>主谓一致</strong>
            <p>第一人称后使用 have，拼写 dream。</p>
          </div>
        </section>
      </div>

      <section class="history-section" aria-label="最近批改">
        <header class="section-title">
          <div>
            <h2>最近批改</h2>
            <p>每次提交都会生成一份独立报告</p>
          </div>
          <button class="text-action" type="button" @click="fetchReports">
            刷新
          </button>
        </header>

        <div v-if="isLoadingReports" class="history-list loading-list">
          <span v-for="item in 3" :key="item" class="history-skeleton"></span>
        </div>

        <div v-else-if="reports.length" class="history-list">
          <button
            v-for="item in reports"
            :key="item.id"
            class="history-item"
            type="button"
            @click="openReport(item)"
          >
            <span>{{ item.topic || "自由写作" }}</span>
            <strong>{{ reportScore(item) }}</strong>
            <small>{{ formatTime(item.correctTime || item.createTime) }}</small>
          </button>
        </div>

        <div v-else class="empty-history">
          <p>{{ reportError || "还没有批改记录。" }}</p>
          <NuxtLink to="/writing/writing-essay">写第一篇作文</NuxtLink>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  listMyEssayCorrectionReports,
  type EssayCorrectionReportVO,
} from "~/composables/api/essayCorrectionController";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "写作批改 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "英语作文批改工作台，支持语法纠错和拼写检查",
    },
  ],
});

const DRAFT_KEY = "msenWritingDraft";

const router = useRouter();
const reports = ref<EssayCorrectionReportVO[]>([]);
const isLoadingReports = ref(false);
const reportError = ref("");

const suggestedTopics = [
  "The habit that changed my study",
  "A city I would like to visit",
  "Should students use AI tools",
  "The value of reading every day",
];

const latestReport = computed(() => reports.value[0] || null);
const latestResult = computed(() => latestReport.value?.result || null);

const todayLabel = computed(() => {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const lastScoreLabel = computed(() => {
  if (!latestReport.value) return "等待第一份报告";
  return `${reportScore(latestReport.value)} 分`;
});

const lastResultCopy = computed(() => {
  if (!latestReport.value) {
    return "提交作文后，这里会显示最近一次批改的总分和错误数量。";
  }
  return latestResult.value?.summaryComment || "已生成批改报告。";
});

const lastErrorWordCount = computed(() => {
  return latestResult.value?.errorWords?.length ?? 0;
});

const lastGrammarCount = computed(() => {
  return latestResult.value?.grammarErrors?.length ?? 0;
});

function reportScore(item: EssayCorrectionReportVO) {
  return (
    item.score ??
    item.result?.dimensionScores?.totalScore ??
    "--"
  );
}

function startWithTopic(topic: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        topic,
        content: "",
        updatedAt: new Date().toISOString(),
      }),
    );
  }
  router.push("/writing/writing-essay");
}

function openReport(item: EssayCorrectionReportVO) {
  router.push({
    path: "/writing/writing-correction",
    query: item.id ? { id: item.id } : undefined,
  });
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

async function fetchReports() {
  isLoadingReports.value = true;
  reportError.value = "";

  try {
    const response = await listMyEssayCorrectionReports({
      current: 1,
      pageSize: 6,
    });
    const payload = response?.data;
    if (payload?.code === 0) {
      reports.value = payload.data?.records || [];
      return;
    }
    reportError.value = payload?.message || "读取报告失败。";
  } catch (error) {
    console.error("读取作文报告失败:", error);
    reportError.value = "后端服务暂时不可用。";
  } finally {
    isLoadingReports.value = false;
  }
}

onMounted(fetchReports);
</script>

<style scoped>
.writing-main-page {
  min-height: 100dvh;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.5fr);
  gap: clamp(2rem, 5vw, 5rem);
  padding: clamp(2rem, 5vw, 4.5rem);
  background:
    linear-gradient(90deg, rgba(40, 40, 40, 0.035) 1px, transparent 1px),
    var(--color-bg-primary);
  background-size: 3.5rem 3.5rem;
  color: var(--color-text-primary);
}

.writing-rail {
  position: sticky;
  top: clamp(2rem, 5vw, 4.5rem);
  align-self: start;
  min-height: calc(100dvh - clamp(4rem, 10vw, 9rem));
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-right: clamp(1rem, 3vw, 3rem);
  border-right: 1px solid var(--color-accent-secondary);
}

.rail-kicker,
.board-date,
.card-topline,
.mini-score dt,
.history-item span,
.history-item small,
.section-title p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.rail-kicker,
.board-date,
.card-topline,
.mini-score dt {
  text-transform: uppercase;
}

.writing-rail h1 {
  max-width: 7ch;
  margin: 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: clamp(4rem, 7vw, 7.8rem);
  font-weight: 700;
  line-height: 0.96;
}

.rail-copy {
  max-width: 25rem;
  margin: 0;
  font-size: clamp(1rem, 1.2vw, 1.16rem);
  line-height: 1.8;
  color: color-mix(in srgb, var(--color-text-primary) 72%, transparent);
}

.rail-proof {
  display: grid;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid var(--color-accent-secondary);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.8rem, 3vw, 3rem);
  line-height: 1;
}

.primary-entry,
.ghost-entry,
.feature-card,
.empty-history a {
  color: inherit;
  text-decoration: none;
}

.primary-entry {
  display: inline-flex;
  width: fit-content;
  min-height: 3rem;
  align-items: center;
  gap: 0.65rem;
  padding: 0 1.15rem;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  font-weight: 800;
  transition: transform 160ms ease, background-color 160ms ease;
}

.primary-entry:hover {
  background: #3a3935;
}

.primary-entry:active,
.ghost-entry:active,
.feature-card:active,
.history-item:active,
.text-action:active,
.topic-button:active {
  transform: translateY(1px);
}

.writing-board {
  min-width: 0;
}

.board-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-text-primary);
}

.board-head h2 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.8rem, 3vw, 3rem);
  line-height: 1;
}

.ghost-entry,
.text-action,
.topic-button {
  min-height: 2.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  cursor: pointer;
}

.ghost-entry:hover,
.text-action:hover,
.topic-button:hover {
  background: var(--color-accent-secondary);
}

.feature-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 1px;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.feature-card {
  min-height: 18rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: clamp(1.25rem, 2vw, 1.75rem);
  background: var(--color-bg-primary);
  transition: background-color 160ms ease, transform 160ms ease;
}

.feature-card:hover {
  background: #f7f5ef;
}

.editor-card {
  grid-row: span 2;
  min-height: 30rem;
}

.card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-topline :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-primary);
}

.feature-card h3 {
  max-width: 16ch;
  margin: 2rem 0 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: clamp(2rem, 3.6vw, 4.5rem);
  font-weight: 600;
  line-height: 1.05;
}

.feature-card p {
  max-width: 28rem;
  margin: 1rem 0 0;
  color: color-mix(in srgb, var(--color-text-primary) 68%, transparent);
  line-height: 1.7;
}

.manuscript-preview {
  display: grid;
  gap: 1rem;
  margin-top: auto;
  padding-top: 3rem;
}

.manuscript-preview span {
  height: 1px;
  background: var(--color-accent-secondary);
}

.manuscript-preview .wide {
  width: 92%;
}

.manuscript-preview .short {
  width: 58%;
}

.mini-score {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: auto 0 0;
  background: var(--color-accent-secondary);
  border: 1px solid var(--color-accent-secondary);
}

.mini-score div {
  padding: 1rem;
  background: var(--color-bg-primary);
}

.mini-score dd {
  margin: 0.5rem 0 0;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.topic-list {
  display: grid;
  gap: 0.65rem;
  margin-top: auto;
  padding-top: 2rem;
}

.topic-button {
  justify-content: flex-start;
  min-height: 3rem;
  text-align: left;
}

.correction-sample {
  min-height: 15rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.72fr);
  gap: 1px;
  padding: 0;
  background: var(--color-accent-secondary);
}

.sample-line,
.margin-note {
  display: grid;
  align-content: center;
  padding: 1.5rem;
  background: var(--color-bg-primary);
}

.wrong,
.right {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.6rem, 2.5vw, 3rem);
  line-height: 1.15;
}

.wrong {
  position: relative;
  width: fit-content;
  color: color-mix(in srgb, var(--color-text-primary) 46%, transparent);
}

.wrong::after {
  position: absolute;
  right: -0.2rem;
  bottom: 0.5em;
  left: -0.2rem;
  height: 2px;
  content: "";
  background: #8f3f35;
  transform: rotate(-3deg);
}

.right {
  margin-top: 1rem;
  color: #516b5b;
}

.margin-note {
  border-left: 3px solid #8f3f35;
}

.margin-note strong {
  font-size: 1rem;
}

.history-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-accent-secondary);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title h2 {
  margin: 0 0 0.45rem;
  font-size: 1.2rem;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.history-item,
.history-skeleton {
  min-width: 0;
  min-height: 8.8rem;
  border: 0;
  background: var(--color-bg-primary);
}

.history-item {
  display: grid;
  align-content: space-between;
  gap: 1rem;
  color: var(--color-text-primary);
  padding: 1.1rem;
  text-align: left;
  cursor: pointer;
}

.history-item:hover {
  background: #f7f5ef;
}

.history-item strong {
  font-size: 2.4rem;
  line-height: 1;
}

.history-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-list {
  min-height: 8.8rem;
}

.history-skeleton {
  display: block;
  background:
    linear-gradient(90deg, transparent, rgba(40, 40, 40, 0.05), transparent),
    var(--color-bg-primary);
  background-size: 220% 100%;
  animation: historyPulse 1.4s ease-in-out infinite;
}

.empty-history {
  min-height: 9rem;
  display: grid;
  place-items: center;
  gap: 0.75rem;
  border: 1px solid var(--color-accent-secondary);
  text-align: center;
}

.empty-history p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 64%, transparent);
}

.empty-history a {
  font-weight: 800;
  border-bottom: 1px solid currentColor;
}

@keyframes historyPulse {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}

@media (max-width: 1180px) {
  .writing-main-page {
    grid-template-columns: 1fr;
  }

  .writing-rail {
    position: static;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--color-accent-secondary);
    padding: 0 0 2rem;
  }

  .rail-proof {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 1rem;
  }
}

@media (max-width: 760px) {
  .writing-main-page {
    padding: 1.25rem;
  }

  .board-head,
  .section-title {
    align-items: stretch;
    flex-direction: column;
  }

  .feature-grid,
  .history-list,
  .correction-sample {
    grid-template-columns: 1fr;
  }

  .editor-card {
    min-height: 24rem;
  }

  .rail-proof {
    grid-template-columns: 1fr;
  }
}
</style>
