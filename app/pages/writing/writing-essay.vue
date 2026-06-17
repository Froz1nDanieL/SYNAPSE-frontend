<template>
  <main class="essay-page">
    <header class="essay-topbar">
      <NuxtLink class="back-link" to="/writing/writing-main">
        <Icon name="ph:arrow-left" aria-hidden="true" />
        <span>返回写作台</span>
      </NuxtLink>
      <button class="quiet-button" type="button" @click="restoreSample">
        使用示例
      </button>
    </header>

    <section class="essay-shell">
      <aside class="essay-brief" aria-labelledby="essay-page-title">
        <p class="brief-kicker">Essay Draft</p>
        <h1 id="essay-page-title">先把观点写清楚，再交给红笔。</h1>
        <p>
          MVP 批改会优先检查语法和拼写，并返回修正全文、错误列表和四维评分。
        </p>

        <dl class="draft-stats">
          <div>
            <dt>字符</dt>
            <dd>{{ content.length }}</dd>
          </div>
          <div>
            <dt>单词</dt>
            <dd>{{ wordCount }}</dd>
          </div>
          <div>
            <dt>段落</dt>
            <dd>{{ paragraphCount }}</dd>
          </div>
        </dl>
      </aside>

      <section class="editor-board" aria-label="作文编辑器">
        <div class="paper-panel">
          <label class="field-block">
            <span>作文题目</span>
            <input
              v-model="topic"
              maxlength="120"
              type="text"
              placeholder="例如: The value of reading every day"
            />
          </label>

          <label class="field-block essay-field">
            <span>作文正文</span>
            <textarea
              v-model="content"
              maxlength="5000"
              placeholder="Write your essay here..."
            ></textarea>
          </label>

          <footer class="editor-actions">
            <div class="limit-copy">
              {{ content.length }} / 5000
            </div>
            <div class="action-group">
              <button
                class="quiet-button"
                type="button"
                :disabled="isCorrecting || !content"
                @click="clearDraft"
              >
                清空
              </button>
              <button
                class="primary-button"
                type="button"
                :disabled="!canSubmit"
                @click="submitEssay"
              >
                <span>{{ isCorrecting ? "批改中..." : "提交批改" }}</span>
                <Icon name="ph:sparkle" aria-hidden="true" />
              </button>
            </div>
          </footer>
        </div>

        <aside class="review-panel" aria-label="批改前检查">
          <section class="review-card">
            <div class="review-card-head">
              <Icon name="ph:checks" aria-hidden="true" />
              <h2>提交前检查</h2>
            </div>
            <ul class="check-list">
              <li :class="{ passed: hasTopic }">
                <span></span>
                题目已填写
              </li>
              <li :class="{ passed: wordCount >= 40 }">
                <span></span>
                正文至少 40 个英文词
              </li>
              <li :class="{ passed: paragraphCount >= 1 }">
                <span></span>
                段落结构可识别
              </li>
            </ul>
          </section>

          <section class="review-card">
            <div class="review-card-head">
              <Icon name="ph:bookmark-simple" aria-hidden="true" />
              <h2>快速题目</h2>
            </div>
            <div class="prompt-stack">
              <button
                v-for="item in promptCards"
                :key="item"
                type="button"
                @click="pickTopic(item)"
              >
                {{ item }}
              </button>
            </div>
          </section>

          <section v-if="isCorrecting" class="review-card loading-card">
            <span></span>
            <span class="short"></span>
            <p>正在生成批改报告</p>
          </section>

          <section v-if="errorMessage" class="review-card error-card" role="alert">
            <strong>提交失败</strong>
            <p>{{ errorMessage }}</p>
          </section>
        </aside>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { correctEssay } from "~/composables/api/essayCorrectionController";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "写作纸 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "提交英语作文并生成语法和拼写批改报告",
    },
  ],
});

type DraftPayload = {
  topic: string;
  content: string;
  updatedAt: string;
};

const DRAFT_KEY = "msenWritingDraft";

const router = useRouter();
const topic = ref("");
const content = ref("");
const isCorrecting = ref(false);
const errorMessage = ref("");

const promptCards = [
  "Should students use AI tools",
  "The value of reading every day",
  "A challenge I overcame",
  "My ideal study routine",
];

