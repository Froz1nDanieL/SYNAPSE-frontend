<template>
  <main class="correction-page">
    <header class="report-topbar">
      <NuxtLink class="back-link" to="/writing/writing-main">
        <Icon name="ph:arrow-left" aria-hidden="true" />
        <span>返回写作台</span>
      </NuxtLink>
      <div class="topbar-actions">
        <button
          class="quiet-button"
          type="button"
          :disabled="!canCopyCorrectedContent"
          @click="copyCorrectedContent"
        >
          复制修正文
        </button>
        <NuxtLink class="primary-link" to="/writing/writing-essay">
          重新写作
        </NuxtLink>
      </div>
    </header>

    <section v-if="!activeReport && !isLoadingList" class="empty-report">
      <p class="report-kicker">Correction Report</p>
      <h1>还没有可查看的批改报告。</h1>
      <p>{{ reportError || "先提交一篇英文作文，系统会在这里生成语法、拼写和修正文报告。" }}</p>
      <NuxtLink to="/writing/writing-essay">去写作文</NuxtLink>
    </section>

    <section v-else class="report-workspace">
      <aside class="report-index" aria-label="作文报告列表">
        <div class="index-head">
          <p class="report-kicker">Report Archive</p>
          <h2>批改档案</h2>
          <span>{{ totalLabel }}</span>
        </div>

        <div v-if="isLoadingList" class="index-loading">
          <span v-for="item in 4" :key="item"></span>
        </div>

        <div v-else class="report-list">
          <button
            v-for="item in reports"
            :key="item.id"
            class="report-list-item"
            :class="{ active: item.id === activeReport?.id }"
            type="button"
            @click="openReport(item)"
          >
            <span class="report-topic">{{ item.topic || "自由写作" }}</span>
            <strong>{{ reportScore(item) }}</strong>
            <small>{{ formatTime(item.correctTime || item.createTime) }}</small>
            <em>{{ statusText(item.correctStatus) }}</em>
          </button>
        </div>

        <button class="refresh-button" type="button" @click="loadReports">
          <Icon name="ph:arrows-clockwise" aria-hidden="true" />
          <span>刷新列表</span>
        </button>
      </aside>

      <section class="report-body">
        <div v-if="isLoadingReport" class="report-loading" role="status">
          正在读取报告
        </div>

        <template v-if="activeReport">
          <section class="report-hero" aria-labelledby="report-title">
            <div>
              <p class="report-kicker">Correction Report</p>
              <h1 id="report-title">{{ activeReport.topic || "自由写作" }}</h1>
              <p class="summary-copy">
                {{ result.summaryComment || statusSummary }}
              </p>
              <dl class="report-meta">
                <div>
                  <dt>提交时间</dt>
                  <dd>{{ formatFullTime(activeReport.createTime) || "--" }}</dd>
                </div>
                <div>
                  <dt>单词数</dt>
                  <dd>{{ activeReport.wordCount ?? "--" }}</dd>
                </div>
                <div>
                  <dt>状态</dt>
                  <dd>{{ statusText(activeReport.correctStatus) }}</dd>
                </div>
              </dl>
            </div>

            <aside class="score-stamp" aria-label="总分">
              <span>{{ totalScore }}</span>
              <small>满分 {{ activeReport.fullScore ?? 100 }}</small>
            </aside>
          </section>

          <section class="score-grid" aria-label="四维评分">
            <article v-for="item in scoreItems" :key="item.label" class="score-card">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <small>{{ item.tip }}</small>
            </article>
          </section>

          <section class="essay-review-shell">
            <article class="essay-paper" aria-label="作文正文">
              <header class="paper-toolbar">
                <div>
                  <p>Essay Text</p>
                  <h2>{{ viewMode === "corrected" ? "修正后全文" : "原文" }}</h2>
                </div>
                <div class="segmented-control" aria-label="切换作文版本">
                  <button
                    type="button"
                    :class="{ active: viewMode === 'original' }"
                    @click="viewMode = 'original'"
                  >
                    原文
                  </button>
                  <button
                    type="button"
                    :class="{ active: viewMode === 'corrected' }"
                    @click="viewMode = 'corrected'"
                  >
                    修正文
                  </button>
                </div>
              </header>

              <div v-if="displayedParagraphs.length" class="essay-content">
                <p
                  v-for="(paragraph, index) in displayedParagraphs"
                  :key="`${viewMode}-${index}`"
                >
                  {{ paragraph }}
                </p>
              </div>
              <div v-else class="quiet-state">
                暂无可展示正文。
              </div>
            </article>

            <aside class="margin-column" aria-label="批改摘要">
              <section class="margin-note red-note">
                <strong>{{ spellingIssues.length }}</strong>
                <span>拼写和词形问题</span>
              </section>
              <section class="margin-note green-note">
                <strong>{{ grammarIssues.length }}</strong>
                <span>语法问题</span>
              </section>
              <section class="margin-note ink-note">
                <strong>{{ recommendedWords.length }}</strong>
                <span>词汇升级建议</span>
              </section>
            </aside>
          </section>

          <section class="issue-layout" aria-label="详细批改">
            <article class="issue-panel">
              <header>
                <Icon name="ph:spell-check" aria-hidden="true" />
                <h2>拼写错误</h2>
              </header>

              <div v-if="spellingIssues.length" class="issue-list">
                <section
                  v-for="(item, index) in spellingIssues"
                  :key="`${item.originalWord}-${index}`"
                  class="issue-item"
                >
                  <div class="word-change">
                    <span class="wrong-word">{{ item.originalWord }}</span>
                    <Icon name="ph:arrow-right" aria-hidden="true" />
                    <span class="right-word">{{ item.correctWord }}</span>
                  </div>
                  <p>{{ item.context }}</p>
                  <small>{{ item.suggestion || "建议替换为正确拼写。" }}</small>
                </section>
              </div>

              <div v-else class="quiet-state">
                没有发现明显拼写错误。
              </div>
            </article>

            <article class="issue-panel grammar-panel">
              <header>
                <Icon name="ph:brackets-curly" aria-hidden="true" />
                <h2>语法错误</h2>
              </header>

              <div v-if="grammarIssues.length" class="issue-list">
                <section
                  v-for="(item, index) in grammarIssues"
                  :key="`${item.errorType}-${index}`"
                  class="issue-item"
                >
                  <span class="issue-type">{{ item.errorType || "语法问题" }}</span>
                  <p class="original-sentence">{{ item.originalSentence }}</p>
                  <p class="corrected-sentence">{{ item.correctedSentence }}</p>
                  <small>{{ item.suggestion || item.errorPosition || "请参考修正后的句子。" }}</small>
                </section>
              </div>

              <div v-else class="quiet-state">
                没有发现明显语法错误。
              </div>
            </article>

            <article class="issue-panel vocabulary-panel">
              <header>
                <Icon name="ph:feather" aria-hidden="true" />
                <h2>词汇建议</h2>
              </header>

              <div v-if="recommendedWords.length" class="issue-list">
                <section
                  v-for="(item, index) in recommendedWords"
                  :key="`${item.originalWord}-${index}`"
                  class="issue-item"
                >
                  <div class="word-change">
                    <span>{{ item.originalWord }}</span>
                    <Icon name="ph:arrow-right" aria-hidden="true" />
                    <span class="right-word">{{ item.recommendedWord }}</span>
                  </div>
                  <p>{{ item.context }}</p>
                  <small>{{ item.example }}</small>
                </section>
              </div>

              <div v-else class="quiet-state">
                暂无词汇升级建议。
              </div>
            </article>
          </section>
        </template>
      </section>
    </section>

    <Transition name="toast">
      <div v-if="toastMessage" class="toast" role="status">
        {{ toastMessage }}
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getEssayCorrectionReport,
  listMyEssayCorrectionReports,
  type EssayCorrectionReportVO,
  type ErrorWord,
  type GrammarError,
  type RecommendedWord,
} from "~/composables/api/essayCorrectionController";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "批改报告 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "查看英语作文语法纠错、拼写错误和修正全文",
    },
  ],
});

