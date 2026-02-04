<template>
  <div class="word-main-container">
    <div class="content-wrapper">
      <div class="page-header">
        <h1 class="page-title">单词学习</h1>
        <p class="page-subtitle">开启你的英语学习之旅</p>
      </div>

      <div class="checkin-section">
        <div
          class="checkin-button"
          @click="handleCheckIn"
          :class="{ checked: isCheckedIn }"
        >
          <div class="checkin-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 12L11 15L16 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="checkin-text">{{
            isCheckedIn ? "今日已签到" : "每日签到"
          }}</span>
          <div class="checkin-ripple"></div>
        </div>
      </div>

      <div class="cards-row">
        <div class="small-card" @click="navigateToWordMemory">
          <div class="small-card-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="small-card-title">背单词</span>
          <span class="small-card-count">{{ newWordCount }}</span>
        </div>

        <div class="small-card disabled">
          <div class="small-card-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21H3V3H21V21Z"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 9H15"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 13H15"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 17H13"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="small-card-title">复习单词</span>
          <span class="small-card-count">{{ reviewWordCount }}</span>
        </div>

        <div class="small-card" @click="navigateToWordBook">
          <div class="small-card-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                stroke="#282828"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="small-card-title">生词本</span>
          <span class="small-card-count">{{ collectedWordCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getNewWordList } from "~/composables/api/wordLearnController";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "单词学习 - SYNAPSE",
  meta: [
    {
      name: "description",
      content: "单词学习主页 - 背单词、复习单词、签到、生词本",
    },
  ],
});

const router = useRouter();

const newWordCount = ref(0);
const reviewWordCount = ref(0);
const collectedWordCount = ref(0);
const isCheckedIn = ref(false);

onMounted(async () => {
  await fetchNewWordCount();
  await fetchCollectedWordCount();
  checkInStatus();
});

async function fetchNewWordCount() {
  try {
    const response = await getNewWordList();
    if (response.data && response.data.code === 0 && response.data.data) {
      newWordCount.value = Array.isArray(response.data.data)
        ? response.data.data.length
        : 0;
    }
  } catch (error) {
    console.error("获取新词数量失败:", error);
    newWordCount.value = 0;
  }
}

async function fetchCollectedWordCount() {
  collectedWordCount.value = 0;
}

function checkInStatus() {
  const today = new Date().toDateString();
  const lastCheckIn = localStorage.getItem("lastCheckIn");
  isCheckedIn.value = lastCheckIn === today;
}

function handleCheckIn() {
  if (isCheckedIn.value) {
    return;
  }

  const today = new Date().toDateString();
  localStorage.setItem("lastCheckIn", today);
  isCheckedIn.value = true;
}

function navigateToWordMemory() {
  router.push("/word/word-memory");
}

function navigateToWordBook() {
  router.push("/word/word-book");
}
</script>

<style scoped>
.word-main-container {
  height: 100vh;
  background-color: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.content-wrapper {
  width: 100%;
  max-width: 1000px;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #282828;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 1rem;
  color: #282828;
  opacity: 0.7;
  margin: 0;
}

.checkin-section {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.checkin-button {
  position: relative;
  background-color: #282828;
  color: #f1efe9;
  border: none;
  border-radius: 50px;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.checkin-button:hover:not(.checked) {
  transform: scale(1.05);
  background-color: #3a3a3a;
}

.checkin-button:active:not(.checked) {
  transform: scale(0.98);
}

.checkin-button.checked {
  background-color: #e2ded1;
  color: #282828;
  cursor: default;
}

.checkin-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkin-button:hover .checkin-icon {
  transform: rotate(360deg);
}

.checkin-button.checked .checkin-icon {
  transform: scale(1.2);
}

.checkin-text {
  transition: all 0.3s ease;
}

.checkin-ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.cards-row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
}

.small-card {
  background-color: #e2ded1;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-width: 120px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.small-card:hover {
  border-color: #282828;
  transform: translateY(-4px);
}

.small-card:active {
  transform: translateY(-2px);
}

.small-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.small-card.disabled:hover {
  border-color: transparent;
  transform: none;
}

.small-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.small-card:hover .small-card-icon {
  transform: scale(1.1);
}

.small-card.disabled .small-card-icon {
  opacity: 0.5;
}

.small-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
}

.small-card-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

@media (max-width: 768px) {
  .word-main-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .checkin-button {
    padding: 0.875rem 2.5rem;
    font-size: 1rem;
  }

  .cards-row {
    gap: 1rem;
  }

  .small-card {
    padding: 1.25rem;
    min-width: 100px;
  }

  .small-card-title {
    font-size: 0.75rem;
  }

  .small-card-count {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.75rem;
  }

  .checkin-section {
    margin-bottom: 2rem;
  }

  .checkin-button {
    padding: 0.75rem 2rem;
    font-size: 0.875rem;
  }

  .checkin-icon svg {
    width: 24px;
    height: 24px;
  }

  .cards-row {
    gap: 0.75rem;
  }

  .small-card {
    padding: 1rem;
    min-width: 85px;
  }

  .small-card-icon svg {
    width: 20px;
    height: 20px;
  }

  .small-card-title {
    font-size: 0.6875rem;
  }

  .small-card-count {
    font-size: 1.125rem;
  }
}
</style>
