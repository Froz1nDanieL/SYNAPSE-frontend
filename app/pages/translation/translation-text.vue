<template>
  <main class="translation-page">
    <aside class="translation-rail" aria-labelledby="translation-title">
      <div>
        <p class="rail-kicker">Translation</p>
        <h1 id="translation-title">翻译工作台</h1>
        <p class="rail-copy">
          文本和文档放在同一张工作台里，确认语言方向后，再选择要处理的内容。
        </p>
      </div>

      <dl class="rail-stats" aria-label="当前翻译状态">
        <div>
          <dt>当前模式</dt>
          <dd>{{ activeModeLabel }}</dd>
        </div>
        <div>
          <dt>语言方向</dt>
          <dd>{{ sourceLabel }}到{{ targetLabel }}</dd>
        </div>
      </dl>

      <section class="rail-note" aria-label="支持范围">
        <h2>支持范围</h2>
        <p>文本最多 5000 字，文档支持 docx、pdf、md，单个文件不超过 10MB。</p>
      </section>
    </aside>

    <section class="translation-board" aria-label="翻译工作区">
      <header class="board-toolbar">
        <div class="mode-tabs" role="tablist" aria-label="翻译模式">
          <button
            type="button"
            role="tab"
            :aria-selected="activeMode === 'text'"
            :class="{ active: activeMode === 'text' }"
            @click="selectMode('text')"
          >
            <Icon name="ph:text-aa" aria-hidden="true" />
            <span>文本翻译</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeMode === 'document'"
            :class="{ active: activeMode === 'document' }"
            @click="selectMode('document')"
          >
            <Icon name="ph:file-text" aria-hidden="true" />
            <span>文档翻译</span>
          </button>
        </div>

        <div class="language-switcher" aria-label="翻译方向">
          <span>{{ sourceLabel }}</span>
          <button
            class="icon-button"
            type="button"
            :disabled="isBusy"
            aria-label="切换翻译方向"
            title="切换翻译方向"
            @click="swapLanguages"
          >
            <Icon name="ph:arrows-left-right" aria-hidden="true" />
          </button>
          <span>{{ targetLabel }}</span>
        </div>
      </header>

      <section
        v-if="activeMode === 'text'"
        class="workspace-shell"
        aria-label="文本翻译"
      >
        <div class="text-grid">
          <section class="text-pane input-pane" aria-label="原文">
            <div class="pane-heading">
              <span>原文</span>
              <button
                v-if="inputText"
                class="text-action"
                type="button"
                @click="clearInput"
              >
                清空
              </button>
            </div>
            <textarea
              v-model="inputText"
              class="translate-input"
              maxlength="5000"
              :placeholder="textPlaceholder"
              @keydown.enter.exact.prevent="handleTextTranslate"
            ></textarea>
            <footer class="pane-footer">
              <span>{{ inputText.length }} / 5000</span>
              <span>Shift + Enter 换行</span>
            </footer>
          </section>

          <section class="text-pane output-pane" aria-label="译文">
            <div class="pane-heading">
              <span>译文</span>
              <button
                v-if="translatedText && !isTextTranslating"
                class="text-action"
                type="button"
                @click="copyTextResult"
              >
                复制
              </button>
            </div>

            <div v-if="isTextTranslating" class="loading-state">
              <span class="loading-line"></span>
              <span class="loading-line short"></span>
              <p>正在翻译</p>
            </div>

            <p v-else-if="translatedText" class="translated-text">
              {{ translatedText }}
            </p>

            <div v-else class="empty-state">
              翻译结果会显示在这里。
            </div>

            <footer class="pane-footer">
              <span>{{ targetLabel }}</span>
              <span>{{ translatedText.length }} 字</span>
            </footer>
          </section>
        </div>

        <footer class="command-row">
          <button
            class="primary-button"
            type="button"
            :disabled="!canTranslateText"
            @click="handleTextTranslate"
          >
            {{ isTextTranslating ? "翻译中..." : "开始翻译" }}
          </button>
        </footer>

        <section v-if="history.length > 0" class="recent-section">
          <header class="section-title">
            <div>
              <h2>最近翻译</h2>
              <p>点击任一记录即可恢复原文与译文。</p>
            </div>
            <button class="text-action" type="button" @click="clearHistory">
              清空历史
            </button>
          </header>

          <div class="history-list">
            <button
              v-for="(item, index) in history"
              :key="`${item.time}-${index}`"
              class="history-item"
              type="button"
              @click="loadFromHistory(item)"
            >
              <span>{{ langLabel(item.from) }}到{{ langLabel(item.to) }}</span>
              <strong>{{ item.source }}</strong>
              <small>{{ item.target }}</small>
            </button>
          </div>
        </section>
      </section>

      <section v-else class="workspace-shell" aria-label="文档翻译">
        <div class="document-grid">
          <section class="upload-panel" aria-label="上传文档">
            <div
              class="upload-dropzone"
              :class="{
                dragover: isDragOver,
                selected: uploadedFile,
              }"
              role="button"
              tabindex="0"
              @click="triggerFileInput"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @keydown.enter.prevent="triggerFileInput"
              @keydown.space.prevent="triggerFileInput"
            >
              <input
                ref="fileInput"
                class="file-input"
                type="file"
                accept=".docx,.pdf,.md"
                @change="handleFileSelect"
              />

              <span class="upload-badge">
                {{ uploadedFile ? "已选择" : "上传文档" }}
              </span>

              <template v-if="uploadedFile">
                <strong>{{ uploadedFile.name }}</strong>
                <small>{{ formatFileSize(uploadedFile.size) }}</small>
              </template>

              <template v-else>
                <strong>点击选择，或拖入一个文件</strong>
                <small>docx、pdf 会走文档接口，md 会保护语法后只翻译正文。</small>
              </template>
            </div>

            <button
              v-if="uploadedFile"
              class="text-action remove-file"
              type="button"
              :disabled="isDocumentTranslating"
              @click="removeFile"
            >
              移除文件
            </button>
          </section>

          <aside class="document-status" aria-label="文档处理状态">
            <div>
              <p class="status-kicker">Document</p>
              <h2>{{ documentStatusTitle }}</h2>
              <p>{{ documentStatusDescription }}</p>
            </div>

            <div v-if="isDocumentTranslating" class="loading-state">
              <span class="loading-line"></span>
              <span class="loading-line short"></span>
              <p>正在处理文档</p>
            </div>

            <dl v-else class="file-brief">
              <div>
                <dt>格式</dt>
                <dd>{{ documentFormatLabel }}</dd>
              </div>
              <div>
                <dt>大小</dt>
                <dd>{{ documentSizeLabel }}</dd>
              </div>
            </dl>

            <button
              v-if="translatedBlob && !isDocumentTranslating"
              class="download-card"
              type="button"
              @click="downloadResult"
            >
              <span>下载结果</span>
              <strong>{{ translatedFileName }}</strong>
            </button>
          </aside>
        </div>

        <footer class="command-row">
          <button
            class="primary-button"
            type="button"
            :disabled="!canTranslateDocument"
            @click="handleDocumentTranslate"
          >
            {{ isDocumentTranslating ? "翻译中..." : "开始翻译" }}
          </button>
        </footer>
      </section>
    </section>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type" role="status">
        {{ toast.message }}
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  translateDocumentToChineseWithFormat,
  translateDocumentToEnglishWithFormat,
  translateToChinese,
  translateToEnglish,
} from "~/composables/api/translateController";

