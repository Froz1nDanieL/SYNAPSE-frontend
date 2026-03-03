<template>
  <div class="doc-translate-container">
    <div class="doc-translate-wrapper">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">文档翻译</h1>
        <p class="page-subtitle">上传文档，一键翻译</p>
      </div>

      <!-- 翻译主卡片 -->
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

        <!-- 文件上传区域 -->
        <div class="upload-section">
          <div
            class="upload-area"
            :class="{
              'upload-area--dragover': isDragOver,
              'upload-area--has-file': uploadedFile,
            }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              class="file-input"
              accept=".docx,.pdf,.md"
              @change="handleFileSelect"
            />

            <div v-if="!uploadedFile" class="upload-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 13H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 17H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 9H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p class="upload-text">点击或拖拽文件到此处</p>
              <p class="upload-hint">支持 .docx、.pdf、.md 格式</p>
            </div>

            <div v-else class="upload-file-info">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="file-details">
                <p class="file-name">{{ uploadedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(uploadedFile.size) }}</p>
              </div>
              <button class="remove-file-btn" @click.stop="removeFile">
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
        </div>

        <!-- 翻译按钮 -->
        <div class="translate-actions">
          <button
            class="translate-btn"
            @click="handleTranslate"
            :disabled="!uploadedFile || isTranslating"
          >
            <span v-if="isTranslating">翻译中...</span>
            <span v-else>开始翻译</span>
          </button>
        </div>
      </div>

      <!-- 翻译结果 -->
      <div v-if="translatedBlob || isTranslating" class="result-section">
        <div class="result-header">
          <h3 class="result-title">翻译结果</h3>
        </div>

        <div v-if="isTranslating" class="loading-state">
          <div class="loading-spinner"></div>
          <span>正在翻译文档...</span>
        </div>

        <div v-else-if="translatedBlob" class="result-content">
          <div class="file-card" @click="downloadResult">
            <div class="file-card-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 13H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 17H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 9H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="file-card-info">
              <p class="file-card-name">
                {{ `translated_${uploadedFile?.name || "document"}` }}
              </p>
              <p class="file-card-desc">
                {{ uploadedFile ? formatFileSize(uploadedFile.size) : "文档" }}
              </p>
            </div>
            <div class="file-card-download">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 10L12 15L17 10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 15V3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
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
import { ref } from "vue";
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
  title: "文档翻译 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "文档翻译 - 上传文档一键翻译",
    },
  ],
});

// 状态
const sourceLang = ref("zh");
const targetLang = ref("en");
const isTranslating = ref(false);
const uploadedFile = ref(null);
const fileInput = ref(null);
const isDragOver = ref(false);
const translatedBlob = ref(null);
const toast = ref({
  show: false,
  message: "",
  type: "success",
});

// 显示提示
function showToast(message, type = "success") {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

// 切换语言
function swapLanguages() {
  const temp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;
}

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click();
}

// 处理文件选择
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
}

// 处理拖拽
function handleDragOver() {
  isDragOver.value = true;
}

function handleDragLeave() {
  isDragOver.value = false;
}

function handleDrop(event) {
  isDragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
}

// 验证并设置文件
function validateAndSetFile(file) {
  const validExtensions = [".docx", ".pdf", ".md"];
  const fileExtension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    showToast("仅支持 .docx、.pdf 和 .md 格式文件", "error");
    return;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showToast("文件大小不能超过 10MB", "error");
    return;
  }

  uploadedFile.value = file;
}

// 移除文件
function removeFile() {
  uploadedFile.value = null;
  translatedBlob.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 创建 FormData
function createFormData(file) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

// 读取文件内容为文本
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// 执行翻译
async function handleTranslate() {
  if (!uploadedFile.value || isTranslating.value) return;

  isTranslating.value = true;
  translatedBlob.value = null;

  try {
    const file = uploadedFile.value;
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (fileExtension === ".md") {
      await translateMarkdownFile(file);
    } else {
      await translateDocumentFile(file);
    }
  } catch (error) {
    console.error("翻译错误:", error);
    console.error("错误详情:", error.message, error.stack);
    if (error.code === "ECONNABORTED") {
      showToast("翻译超时，请稍后重试", "error");
    } else {
      showToast("网络错误，请检查网络连接", "error");
    }
  } finally {
    isTranslating.value = false;
  }
}

// 翻译 Markdown 文件
async function translateMarkdownFile(file) {
  const content = await readFileAsText(file);
  const paragraphs = content.split(/\n+/).filter((p) => p.trim());

  let translatedParagraphs = [];
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      let response;
      if (sourceLang.value === "zh") {
        response = await translateToEnglish({ text: paragraph });
      } else {
        response = await translateToChinese({ text: paragraph });
      }

      if (response.data?.data?.trans_result?.[0]?.dst) {
        translatedParagraphs.push(response.data.data.trans_result[0].dst);
      } else {
        translatedParagraphs.push(paragraph);
      }
    }
  }

  const translatedContent = translatedParagraphs.join("\n\n");
  const blob = new Blob([translatedContent], {
    type: "text/markdown;charset=utf-8",
  });
  translatedBlob.value = blob;
  showToast("翻译完成");
}