const route = useRoute();
const router = useRouter();

const reports = ref<EssayCorrectionReportVO[]>([]);
const activeReport = ref<EssayCorrectionReportVO | null>(null);
const viewMode = ref<"original" | "corrected">("corrected");
const isLoadingList = ref(false);
const isLoadingReport = ref(false);
const reportError = ref("");
const toastMessage = ref("");

const result = computed(() => activeReport.value?.result || {});
const totalScore = computed(() => reportScore(activeReport.value || {}));
const totalLabel = computed(() => {
  const total = reports.value.length;
  return total ? `${total} 份报告` : "暂无报告";
});
const statusSummary = computed(() => {
  if (activeReport.value?.correctStatus === 3) return "这份报告生成失败，请重新提交作文。";
  if (activeReport.value?.correctStatus === 1) return "这份作文仍在批改中。";
  return "这份作文已经完成基础批改。";
});
const spellingIssues = computed<ErrorWord[]>(() => result.value.errorWords || []);
const grammarIssues = computed<GrammarError[]>(() => result.value.grammarErrors || []);
const recommendedWords = computed<RecommendedWord[]>(
  () => result.value.recommendedWords || [],
);
const canCopyCorrectedContent = computed(() => {
  return Boolean(result.value.correctedContent);
});

const displayedText = computed(() => {
  if (!activeReport.value) return "";
  if (viewMode.value === "original") {
    return activeReport.value.content || result.value.originalContent || "";
  }
  return (
    result.value.correctedContent ||
    activeReport.value.content ||
    result.value.originalContent ||
    ""
  );
});