definePageMeta({
  layout: "default",
});

useHead({
  title: "翻译工作台 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "支持文本翻译和文档翻译的英汉互译工作台",
    },
  ],
});

const HISTORY_KEY = "translateHistory";
const VALID_DOCUMENT_EXTENSIONS = [".docx", ".pdf", ".md"];
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const MARKDOWN_TRANSLATION_CHUNK_LIMIT = 3600;

const route = useRoute();
const router = useRouter();

const activeMode = ref(normalizeMode(route.query.mode));
const inputText = ref("");
const translatedText = ref("");
const sourceLang = ref("zh");
const targetLang = ref("en");
const isTextTranslating = ref(false);
const isDocumentTranslating = ref(false);
const history = ref([]);

const uploadedFile = ref(null);
const fileInput = ref(null);
const isDragOver = ref(false);
const translatedBlob = ref(null);

const toast = ref({
  show: false,
  message: "",
  type: "success",
});
let toastTimer;

const isBusy = computed(
  () => isTextTranslating.value || isDocumentTranslating.value,
);
const activeModeLabel = computed(() =>
  activeMode.value === "document" ? "文档翻译" : "文本翻译",
);
const sourceLabel = computed(() => langLabel(sourceLang.value));
const targetLabel = computed(() => langLabel(targetLang.value));
const textPlaceholder = computed(() =>
  sourceLang.value === "zh"
    ? "输入需要翻译的中文，或粘贴一段学习笔记"
    : "Enter English text or paste a paragraph from your notes",
);
const canTranslateText = computed(
  () => inputText.value.trim().length > 0 && !isTextTranslating.value,
);
const canTranslateDocument = computed(
  () => Boolean(uploadedFile.value) && !isDocumentTranslating.value,
);
const translatedFileName = computed(() => {
  const originalName = uploadedFile.value?.name || "document";
  const extensionIndex = originalName.lastIndexOf(".");

  if (extensionIndex <= 0) {
    return `translated_${originalName}`;
  }

  const name = originalName.substring(0, extensionIndex);
  const extension = originalName.substring(extensionIndex);
  return `translated_${name}${extension}`;
});
const documentStatusTitle = computed(() => {
  if (isDocumentTranslating.value) return "正在处理文档";
  if (translatedBlob.value) return "文档已翻译完成";
  if (uploadedFile.value) return "文件已就绪";
  return "等待上传";
});
const documentStatusDescription = computed(() => {
  if (isDocumentTranslating.value) {
    return "请保持页面打开，生成结果后可以直接下载。";
  }
  if (translatedBlob.value) {
    return "结果文件已经生成，下载后即可继续整理或提交。";
  }
  if (uploadedFile.value) {
    return "确认语言方向后开始处理，完成前不要关闭当前页面。";
  }
  return "选择一个文档后，系统会根据当前语言方向生成译文文件。";
});
const documentFormatLabel = computed(() => {
  if (!uploadedFile.value) return "未选择";
  return getFileExtension(uploadedFile.value.name).replace(".", "").toUpperCase();
});
const documentSizeLabel = computed(() => {
  if (!uploadedFile.value) return "--";
  return formatFileSize(uploadedFile.value.size);
});

watch(
  () => route.query.mode,
  (mode) => {
    activeMode.value = normalizeMode(mode);
  },
);

function normalizeMode(mode) {
  return mode === "document" ? "document" : "text";
}

function langLabel(lang) {
  return lang === "zh" ? "中文" : "英文";
}

function showToast(message, type = "success") {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 2400);
}

function selectMode(mode) {
  if (isBusy.value) {
    showToast("请等待当前翻译完成", "error");
    return;
  }

  activeMode.value = mode;
  const nextQuery = { ...route.query };

  if (mode === "document") {
    nextQuery.mode = "document";
  } else {
    delete nextQuery.mode;
  }

  router.replace({
    path: route.path,
    query: nextQuery,
  });
}

function swapLanguages() {
  if (isBusy.value) return;

  const currentSource = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = currentSource;
  translatedText.value = "";
  translatedBlob.value = null;
}

function clearInput() {
  inputText.value = "";
  translatedText.value = "";
}

async function handleTextTranslate() {
  const text = inputText.value.trim();
  if (!text || isTextTranslating.value) return;

  isTextTranslating.value = true;
  translatedText.value = "";

  try {
    const response =
      sourceLang.value === "zh"
        ? await translateToEnglish({ text })
        : await translateToChinese({ text });

    const payload = response?.data;
    if (payload?.code === 0) {
      const translated = payload.data?.trans_result?.[0]?.dst;
      if (translated) {
        translatedText.value = translated;
        addToHistory(text, translated);
        return;
      }
    }

    showToast(payload?.message || "翻译失败，请重试", "error");
  } catch (error) {
    console.error("文本翻译失败:", error);
    showToast("网络错误，请检查连接", "error");
  } finally {
    isTextTranslating.value = false;
  }
}