const hasTopic = computed(() => topic.value.trim().length > 0);
const wordCount = computed(() => {
  const matches = content.value.trim().match(/[A-Za-z]+(?:'[A-Za-z]+)?/g);
  return matches?.length || 0;
});
const paragraphCount = computed(() => {
  return content.value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
});
const canSubmit = computed(() => {
  return content.value.trim().length > 0 && !isCorrecting.value;
});

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`读取 ${key} 失败:`, error);
    return fallback;
  }
}

function saveDraft() {
  if (typeof window === "undefined") return;
  const payload: DraftPayload = {
    topic: topic.value,
    content: content.value,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
}

function removeDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

function pickTopic(value: string) {
  topic.value = value;
}

function restoreSample() {
  topic.value = "The value of reading every day";
  content.value =
    "Reading every day is a good habit for students. It help us learn new words and understand different ideas. When I read English articles, I can find some useful sentence and use them in my writing. I think reading is not only for exams, but also for opening our mind.";
}

function clearDraft() {
  topic.value = "";
  content.value = "";
  errorMessage.value = "";
  removeDraft();
}

async function submitEssay() {
  if (!canSubmit.value) return;

  errorMessage.value = "";
  isCorrecting.value = true;

  try {
    const response = await correctEssay({
      topic: topic.value.trim(),
      content: content.value.trim(),
    });

    const payload = response?.data;
    if (payload?.code === 0 && payload.data) {
      removeDraft();
      await router.push({
        path: "/writing/writing-correction",
        query: payload.data.id ? { id: payload.data.id } : undefined,
      });
      return;
    }

    errorMessage.value =
      payload?.message || "批改服务暂时不可用，请稍后再试。";
  } catch (error) {
    console.error("作文批改失败:", error);
    errorMessage.value = "网络连接失败，请确认后端服务已启动。";
  } finally {
    isCorrecting.value = false;
  }
}

onMounted(() => {
  const saved = safeReadJson<DraftPayload | null>(DRAFT_KEY, null);
  if (!saved) return;
  topic.value = saved.topic || "";
  content.value = saved.content || "";
});

watch([topic, content], saveDraft);
</script>

<style scoped>
.essay-page {
  min-height: 100dvh;
  box-sizing: border-box;
  padding: clamp(1.5rem, 4vw, 4rem);
  background:
    linear-gradient(rgba(40, 40, 40, 0.028) 1px, transparent 1px),
    var(--color-bg-primary);
  background-size: 100% 2rem;
  color: var(--color-text-primary);
}

.essay-topbar {
  max-width: 1380px;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 auto clamp(1.5rem, 3vw, 2.5rem);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-accent-secondary);
}

.back-link,
.primary-button,
.quiet-button {
  min-height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 6px;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.back-link {
  color: var(--color-text-primary);
  font-weight: 700;
}

.back-link :deep(svg),
.primary-button :deep(svg),
.review-card-head :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
}

.quiet-button {
  padding: 0 1rem;
  border: 1px solid var(--color-accent-secondary);
  background: transparent;
  color: var(--color-text-primary);
}

.quiet-button:hover:not(:disabled) {
  background: var(--color-accent-secondary);
}

.primary-button {
  min-width: 10rem;
  padding: 0 1.15rem;
  border: 1px solid var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  font-weight: 800;
}

.primary-button:hover:not(:disabled) {
  background: #3a3935;
}

.primary-button:active:not(:disabled),
.quiet-button:active:not(:disabled),
.back-link:active,
.prompt-stack button:active {
  transform: translateY(1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

.essay-shell {
  max-width: 1380px;
  display: grid;
  grid-template-columns: minmax(260px, 0.45fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
  margin: 0 auto;
}

.essay-brief {
  position: sticky;
  top: 2rem;
  align-self: start;
  display: grid;
  gap: 1.25rem;
  padding-right: clamp(1rem, 2vw, 2.5rem);
  border-right: 1px solid var(--color-accent-secondary);
}

.brief-kicker,
.field-block > span,
.draft-stats dt,
.limit-copy {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text-primary) 58%, transparent);
}

.essay-brief h1 {
  max-width: 9ch;
  margin: 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: clamp(2.8rem, 5vw, 5.8rem);
  line-height: 1.02;
}

.essay-brief p {
  max-width: 24rem;
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 70%, transparent);
  line-height: 1.8;
}