const displayedParagraphs = computed(() => {
  return displayedText.value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
});

const scoreItems = computed(() => {
  const scores = result.value.dimensionScores || {};
  return [
    {
      label: "内容切题",
      value: scores.contentRelevance ?? "--",
      tip: "观点和题目关联",
    },
    {
      label: "逻辑结构",
      value: scores.logicalStructure ?? "--",
      tip: "段落和衔接",
    },
    {
      label: "语法质量",
      value: scores.grammarQuality ?? "--",
      tip: "句法稳定性",
    },
    {
      label: "词汇水平",
      value: scores.vocabularyLevel ?? "--",
      tip: "表达准确度",
    },
  ];
});

function queryReportId(value = route.query.id) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== "string") return "";
  return /^\d+$/.test(rawValue) ? rawValue : "";
}

function reportScore(item: EssayCorrectionReportVO) {
  const rawScore = item.score ?? item.result?.dimensionScores?.totalScore;
  if (rawScore == null) return "--";
  const numericScore = Number(rawScore);
  if (!Number.isFinite(numericScore)) return `${rawScore}`;
  return `${Math.round(numericScore)}`;
}

function statusText(status?: number) {
  if (status === 1) return "批改中";
  if (status === 2) return "已完成";
  if (status === 3) return "失败";
  return "待批改";
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

function formatFullTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showToast(message: string) {
  toastMessage.value = message;
  window.setTimeout(() => {
    toastMessage.value = "";
  }, 1800);
}

function replaceReportInList(report: EssayCorrectionReportVO) {
  const index = reports.value.findIndex((item) => item.id === report.id);
  if (index >= 0) {
    reports.value.splice(index, 1, report);
    return;
  }
  reports.value = [report, ...reports.value];
}

async function loadReports() {
  isLoadingList.value = true;
  reportError.value = "";

  try {
    const response = await listMyEssayCorrectionReports({
      current: 1,
      pageSize: 20,
    });
    const payload = response?.data;
    if (payload?.code === 0) {
      reports.value = payload.data?.records || [];
      const routeId = queryReportId();
      if (!routeId) {
        activeReport.value = reports.value[0] || null;
      }
      return;
    }
    reportError.value = payload?.message || "读取报告失败。";
  } catch (error) {
    console.error("读取作文报告列表失败:", error);
    reportError.value = "后端服务暂时不可用。";
  } finally {
    isLoadingList.value = false;
  }
}

async function loadReport(id: string) {
  if (!id) return;
  isLoadingReport.value = true;
  reportError.value = "";

  try {
    const response = await getEssayCorrectionReport({ id });
    const payload = response?.data;
    if (payload?.code === 0 && payload.data) {
      activeReport.value = payload.data;
      replaceReportInList(payload.data);
      viewMode.value = "corrected";
      return;
    }
    reportError.value = payload?.message || "读取报告失败。";
  } catch (error) {
    console.error("读取作文报告失败:", error);
    reportError.value = "没有找到这份报告，或后端服务暂时不可用。";
  } finally {
    isLoadingReport.value = false;
  }
}

function openReport(item: EssayCorrectionReportVO) {
  activeReport.value = item;
  viewMode.value = "corrected";
  router.push({
    path: "/writing/writing-correction",
    query: item.id ? { id: item.id } : undefined,
  });
}

async function copyCorrectedContent() {
  const text = result.value.correctedContent || "";
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制修正文");
  } catch (error) {
    console.error("复制失败:", error);
    showToast("复制失败");
  }
}