function addToHistory(source, target) {
  const item = {
    source,
    target,
    from: sourceLang.value,
    to: targetLang.value,
    time: Date.now(),
  };

  history.value = history.value.filter((record) => record.source !== source);
  history.value.unshift(item);

  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10);
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value));
}

function loadFromHistory(item) {
  sourceLang.value = item.from;
  targetLang.value = item.to;
  inputText.value = item.source;
  translatedText.value = item.target;
}

function clearHistory() {
  history.value = [];
  window.localStorage.removeItem(HISTORY_KEY);
}

async function copyTextResult() {
  if (!translatedText.value) return;

  try {
    await navigator.clipboard.writeText(translatedText.value);
    showToast("已复制到剪贴板");
  } catch (error) {
    console.error("复制译文失败:", error);
    showToast("复制失败", "error");
  }
}

function triggerFileInput() {
  if (isDocumentTranslating.value) return;
  fileInput.value?.click();
}

function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (file) {
    validateAndSetFile(file);
  }
}

function handleDragOver() {
  if (!isDocumentTranslating.value) {
    isDragOver.value = true;
  }
}

function handleDragLeave() {
  isDragOver.value = false;
}

function handleDrop(event) {
  isDragOver.value = false;
  if (isDocumentTranslating.value) return;

  const file = event.dataTransfer.files?.[0];
  if (file) {
    validateAndSetFile(file);
  }
}

function validateAndSetFile(file) {
  const fileExtension = getFileExtension(file.name);

  if (!VALID_DOCUMENT_EXTENSIONS.includes(fileExtension)) {
    showToast("仅支持 docx、pdf 和 md 格式文件", "error");
    return;
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    showToast("文件大小不能超过 10MB", "error");
    return;
  }

  uploadedFile.value = file;
  translatedBlob.value = null;
}

function removeFile() {
  uploadedFile.value = null;
  translatedBlob.value = null;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function getFileExtension(fileName) {
  const extensionIndex = fileName.lastIndexOf(".");
  return extensionIndex === -1
    ? ""
    : fileName.substring(extensionIndex).toLowerCase();
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";

  const unit = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(unit)),
    sizes.length - 1,
  );

  return `${parseFloat((bytes / Math.pow(unit, index)).toFixed(2))} ${
    sizes[index]
  }`;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result || "");
    reader.onerror = (event) => reject(event);
    reader.readAsText(file);
  });
}

async function handleDocumentTranslate() {
  if (!uploadedFile.value || isDocumentTranslating.value) return;

  isDocumentTranslating.value = true;
  translatedBlob.value = null;

  try {
    const file = uploadedFile.value;
    const fileExtension = getFileExtension(file.name);

    if (fileExtension === ".md") {
      try {
        await translateDocumentFile(file);
      } catch (error) {
        console.warn("后端 Markdown 翻译失败，回退到前端保护翻译:", error);
        await translateMarkdownFile(file);
      }
    } else {
      await translateDocumentFile(file);
    }
  } catch (error) {
    console.error("文档翻译失败:", error);
    if (error?.code === "ECONNABORTED") {
      showToast("翻译超时，请稍后重试", "error");
    } else {
      showToast("网络错误，请检查连接", "error");
    }
  } finally {
    isDocumentTranslating.value = false;
  }
}

async function translateMarkdownFile(file) {
  const content = await readFileAsText(file);
  if (!String(content).trim()) {
    showToast("文档内容为空", "error");
    return;
  }

  const normalizedContent = String(content).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const translationPlan = createMarkdownTranslationPlan(normalizedContent);

  if (translationPlan.segments.length === 0) {
    translatedBlob.value = new Blob([normalizedContent], {
      type: "text/markdown;charset=utf-8",
    });
    showToast("文档中没有需要翻译的文本");
    return;
  }

  const translations = await translateMarkdownSegments(translationPlan.segments);
  const translatedContent = renderMarkdownTranslation(
    translationPlan.parts,
    translations,
  );

  translatedBlob.value = new Blob([translatedContent], {
    type: "text/markdown;charset=utf-8",
  });
  showToast("文档翻译完成");
}

