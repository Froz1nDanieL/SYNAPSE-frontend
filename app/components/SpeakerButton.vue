<script setup>
import { ref, computed } from "vue";
import { getWordPronunciation } from "~/composables/api/wordLearnController";
import { message } from "ant-design-vue";

const props = defineProps({
  word: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    default: 1,
    validator: (value) => value === 1 || value === 2,
  },
  size: {
    type: String,
    default: "24px",
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["play", "error"]);

const audioState = ref("idle");
const audioElement = ref(null);
const retryCount = ref(0);
const maxRetries = 3;

const isLoading = computed(() => audioState.value === "loading");
const isPlaying = computed(() => audioState.value === "playing");

const typeLabel = computed(() => (props.type === 1 ? "UK" : "US"));
const typeLabelFull = computed(() => (props.type === 1 ? "英式" : "美式"));

async function playPronunciation() {
  if (isLoading.value || isPlaying.value) {
    return;
  }

  audioState.value = "loading";
  retryCount.value = 0;

  try {
    const response = await getWordPronunciation(
      {
        word: props.word,
        type: props.type,
      },
      {
        responseType: "blob",
      }
    );

    if (response.data) {
      const audioBlob = response.data;
      const audioUrl = URL.createObjectURL(audioBlob);
      await playAudio(audioUrl);
      emit("play");
    } else {
      throw new Error("未获取到音频数据");
    }
  } catch (error) {
    console.error("发音播放失败:", error);
    handlePlayError(error);
  }
}

async function playAudio(audioUrl) {
  return new Promise((resolve, reject) => {
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.src = "";
    }

    const audio = new Audio(audioUrl);
    audioElement.value = audio;

    audio.onloadeddata = () => {
      audioState.value = "playing";
      audio.play().catch(reject);
    };

    audio.onended = () => {
      audioState.value = "idle";
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = () => {
      audioState.value = "idle";
      URL.revokeObjectURL(audioUrl);
      reject(new Error("音频播放失败"));
    };

    audio.load();
  });
}

function handlePlayError(error) {
  audioState.value = "idle";

  if (retryCount.value < maxRetries) {
    retryCount.value++;
    message.warning(
      `发音加载失败，正在重试 (${retryCount.value}/${maxRetries})...`
    );
    setTimeout(() => {
      playPronunciation();
    }, 1000);
  } else {
    message.error("发音播放失败，请稍后重试");
    emit("error", error);
  }
}

function handleClick(event) {
  event.stopPropagation();
  playPronunciation();
}
</script>

<template>
  <div class="speaker-button-wrapper">
    <button
      class="speaker-button"
      :class="{ 'is-loading': isLoading, 'is-playing': isPlaying }"
      @click="handleClick"
      :disabled="isLoading || isPlaying"
      :style="{ '--size': size }"
      :aria-label="`${word} ${typeLabelFull}发音`"
    >
      <svg
        class="speaker-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path
          class="sound-wave-1"
          d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
        ></path>
      </svg>
      <div class="pulse-ring"></div>
    </button>
    <span v-if="showLabel" class="speaker-label">{{ typeLabel }}</span>
  </div>
</template>

<style scoped>
.speaker-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.speaker-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease, transform 0.2s ease;
  outline: none;
}

.speaker-button:hover:not(:disabled) {
  color: #333;
  transform: scale(1.1);
}

.speaker-button:active:not(:disabled) {
  transform: scale(0.95);
}

.speaker-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.speaker-icon {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.speaker-button.is-playing .speaker-icon {
  animation: speaker-pulse 0.6s ease-in-out infinite;
}

.sound-wave-1 {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.speaker-button.is-playing .sound-wave-1 {
  animation: wave-pulse 0.8s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0;
  pointer-events: none;
}

.speaker-button.is-playing .pulse-ring {
  animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.speaker-label {
  font-size: 10px;
  font-weight: 600;
  color: #888;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.speaker-button-wrapper:hover .speaker-label {
  color: #555;
}

@keyframes speaker-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes wave-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .speaker-button:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .speaker-label {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .speaker-button:hover:not(:disabled) {
    transform: none;
  }

  .speaker-label {
    font-size: 8px;
  }
}
</style>