onMounted(async () => {
  await loadReports();
  const routeId = queryReportId();
  if (routeId) {
    const localReport = reports.value.find((item) => item.id === routeId);
    if (localReport) {
      activeReport.value = localReport;
    }
    await loadReport(routeId);
  }
});

watch(
  () => route.query.id,
  async (value) => {
    const id = queryReportId(value);
    if (!id) {
      activeReport.value = reports.value[0] || null;
      return;
    }
    if (activeReport.value?.id === id) return;
    await loadReport(id);
  },
);
</script>

<style scoped>
.correction-page {
  min-height: 100dvh;
  box-sizing: border-box;
  padding: clamp(1.5rem, 4vw, 4rem);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.report-topbar {
  max-width: 1480px;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 auto clamp(1.5rem, 3vw, 2.5rem);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.back-link,
.primary-link,
.quiet-button,
.refresh-button,
.empty-report a {
  min-height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 6px;
  color: inherit;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.back-link {
  font-weight: 700;
}

.back-link :deep(svg),
.issue-panel header :deep(svg),
.word-change :deep(svg),
.refresh-button :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
}

.quiet-button,
.refresh-button {
  padding: 0 1rem;
  border: 1px solid var(--color-accent-secondary);
  background: transparent;
}

.quiet-button:hover:not(:disabled),
.refresh-button:hover {
  background: var(--color-accent-secondary);
}

.primary-link,
.empty-report a {
  padding: 0 1.1rem;
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  font-weight: 800;
}

.primary-link:hover,
.empty-report a:hover {
  background: #3a3935;
}

.back-link:active,
.primary-link:active,
.quiet-button:active:not(:disabled),
.refresh-button:active,
.segmented-control button:active,
.report-list-item:active,
.empty-report a:active {
  transform: translateY(1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

.empty-report {
  max-width: 860px;
  min-height: calc(100dvh - 12rem);
  display: grid;
  align-content: center;
  gap: 1.25rem;
  margin: 0 auto;
  text-align: center;
}

.empty-report h1 {
  margin: 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: clamp(2.6rem, 6vw, 6rem);
  line-height: 1;
}

.empty-report p {
  margin: 0 auto;
  max-width: 34rem;
  color: color-mix(in srgb, var(--color-text-primary) 68%, transparent);
  line-height: 1.8;
}

.empty-report a {
  width: fit-content;
  margin: 0 auto;
}

.report-workspace {
  max-width: 1480px;
  display: grid;
  grid-template-columns: minmax(230px, 0.32fr) minmax(0, 1fr);
  gap: clamp(1.5rem, 3vw, 2.5rem);
  margin: 0 auto;
}

.report-index {
  position: sticky;
  top: 2rem;
  align-self: start;
  display: grid;
  gap: 1rem;
}

.index-head {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-text-primary);
}

.index-head h2 {
  margin: 0.5rem 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: clamp(2rem, 3vw, 3.2rem);
  line-height: 1;
}

.index-head span {
  color: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

.report-list,
.index-loading {
  display: grid;
  gap: 1px;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.report-list-item {
  min-width: 0;
  min-height: 8.6rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-content: space-between;
  gap: 0.75rem 1rem;
  border: 0;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.report-list-item:hover,
.report-list-item.active {
  background: #f7f5ef;
}

.report-list-item.active {
  box-shadow: inset 3px 0 0 var(--color-text-primary);
}

.report-topic {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 800;
}

.report-list-item strong {
  grid-row: span 2;
  align-self: center;
  font-size: 2.2rem;
  line-height: 1;
}

.report-list-item small,
.report-list-item em {
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
  font-style: normal;
}

.index-loading span {
  min-height: 8.6rem;
  background:
    linear-gradient(90deg, transparent, rgba(40, 40, 40, 0.05), transparent),
    var(--color-bg-primary);
  background-size: 220% 100%;
  animation: reportPulse 1.4s ease-in-out infinite;
}

.refresh-button {
  width: 100%;
}

.report-body {
  min-width: 0;
  position: relative;
}

.report-loading {
  position: sticky;
  top: 1rem;
  z-index: 3;
  width: fit-content;
  margin: 0 0 1rem auto;
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  padding: 0.65rem 0.85rem;
  font-weight: 800;
}

.report-hero,
.score-grid,
.essay-review-shell,
.issue-layout {
  max-width: 100%;
  margin-right: auto;
  margin-left: auto;
}

.report-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.24fr);
  gap: 2rem;
  align-items: end;
  padding-bottom: clamp(1.5rem, 3vw, 2.5rem);
  border-bottom: 1px solid var(--color-text-primary);
}

.report-kicker,
.paper-toolbar p,
.score-card span,
.issue-type,
.report-meta dt {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.report-hero h1 {
  max-width: 13ch;
  margin: 0.75rem 0 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: clamp(3rem, 7vw, 7rem);
  line-height: 0.98;
}

.summary-copy {
  max-width: 52rem;
  margin: 1.25rem 0 0;
  color: color-mix(in srgb, var(--color-text-primary) 72%, transparent);
  font-size: clamp(1rem, 1.15vw, 1.16rem);
  line-height: 1.8;
}

.report-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, max-content));
  gap: 1px;
  margin: 1.4rem 0 0;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.report-meta div {
  padding: 0.85rem 1rem;
  background: var(--color-bg-primary);
}

.report-meta dd {
  margin: 0.45rem 0 0;
  font-weight: 800;
}

.score-stamp {
  min-height: 12rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-text-primary);
  border-radius: 50%;
  aspect-ratio: 1;
}

.score-stamp span {
  font-size: clamp(3rem, 6vw, 5.8rem);
  font-weight: 900;
  line-height: 0.9;
}

.score-stamp small {
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 1.5rem;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.score-card {
  min-height: 10rem;
  display: grid;
  align-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-bg-primary);
}

.score-card strong {
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1;
}

.score-card small {
  color: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

.essay-review-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.26fr);
  gap: 1px;
  margin-top: 1.5rem;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.essay-paper,
.margin-column {
  background: var(--color-bg-primary);
}

.essay-paper {
  min-height: 32rem;
  padding: clamp(1.25rem, 2.4vw, 2rem);
}

.paper-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.paper-toolbar h2 {
  margin: 0.4rem 0 0;
  font-size: 1.35rem;
}

.segmented-control {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(5rem, 1fr));
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  overflow: hidden;
}

.segmented-control button {
  min-height: 2.4rem;
  border: 0;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  cursor: pointer;
}

.segmented-control button.active {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.essay-content {
  max-width: 780px;
  padding-top: 2rem;
  font-family: Georgia, "Times New Roman", "Songti SC", serif;
  font-size: clamp(1.08rem, 1.35vw, 1.28rem);
  line-height: 2.05;
}

.essay-content p {
  margin: 0 0 1.35rem;
}

.margin-column {
  display: grid;
  align-content: start;
  gap: 1px;
  background: var(--color-accent-secondary);
}

.margin-note {
  min-height: 9rem;
  display: grid;
  align-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  background: var(--color-bg-primary);
  border-left: 4px solid var(--note);
}

.margin-note strong {
  font-size: 3rem;
  line-height: 0.95;
}

.margin-note span {
  color: color-mix(in srgb, var(--color-text-primary) 66%, transparent);
}

.red-note {
  --note: #8f3f35;
}

.green-note {
  --note: #516b5b;
}

.ink-note {
  --note: var(--color-text-primary);
}

.issue-layout {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: 1.5rem;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.issue-panel {
  min-width: 0;
  min-height: 22rem;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: var(--color-bg-primary);
}

.issue-panel header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.issue-panel h2 {
  margin: 0;
  font-size: 1.1rem;
}

.issue-list {
  display: grid;
  gap: 1px;
  margin-top: 1rem;
  background: var(--color-accent-secondary);
}

.issue-item {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  background: var(--color-bg-primary);
}

.word-change {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  font-weight: 800;
}

.wrong-word {
  position: relative;
  color: color-mix(in srgb, var(--color-text-primary) 50%, transparent);
}

.wrong-word::after {
  position: absolute;
  right: -0.15rem;
  bottom: 0.48em;
  left: -0.15rem;
  height: 2px;
  content: "";
  background: #8f3f35;
  transform: rotate(-3deg);
}

.right-word,
.corrected-sentence {
  color: #516b5b;
}

.issue-item p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 74%, transparent);
  line-height: 1.65;
}

.original-sentence {
  text-decoration: underline;
  text-decoration-color: #8f3f35;
  text-underline-offset: 0.18em;
}

.issue-item small,
.quiet-state {
  color: color-mix(in srgb, var(--color-text-primary) 60%, transparent);
  line-height: 1.65;
}

.quiet-state {
  min-height: 12rem;
  display: grid;
  place-items: center;
  text-align: center;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  z-index: 1000;
  min-width: 12rem;
  transform: translateX(-50%);
  border: 1px solid var(--color-text-primary);
  border-radius: 6px;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  padding: 0.875rem 1rem;
  text-align: center;
  font-weight: 800;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.5rem);
}

@keyframes reportPulse {
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
  .report-workspace {
    grid-template-columns: 1fr;
  }

  .report-index {
    position: static;
  }

  .report-list,
  .index-loading {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .score-grid,
  .issue-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .essay-review-shell {
    grid-template-columns: 1fr;
  }

  .margin-column {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .correction-page {
    padding: 1.25rem;
  }

  .report-topbar,
  .topbar-actions,
  .paper-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .report-hero,
  .score-grid,
  .issue-layout,
  .margin-column,
  .report-list,
  .index-loading,
  .report-meta {
    grid-template-columns: 1fr;
  }

  .score-stamp {
    width: min(14rem, 100%);
    min-height: auto;
    justify-self: start;
  }

  .primary-link,
  .quiet-button {
    width: 100%;
  }
}
</style>