function createMarkdownTranslationPlan(markdown) {
  const lines = markdown.split("\n");
  const parts = [];
  const segments = [];
  let lineIndex = 0;

  const appendLiteral = (value) => {
    if (value) {
      parts.push({ type: "literal", value });
    }
  };
  const appendLineBreak = (index) => {
    if (index < lines.length - 1) {
      appendLiteral("\n");
    }
  };
  const appendTranslatable = (value) => {
    if (!hasTranslatableText(value)) {
      appendLiteral(normalizeUntranslatedText(value));
      return;
    }

    const whitespaceMatch = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const leading = whitespaceMatch?.[1] || "";
    const body = whitespaceMatch?.[2] || value;
    const trailing = whitespaceMatch?.[3] || "";

    if (!body || !hasTranslatableText(body)) {
      appendLiteral(value);
      return;
    }

    appendLiteral(leading);
    appendInlineTranslatable(body);
    appendLiteral(trailing);
  };
  const appendPlainTextSegment = (value) => {
    if (!value) return;

    if (!hasTranslatableText(value)) {
      appendLiteral(normalizeUntranslatedText(value));
      return;
    }

    const edgeText = splitMarkdownSegmentEdges(value);
    appendLiteral(edgeText.leading);

    if (!edgeText.body) {
      appendLiteral(edgeText.trailing);
      return;
    }

    const id = segments.length;
    segments.push({
      id,
      source: edgeText.body,
      protectedText: edgeText.body,
      restore: restoreMarkdownTranslationText,
    });
    parts.push({ type: "segment", id });
    appendLiteral(edgeText.trailing);
  };
  const appendInlineTranslatable = (value) => {
    let cursor = 0;

    while (cursor < value.length) {
      const token = findNextInlineMarkdownToken(value, cursor);
      if (!token) {
        appendPlainTextSegment(value.slice(cursor));
        break;
      }

      appendPlainTextSegment(value.slice(cursor, token.index));

      if (token.type === "literal") {
        appendLiteral(token.raw);
      } else if (token.type === "emphasis") {
        appendLiteral(token.open);
        appendInlineTranslatable(token.content);
        appendLiteral(token.close);
      } else if (token.type === "link") {
        appendLiteral(token.open);
        appendInlineTranslatable(token.label);
        appendLiteral(token.close);
      }

      cursor = token.index + token.raw.length;
    }
  };
  const appendTranslatedLine = (line, index) => {
    appendTranslatable(line);
    appendLineBreak(index);
  };

  if (isFrontmatterStart(lines)) {
    const endIndex = findFrontmatterEnd(lines);
    if (endIndex > 0) {
      for (let index = 0; index <= endIndex; index += 1) {
        appendLiteral(lines[index]);
        appendLineBreak(index);
      }
      lineIndex = endIndex + 1;
    }
  }

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    if (line.trim() === "") {
      appendLiteral(line);
      appendLineBreak(lineIndex);
      lineIndex += 1;
      continue;
    }

    if (isFenceStart(line)) {
      lineIndex = appendLiteralBlockUntil(lines, lineIndex, parts, isFenceEnd);
      continue;
    }

    if (isIndentedCodeLine(line)) {
      lineIndex = appendLiteralIndentedCode(lines, lineIndex, parts);
      continue;
    }

    if (isTableStart(lines, lineIndex)) {
      lineIndex = appendMarkdownTable(lines, lineIndex, appendLiteral, appendTranslatable);
      continue;
    }

    if (isHtmlBlockStart(line)) {
      lineIndex = appendLiteralHtmlBlock(lines, lineIndex, parts);
      continue;
    }

    if (isThematicBreak(line) || isReferenceDefinition(line)) {
      appendLiteral(line);
      appendLineBreak(lineIndex);
      lineIndex += 1;
      continue;
    }

    const footnote = parseFootnote(line);
    if (footnote) {
      appendLiteral(footnote.prefix);
      appendTranslatable(footnote.content);
      appendLineBreak(lineIndex);
      lineIndex += 1;
      continue;
    }

    const heading = parseHeading(line);
    if (heading) {
      appendLiteral(heading.prefix);
      appendTranslatable(heading.content);
      appendLiteral(heading.suffix);
      appendLineBreak(lineIndex);
      lineIndex += 1;
      continue;
    }

    const listItem = parseListItem(line);
    if (listItem) {
      appendLiteral(listItem.prefix);
      appendTranslatable(listItem.content);
      appendLineBreak(lineIndex);
      lineIndex += 1;
      continue;
    }

    const blockquote = parseBlockquote(line);
    if (blockquote) {
      appendLiteral(blockquote.prefix);
      appendTranslatable(blockquote.content);
      appendLineBreak(lineIndex);
      lineIndex += 1;
      continue;
    }

    const paragraphLines = [];
    const paragraphStart = lineIndex;

    while (
      lineIndex < lines.length &&
      !isMarkdownBoundary(lines, lineIndex)
    ) {
      paragraphLines.push(lines[lineIndex]);
      lineIndex += 1;
    }

    appendTranslatable(paragraphLines.join("\n"));
    appendLineBreak(lineIndex - 1);
  }

  return { parts, segments };
}

function appendLiteralBlockUntil(lines, startIndex, parts, isEnd) {
  const fenceLine = lines[startIndex];
  const fenceMarker = fenceLine.trim().slice(0, 3);
  let lineIndex = startIndex;

  while (lineIndex < lines.length) {
    parts.push({ type: "literal", value: lines[lineIndex] });
    if (lineIndex < lines.length - 1) {
      parts.push({ type: "literal", value: "\n" });
    }
    if (lineIndex > startIndex && isEnd(lines[lineIndex], fenceMarker)) {
      lineIndex += 1;
      break;
    }
    lineIndex += 1;
  }

  return lineIndex;
}

function appendLiteralIndentedCode(lines, startIndex, parts) {
  let lineIndex = startIndex;

  while (
    lineIndex < lines.length &&
    (isIndentedCodeLine(lines[lineIndex]) || lines[lineIndex].trim() === "")
  ) {
    parts.push({ type: "literal", value: lines[lineIndex] });
    if (lineIndex < lines.length - 1) {
      parts.push({ type: "literal", value: "\n" });
    }
    lineIndex += 1;
  }

  return lineIndex;
}

function appendLiteralHtmlBlock(lines, startIndex, parts) {
  let lineIndex = startIndex;

  while (lineIndex < lines.length) {
    parts.push({ type: "literal", value: lines[lineIndex] });
    if (lineIndex < lines.length - 1) {
      parts.push({ type: "literal", value: "\n" });
    }
    lineIndex += 1;

    if (lineIndex >= lines.length || lines[lineIndex].trim() === "") {
      break;
    }
  }

  return lineIndex;
}

function appendMarkdownTable(lines, startIndex, appendLiteral, appendTranslatable) {
  let lineIndex = startIndex;

  while (lineIndex < lines.length && lines[lineIndex].includes("|")) {
    const line = lines[lineIndex];

    if (isTableDelimiter(line)) {
      appendLiteral(line);
    } else {
      appendTableRow(line, appendLiteral, appendTranslatable);
    }

    if (lineIndex < lines.length - 1) {
      appendLiteral("\n");
    }
    lineIndex += 1;

    if (lineIndex < lines.length && lines[lineIndex].trim() === "") {
      break;
    }
  }

  return lineIndex;
}

function appendTableRow(line, appendLiteral, appendTranslatable) {
  const cells = line.split("|");

  cells.forEach((cell, index) => {
    if (index > 0) {
      appendLiteral("|");
    }
    appendTranslatable(cell);
  });
}

function isMarkdownBoundary(lines, index) {
  const line = lines[index];

  return (
    line.trim() === "" ||
    isFenceStart(line) ||
    isIndentedCodeLine(line) ||
    isTableStart(lines, index) ||
    isHtmlBlockStart(line) ||
    isThematicBreak(line) ||
    isReferenceDefinition(line) ||
    Boolean(parseFootnote(line)) ||
    Boolean(parseHeading(line)) ||
    Boolean(parseListItem(line)) ||
    Boolean(parseBlockquote(line))
  );
}