.draft-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 1rem 0 0;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.draft-stats div {
  padding: 1rem;
  background: var(--color-bg-primary);
}

.draft-stats dd {
  margin: 0.5rem 0 0;
  font-size: 1.6rem;
  font-weight: 800;
}

.editor-board {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.36fr);
  gap: 1px;
  border: 1px solid var(--color-accent-secondary);
  background: var(--color-accent-secondary);
}

.paper-panel,
.review-panel {
  background: var(--color-bg-primary);
}

.paper-panel {
  min-height: calc(100dvh - 9rem);
  display: grid;
  grid-template-rows: auto minmax(24rem, 1fr) auto;
  gap: 1.5rem;
  padding: clamp(1.25rem, 2.2vw, 2rem);
}

.field-block {
  min-width: 0;
  display: grid;
  gap: 0.75rem;
}

.field-block input,
.field-block textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  outline: 0;
  background: #fbfaf6;
  color: var(--color-text-primary);
  font: inherit;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.field-block input:focus,
.field-block textarea:focus {
  border-color: var(--color-text-primary);
  background: var(--color-bg-primary);
}

.field-block input {
  min-height: 3.2rem;
  padding: 0 1rem;
  font-weight: 700;
}

.essay-field textarea {
  min-height: 100%;
  resize: none;
  padding: 1.2rem;
  font-family: Georgia, "Times New Roman", "Songti SC", serif;
  font-size: clamp(1.08rem, 1.35vw, 1.25rem);
  line-height: 2;
}

.field-block input::placeholder,
.field-block textarea::placeholder {
  color: color-mix(in srgb, var(--color-text-primary) 38%, transparent);
}

.editor-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-accent-secondary);
}

.action-group {
  display: flex;
  gap: 0.75rem;
}

.review-panel {
  display: grid;
  align-content: start;
  gap: 1px;
  background: var(--color-accent-secondary);
}

.review-card {
  padding: 1.25rem;
  background: var(--color-bg-primary);
}

.review-card-head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.review-card h2 {
  margin: 0;
  font-size: 1rem;
}

.check-list {
  display: grid;
  gap: 0.85rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.check-list li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: color-mix(in srgb, var(--color-text-primary) 56%, transparent);
}

.check-list span {
  width: 0.7rem;
  height: 0.7rem;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.check-list li.passed {
  color: #516b5b;
}

.check-list li.passed span {
  background: currentColor;
}

.prompt-stack {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.prompt-stack button {
  min-height: 3rem;
  border: 1px solid var(--color-accent-secondary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-primary);
  padding: 0.75rem;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.prompt-stack button:hover {
  background: var(--color-accent-secondary);
}

.loading-card {
  display: grid;
  gap: 0.9rem;
}

.loading-card span {
  display: block;
  width: 100%;
  height: 0.8rem;
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-text-primary) 16%, transparent);
  animation: writingPulse 1.2s ease-in-out infinite;
}

.loading-card span.short {
  width: 62%;
}

.loading-card p,
.error-card p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text-primary) 66%, transparent);
  line-height: 1.6;
}

.error-card {
  border-left: 3px solid #8f3f35;
}

.error-card strong {
  display: block;
  margin-bottom: 0.45rem;
  color: #8f3f35;
}

@keyframes writingPulse {
  0%,
  100% {
    opacity: 0.12;
  }
  50% {
    opacity: 0.3;
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
  .essay-shell {
    grid-template-columns: 1fr;
  }

  .essay-brief {
    position: static;
    border-right: 0;
    border-bottom: 1px solid var(--color-accent-secondary);
    padding: 0 0 2rem;
  }

  .essay-brief h1 {
    max-width: 14ch;
  }
}

@media (max-width: 860px) {
  .editor-board {
    grid-template-columns: 1fr;
  }

  .paper-panel {
    min-height: auto;
  }
}

@media (max-width: 600px) {
  .essay-page {
    padding: 1.25rem;
  }

  .essay-topbar,
  .editor-actions,
  .action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .quiet-button {
    width: 100%;
  }

  .draft-stats {
    grid-template-columns: 1fr;
  }
}
</style>