// 翻译文档文件（.docx, .pdf）
async function translateDocumentFile(file) {
  const formData = createFormData(file);

  let response;
  if (sourceLang.value === "zh") {
    response = await translateDocumentToEnglishWithFormat(formData, {
      timeout: 120000,
    });
  } else {
    response = await translateDocumentToChineseWithFormat(formData, {
      timeout: 120000,
    });
  }

  console.log("翻译响应:", response);

  if (response.data instanceof Blob) {
    translatedBlob.value = response.data;
    showToast("翻译完成");
  } else {
    console.log("响应数据不是Blob类型");
    showToast("翻译失败，请重试", "error");
  }
}

// 下载翻译结果
function downloadResult() {
  if (!translatedBlob.value) return;

  const url = URL.createObjectURL(translatedBlob.value);
  const link = document.createElement("a");
  link.href = url;

  const originalName = uploadedFile.value?.name || "document";
  const nameWithoutExt = originalName.substring(
    0,
    originalName.lastIndexOf("."),
  );
  const ext = originalName.substring(originalName.lastIndexOf("."));
  link.download = `translated_${nameWithoutExt}${ext}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("下载已开始");
}
</script>

<style scoped>
.doc-translate-container {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1.5rem;
}

.doc-translate-wrapper {
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

/* 上传区域 */
.upload-section {
  padding: 2rem 1.5rem;
}

.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: var(--color-text-primary);
  background-color: var(--color-accent-secondary);
}

.upload-area--dragover {
  border-color: var(--color-text-primary);
  background-color: var(--color-accent-secondary);
  transform: scale(1.02);
}

.upload-area--has-file {
  border-style: solid;
  border-color: var(--color-text-primary);
  background-color: #fff;
  padding: 1.5rem;
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-placeholder svg {
  color: rgba(40, 40, 40, 0.3);
  transition: color 0.3s ease;
}

.upload-area:hover .upload-placeholder svg {
  color: var(--color-text-primary);
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: rgba(40, 40, 40, 0.5);
  margin: 0;
}

.upload-file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.upload-file-info svg {
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
  word-break: break-all;
}

.file-size {
  font-size: 0.875rem;
  color: rgba(40, 40, 40, 0.5);
  margin: 0;
}

.remove-file-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.06);
  color: rgba(40, 40, 40, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background-color: #dc2626;
  color: #fff;
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

/* 翻译结果 */
.result-section {
  background-color: #fff;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.result-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 0.75rem;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--color-accent-secondary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background-color: var(--color-text-primary);
  color: #fff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: rgba(40, 40, 40, 0.5);
  font-size: 0.9375rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background-color: var(--color-bg-primary);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.file-card:hover {
  border-color: var(--color-text-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.file-card:active {
  transform: translateY(0);
}

.file-card-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.file-card-info {
  flex: 1;
  min-width: 0;
}

.file-card-name {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.375rem 0;
  word-break: break-all;
}

.file-card-desc {
  font-size: 0.875rem;
  color: rgba(40, 40, 40, 0.5);
  margin: 0;
}

.file-card-download {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-text-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.file-card:hover .file-card-download {
  background-color: #3a3a3a;
  transform: scale(1.05);
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
  .doc-translate-container {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .upload-area {
    padding: 2rem 1rem;
  }

  .upload-file-info {
    flex-direction: column;
    text-align: center;
  }

  .file-details {
    text-align: center;
  }

  .result-paragraph {
    padding: 0.875rem;
    font-size: 0.9375rem;
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

  .upload-section {
    padding: 1.5rem 1rem;
  }

  .upload-area {
    padding: 1.5rem 1rem;
  }

  .upload-placeholder svg {
    width: 36px;
    height: 36px;
  }

  .upload-text {
    font-size: 0.9375rem;
  }

  .upload-hint {
    font-size: 0.8125rem;
  }

  .translate-btn {
    padding: 0.875rem 1.5rem;
  }

  .result-section {
    padding: 1rem;
  }

  .result-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