function isFrontmatterStart(lines) {
  return lines[0]?.trim() === "---";
}

function findFrontmatterEnd(lines) {
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      return index;
    }
  }
  return -1;
}

function isFenceStart(line) {
  return /^\s{0,3}(```|~~~)/.test(line);
}

function isFenceEnd(line, fenceMarker) {
  return line.trim().startsWith(fenceMarker);
}

function isIndentedCodeLine(line) {
  return /^( {4}|\t)/.test(line);
}

function isTableStart(lines, index) {
  return Boolean(
    lines[index]?.includes("|") &&
      lines[index + 1]?.includes("|") &&
      isTableDelimiter(lines[index + 1]),
  );
}

function isTableDelimiter(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isHtmlBlockStart(line) {
  return /^\s{0,3}<\/?[A-Za-z][^>]*>\s*$/.test(line);
}

function isThematicBreak(line) {
  return /^\s{0,3}(?:([*]\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line);
}

function isReferenceDefinition(line) {
  return /^\s{0,3}\[(?!\^)[^\]\n]+]:\s+\S+.*$/.test(line);
}

function parseHeading(line) {
  const match = line.match(/^(\s{0,3}#{1,6}\s+)(.*?)(\s+#+\s*)?$/);
  if (!match) return null;

  const contentWithAnchor = match[2] || "";
  const anchorMatch = contentWithAnchor.match(/^(.*?)(\s*\{#[A-Za-z0-9_-]+\}\s*)$/);

  return {
    prefix: match[1],
    content: anchorMatch ? anchorMatch[1] : contentWithAnchor,
    suffix: `${anchorMatch ? anchorMatch[2] : ""}${match[3] || ""}`,
  };
}

function parseListItem(line) {
  const match = line.match(
    /^(\s{0,3}(?:[-+*]|\d+[.)])\s+(?:\[[ xX]\]\s+)?)([\s\S]+)$/,
  );
  if (!match) return null;

  return {
    prefix: match[1],
    content: match[2],
  };
}

function parseBlockquote(line) {
  const match = line.match(/^(\s{0,3}>\s?)([\s\S]*)$/);
  if (!match) return null;

  return {
    prefix: match[1],
    content: match[2],
  };
}

function parseFootnote(line) {
  const match = line.match(/^(\s{0,3}\[\^[^\]\n]+]:\s*)([\s\S]*)$/);
  if (!match) return null;

  return {
    prefix: match[1],
    content: match[2],
  };
}

function hasTranslatableText(value) {
  if (sourceLang.value === "zh") {
    return /\p{Script=Han}/u.test(value);
  }

  return /[A-Za-z]/.test(value);
}

function normalizeUntranslatedText(value) {
  if (sourceLang.value !== "zh" || targetLang.value !== "en") {
    return value;
  }

  return value
    .replace(/。/g, ".")
    .replace(/，/g, ",")
    .replace(/：/g, ":")
    .replace(/；/g, ";")
    .replace(/！/g, "!")
    .replace(/？/g, "?")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/“|”/g, '"')
    .replace(/‘|’/g, "'")
    .replace(/——/g, "--");
}

function restoreMarkdownTranslationText(value) {
  return normalizeTranslatedMarkdownText(String(value || "").trim());
}

function normalizeTranslatedMarkdownText(value) {
  if (sourceLang.value !== "zh" || targetLang.value !== "en") {
    return value;
  }

  return value
    .replace(/。/g, ".")
    .replace(/，/g, ",")
    .replace(/：/g, ":")
    .replace(/；/g, ";")
    .replace(/！/g, "!")
    .replace(/？/g, "?")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/“|”/g, '"')
    .replace(/‘|’/g, "'")
    .replace(/——/g, "--")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([\(\[\{])\s+/g, "$1")
    .replace(/\s+([\)\]\}])/g, "$1");
}

function splitMarkdownSegmentEdges(value) {
  if (sourceLang.value !== "zh" || targetLang.value !== "en") {
    return {
      leading: "",
      body: value,
      trailing: "",
    };
  }

  let start = 0;
  let end = value.length;

  while (start < end && isLeadingEdgePunctuation(value[start])) {
    start += 1;
  }

  while (end > start && isTrailingEdgePunctuation(value[end - 1])) {
    end -= 1;
  }

  if (start === 0 && end === value.length) {
    return {
      leading: "",
      body: value,
      trailing: "",
    };
  }

  return {
    leading: normalizeUntranslatedText(value.slice(0, start)),
    body: value.slice(start, end),
    trailing: normalizeUntranslatedText(value.slice(end)),
  };
}

function isLeadingEdgePunctuation(char) {
  return "“‘\"'([{（《「『".includes(char);
}

function isTrailingEdgePunctuation(char) {
  return "。．，,：:；;！!？?、”’\"')]}）》」』".includes(char);
}

function findNextInlineMarkdownToken(value, startIndex) {
  const candidates = [
    findInlineCodeToken(value, startIndex),
    findHtmlInlineToken(value, startIndex),
    findMarkdownImageToken(value, startIndex),
    findMarkdownLinkToken(value, startIndex),
    findBareUrlToken(value, startIndex),
    findEmailToken(value, startIndex),
    findStrongToken(value, startIndex),
    findEmphasisToken(value, startIndex),
  ].filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((first, second) => {
    if (first.index !== second.index) {
      return first.index - second.index;
    }

    return tokenPriority(first.type) - tokenPriority(second.type);
  })[0];
}

function tokenPriority(type) {
  const priority = {
    literal: 0,
    link: 1,
    emphasis: 2,
  };

  return priority[type] ?? 9;
}

function findInlineCodeToken(value, startIndex) {
  return findRegexToken(/(`+)([\s\S]*?)\1/g, value, startIndex, (match) => ({
    type: "literal",
    index: match.index,
    raw: match[0],
  }));
}

function findHtmlInlineToken(value, startIndex) {
  return findRegexToken(/<[^>\n]+>/g, value, startIndex, (match) => ({
    type: "literal",
    index: match.index,
    raw: match[0],
  }));
}

function findMarkdownImageToken(value, startIndex) {
  return findRegexToken(/!\[([^\]\n]*)\]\(([^)\n]+)\)/g, value, startIndex, (match) => ({
    type: "link",
    index: match.index,
    raw: match[0],
    open: "![",
    label: match[1],
    close: `](${match[2]})`,
  }));
}

function findMarkdownLinkToken(value, startIndex) {
  return findRegexToken(
    /(^|[^!])\[([^\]\n]+)\]\(([^)\n]+)\)/g,
    value,
    startIndex,
    (match) => {
      const prefix = match[1] || "";
      const index = match.index + prefix.length;
      const raw = match[0].slice(prefix.length);

      return {
        type: "link",
        index,
        raw,
        open: "[",
        label: match[2],
        close: `](${match[3]})`,
      };
    },
  );
}

function findBareUrlToken(value, startIndex) {
  return findRegexToken(/https?:\/\/[^\s)]+/g, value, startIndex, (match) => ({
    type: "literal",
    index: match.index,
    raw: match[0],
  }));
}

function findEmailToken(value, startIndex) {
  return findRegexToken(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    value,
    startIndex,
    (match) => ({
      type: "literal",
      index: match.index,
      raw: match[0],
    }),
  );
}

function findStrongToken(value, startIndex) {
  return findRegexToken(
    /(\*\*|__)(?=\S)([\s\S]*?\S)\1/g,
    value,
    startIndex,
    (match) => ({
      type: "emphasis",
      index: match.index,
      raw: match[0],
      open: match[1],
      content: match[2],
      close: match[1],
    }),
  );
}

function findEmphasisToken(value, startIndex) {
  const underscore = findRegexToken(
    /(^|[^\w])(_)([^_\n]*?\S[^_\n]*?)_(?!\w)/g,
    value,
    startIndex,
    (match) => {
      const prefix = match[1] || "";
      const index = match.index + prefix.length;
      const raw = match[0].slice(prefix.length);

      return {
        type: "emphasis",
        index,
        raw,
        open: "_",
        content: match[3],
        close: "_",
      };
    },
  );
  const asterisk = findRegexToken(
    /(^|[^\*])(\*)([^*\n]*?\S[^*\n]*?)\*(?!\*)/g,
    value,
    startIndex,
    (match) => {
      const prefix = match[1] || "";
      const index = match.index + prefix.length;
      const raw = match[0].slice(prefix.length);

      return {
        type: "emphasis",
        index,
        raw,
        open: "*",
        content: match[3],
        close: "*",
      };
    },
  );

  if (!underscore) return asterisk;
  if (!asterisk) return underscore;
  return underscore.index <= asterisk.index ? underscore : asterisk;
}

function findRegexToken(regex, value, startIndex, createToken) {
  regex.lastIndex = startIndex;
  const match = regex.exec(value);

  if (!match) {
    return null;
  }

  return createToken(match);
}

async function translateMarkdownSegments(segments) {
  const translations = new Map();
  const batches = createMarkdownTranslationBatches(segments);

  for (const batch of batches) {
    if (batch.length === 1) {
      const segment = batch[0];
      const translated = await translateMarkdownText(segment.protectedText);
      translations.set(segment.id, segment.restore(translated));
      continue;
    }

    const batchTranslation = await translateMarkdownBatch(batch);
    batch.forEach((segment) => {
      translations.set(segment.id, batchTranslation.get(segment.id));
    });
  }

  return translations;
}

function createMarkdownTranslationBatches(segments) {
  const batches = [];
  let currentBatch = [];
  let currentLength = 0;

  segments.forEach((segment) => {
    const markerLength = getSegmentMarker(segment.id).length + 2;
    const nextLength = segment.protectedText.length + markerLength;

    if (
      currentBatch.length > 0 &&
      currentLength + nextLength > MARKDOWN_TRANSLATION_CHUNK_LIMIT
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLength = 0;
    }

    currentBatch.push(segment);
    currentLength += nextLength;
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

async function translateMarkdownBatch(batch) {
  const source = batch
    .map((segment) => `${getSegmentMarker(segment.id)}\n${segment.protectedText}`)
    .join("\n\n");
  const translated = await translateMarkdownText(source);
  const parsed = parseMarkdownBatchTranslation(translated, batch);

  if (parsed.size === batch.length) {
    return parsed;
  }

  const fallback = new Map();
  for (const segment of batch) {
    const translatedSegment = await translateMarkdownText(segment.protectedText);
    fallback.set(segment.id, segment.restore(translatedSegment));
  }
  return fallback;
}

function parseMarkdownBatchTranslation(translated, batch) {
  const markerPattern = /@@MSEN_SEG_(\d+)@@/g;
  const markers = [...translated.matchAll(markerPattern)];
  const parsed = new Map();
  const segmentIds = new Set(batch.map((segment) => segment.id));

  markers.forEach((match, index) => {
    const id = Number(match[1]);
    if (!segmentIds.has(id)) return;

    const start = match.index + match[0].length;
    const end =
      index + 1 < markers.length ? markers[index + 1].index : translated.length;
    const segment = batch.find((item) => item.id === id);
    const value = translated.substring(start, end).trim();

    if (segment && value) {
      parsed.set(id, segment.restore(value));
    }
  });

  return parsed;
}

function getSegmentMarker(id) {
  return `@@MSEN_SEG_${id}@@`;
}

async function translateMarkdownText(text) {
  const response =
    sourceLang.value === "zh"
      ? await translateToEnglish({ text })
      : await translateToChinese({ text });

  const payload = response?.data;
  if (payload?.code !== 0) {
    throw new Error(payload?.message || "Markdown translation failed");
  }

  const translated = payload.data?.trans_result?.[0]?.dst;
  if (!translated) {
    throw new Error("Markdown translation returned empty result");
  }

  return translated;
}

function renderMarkdownTranslation(parts, translations) {
  const rendered = parts
    .map((part) => {
      if (part.type === "literal") {
        return part.value;
      }
      return translations.get(part.id) || "";
    })
    .join("");

  return normalizeRenderedMarkdownOutput(rendered);
}

function normalizeRenderedMarkdownOutput(markdown) {
  if (sourceLang.value !== "zh" || targetLang.value !== "en") {
    return markdown;
  }

  const inlineSpan =
    "(\\*\\*[^*\\n]+?\\*\\*|__[^_\\n]+?__|_[^_\\n]+?_|\\*[^*\\n]+?\\*|`+[^`\\n]+?`+|!?\\[[^\\]\\n]+\\]\\([^)\\n]+\\))";

  return markdown
    .replace(new RegExp(`([A-Za-z0-9\\)\\]])${inlineSpan}`, "g"), "$1 $2")
    .replace(new RegExp(`${inlineSpan}([A-Za-z0-9\\(\\[])`, "g"), "$1 $2")
    .replace(/([,.;:!?])\1+/g, "$1")
    .replace(/\s+([,.;:!?])/g, "$1");
}

async function translateDocumentFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response =
    sourceLang.value === "zh"
      ? await translateDocumentToEnglishWithFormat(formData, {
          timeout: 120000,
        })
      : await translateDocumentToChineseWithFormat(formData, {
          timeout: 120000,
        });

  if (response?.data instanceof Blob && response.data.size > 0) {
    translatedBlob.value = response.data;
    showToast("文档翻译完成");
    return;
  }

  showToast("翻译失败，请重试", "error");
}

function downloadResult() {
  if (!translatedBlob.value) return;

  const url = URL.createObjectURL(translatedBlob.value);
  const link = document.createElement("a");
  link.href = url;
  link.download = translatedFileName.value;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("下载已开始");
}

onMounted(() => {
  const saved = window.localStorage.getItem(HISTORY_KEY);
  if (!saved) return;

  try {
    const records = JSON.parse(saved);
    history.value = Array.isArray(records) ? records : [];
  } catch (error) {
    console.error("解析翻译历史失败:", error);
  }
});

onBeforeUnmount(() => {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
});
</script>

<style scoped>
.translation-page {
  --paper: var(--color-bg-primary, #f1efe9);
  --paper-soft: #f7f5ef;
  --ink: var(--color-text-primary, #282828);
  --muted: #6b665f;
  --rule: var(--color-accent-secondary, #e2ded1);
  --accent: #516b5b;
  --danger: #8f3f35;
  --serif: Georgia, "Songti SC", "STSong", "Noto Serif CJK SC",
    "Source Han Serif SC", serif;
  --sans: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC",
    "Source Han Sans SC", system-ui, sans-serif;

  min-height: 100dvh;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(280px, 0.76fr) minmax(0, 1.62fr);
  gap: clamp(2rem, 5vw, 5.5rem);
  padding: clamp(2rem, 5vw, 4.5rem);
  background:
    linear-gradient(90deg, rgba(40, 40, 40, 0.032) 1px, transparent 1px),
    var(--paper);
  background-size: 3.5rem 3.5rem;
  color: var(--ink);
  font-family: var(--sans);
}

.translation-rail {
  position: sticky;
  top: clamp(2rem, 5vw, 4.5rem);
  align-self: start;
  min-height: calc(100dvh - clamp(4rem, 10vw, 9rem));
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-right: clamp(1rem, 3vw, 3rem);
  border-right: 1px solid var(--rule);
}

.rail-kicker,
.status-kicker,
.pane-heading,
.pane-footer,
.rail-stats dt,
.history-item span,
.history-item small,
.section-title p,
.file-brief dt {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--ink) 58%, transparent);
}

.rail-kicker,
.status-kicker,
.rail-stats dt,
.file-brief dt {
  text-transform: uppercase;
}

.translation-rail h1 {
  max-width: 7ch;
  margin: 1rem 0 1.25rem;
  font-family: var(--serif);
  font-size: clamp(4rem, 7vw, 7.8rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: -0.03em;
}

.rail-copy,
.rail-note p,
.document-status p,
.section-title p {
  max-width: 27rem;
  margin: 0;
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.8;
  color: color-mix(in srgb, var(--ink) 72%, transparent);
}

.rail-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: auto 0 0;
}

.rail-stats div {
  padding-top: 1rem;
  border-top: 1px solid var(--rule);
}

.rail-stats dd {
  margin: 0.55rem 0 0;
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  font-weight: 800;
  line-height: 1.05;
}

.rail-note {
  padding-top: 1.5rem;
  border-top: 1px solid var(--rule);
}

.rail-note h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.translation-board {
  min-width: 0;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--ink);
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(8rem, 1fr));
  gap: 1px;
  border: 1px solid var(--rule);
  background: var(--rule);
}

.mode-tabs button,
.icon-button,
.text-action,
.primary-button,
.history-item,
.upload-dropzone,
.download-card {
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.mode-tabs button {
  min-height: 3rem;
  border: 0;
  background: var(--paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0 1rem;
  font-weight: 800;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.mode-tabs button.active {
  background: var(--ink);
  color: var(--paper);
}

.mode-tabs :deep(svg),
.language-switcher :deep(svg),
.card-topline :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: color-mix(in srgb, var(--ink) 72%, transparent);
  font-weight: 800;
}

.icon-button {
  width: 2.65rem;
  height: 2.65rem;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: transparent;
  display: inline-grid;
  place-items: center;
  color: var(--ink);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.icon-button:hover:not(:disabled),
.text-action:hover:not(:disabled),
.mode-tabs button:hover:not(.active),
.upload-dropzone:hover,
.download-card:hover {
  background: var(--rule);
}

.icon-button:active:not(:disabled),
.text-action:active:not(:disabled),
.primary-button:active:not(:disabled),
.mode-tabs button:active,
.history-item:active,
.upload-dropzone:active,
.download-card:active {
  transform: translateY(1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

.workspace-shell {
  border: 1px solid var(--rule);
  background: var(--paper);
}

.text-grid,
.document-grid {
  display: grid;
  gap: 1px;
  background: var(--rule);
}

.text-grid {
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  min-height: 31rem;
}

.text-pane,
.upload-panel,
.document-status {
  min-width: 0;
  background: var(--paper);
}

.text-pane {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 1rem;
  padding: clamp(1.25rem, 2.5vw, 2rem);
}

.output-pane,
.document-status {
  background: var(--paper-soft);
}

.pane-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-weight: 800;
}

.translate-input {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: clamp(1rem, 1.2vw, 1.12rem);
  line-height: 1.8;
}

.translate-input::placeholder {
  color: color-mix(in srgb, var(--ink) 42%, transparent);
}

.translated-text {
  margin: 0;
  font-size: clamp(1rem, 1.2vw, 1.12rem);
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state,
.loading-state {
  display: grid;
  align-content: center;
  gap: 0.875rem;
  min-height: 12rem;
  color: color-mix(in srgb, var(--ink) 58%, transparent);
}

.loading-line {
  display: block;
  width: min(100%, 22rem);
  height: 0.75rem;
  border-radius: 6px;
  background: color-mix(in srgb, var(--ink) 15%, transparent);
  animation: pulse 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.loading-line.short {
  width: min(64%, 14rem);
}

.loading-state p {
  margin: 0;
  font-size: 0.9rem;
}

.pane-footer {
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--rule);
  padding-top: 1rem;
}

.text-action {
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: transparent;
  padding: 0 0.9rem;
  font-weight: 800;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.command-row {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem;
  border-top: 1px solid var(--rule);
}

.primary-button {
  min-width: 12rem;
  min-height: 3rem;
  border: 1px solid var(--ink);
  border-radius: 6px;
  background: var(--ink);
  color: var(--paper);
  padding: 0 1.35rem;
  font-weight: 800;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.primary-button:hover:not(:disabled) {
  background: #3a3935;
}

.recent-section {
  padding: 1.25rem;
  border-top: 1px solid var(--rule);
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
  border: 1px solid var(--rule);
  background: var(--rule);
}

.history-item {
  min-width: 0;
  min-height: 8.5rem;
  border: 0;
  background: var(--paper);
  display: grid;
  align-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  text-align: left;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.history-item:hover {
  background: var(--paper-soft);
}

.history-item strong,
.history-item small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item strong {
  font-size: 1rem;
  line-height: 1.35;
}

.document-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.88fr);
  min-height: 32rem;
}

.upload-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: clamp(1.25rem, 2.5vw, 2rem);
}

.upload-dropzone {
  width: 100%;
  min-height: 26rem;
  box-sizing: border-box;
  border: 1px dashed var(--ink);
  border-radius: 8px;
  background: transparent;
  display: grid;
  align-content: center;
  gap: 0.9rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  text-align: left;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.upload-dropzone.dragover,
.upload-dropzone.selected {
  border-style: solid;
  background: var(--paper-soft);
}

.upload-badge {
  width: fit-content;
  border: 1px solid var(--rule);
  border-radius: 6px;
  padding: 0.4rem 0.65rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.upload-dropzone strong {
  max-width: 16ch;
  font-family: var(--serif);
  font-size: clamp(2rem, 4vw, 4.5rem);
  font-weight: 600;
  line-height: 1.05;
  word-break: break-word;
}

.upload-dropzone small {
  max-width: 29rem;
  color: color-mix(in srgb, var(--ink) 66%, transparent);
  font-size: 0.96rem;
  line-height: 1.7;
}

.file-input {
  display: none;
}

.remove-file {
  justify-self: start;
}

.document-status {
  display: grid;
  align-content: space-between;
  gap: 2rem;
  padding: clamp(1.25rem, 2.5vw, 2rem);
}

.document-status h2 {
  margin: 0.75rem 0 0;
  font-family: var(--serif);
  font-size: clamp(2rem, 3.6vw, 4.25rem);
  font-weight: 600;
  line-height: 1.05;
}

.document-status p {
  margin-top: 1rem;
}

.file-brief {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  border: 1px solid var(--rule);
  background: var(--rule);
}

.file-brief div {
  padding: 1rem;
  background: var(--paper);
}

.file-brief dd {
  margin: 0.55rem 0 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.download-card {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--ink);
  border-radius: 8px;
  background: transparent;
  display: grid;
  gap: 0.4rem;
  padding: 1rem;
  text-align: left;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.download-card span {
  color: color-mix(in srgb, var(--ink) 62%, transparent);
  font-size: 0.88rem;
}

.download-card strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  z-index: 1000;
  min-width: 12rem;
  border: 1px solid var(--ink);
  border-radius: 6px;
  background: var(--ink);
  color: var(--paper);
  padding: 0.875rem 1rem;
  text-align: center;
  font-weight: 800;
  transform: translateX(-50%);
}

.toast.error {
  border-color: var(--danger);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.5rem);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.72;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}

@media (max-width: 1180px) {
  .translation-page {
    grid-template-columns: 1fr;
  }

  .translation-rail {
    position: static;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--rule);
    padding: 0 0 2rem;
  }

  .rail-stats {
    margin-top: 1rem;
  }
}

@media (max-width: 820px) {
  .translation-page {
    padding: 1.25rem;
  }

  .board-toolbar,
  .section-title {
    align-items: stretch;
    flex-direction: column;
  }

  .mode-tabs,
  .language-switcher {
    width: 100%;
  }

  .text-grid,
  .document-grid,
  .history-list {
    grid-template-columns: 1fr;
  }

  .text-grid,
  .document-grid {
    min-height: auto;
  }

  .text-pane {
    min-height: 22rem;
  }

  .upload-dropzone {
    min-height: 20rem;
  }
}

@media (max-width: 560px) {
  .translation-page {
    padding: 1rem;
  }

  .translation-rail h1 {
    font-size: clamp(3.2rem, 18vw, 5rem);
  }

  .rail-stats,
  .file-brief {
    grid-template-columns: 1fr;
  }

  .mode-tabs {
    grid-template-columns: 1fr;
  }

  .language-switcher {
    justify-content: space-between;
  }

  .command-row {
    padding: 1rem;
  }

  .primary-button {
    width: 100%;
  }
}
</style>
