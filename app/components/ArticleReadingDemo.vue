<template>
  <div class="article-reading-demo">
    <div class="demo-container">
      <div class="article-content" ref="articleContainer">
        <div class="article-text">
          <span
            v-for="(word, index) in words"
            :key="index"
            class="word-span"
            :class="{ highlighted: highlightedWord === index }"
            @click="handleWordClick(word, index, $event)"
          >
            {{ word.text }}
          </span>
        </div>

        <Transition name="card-fade">
          <div
            v-if="showWordCard && selectedWord"
            class="word-card-popup"
            :style="cardPosition"
            :key="cardKey"
          >
            <div class="word-card">
              <div class="word-card-header">
                <div class="word-title">{{ selectedWord.word }}</div>
                <div class="word-phonetic">/{{ selectedWord.phonetic }}/</div>
              </div>
              <div class="word-card-body">
                <div class="word-definition">{{ selectedWord.definition }}</div>
                <div class="word-translation">
                  {{ selectedWord.translation }}
                </div>
                <div v-if="selectedWord.example" class="word-example">
                  <span class="example-label">Example:</span>
                  <span class="example-text">{{ selectedWord.example }}</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <div v-if="isPlaying" class="cursor-element" :style="cursorStyle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
              fill="#282828"
              stroke="#fff"
              stroke-width="1.5"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  articleText: {
    type: String,
    default:
      "Technology has transformed the way we communicate and learn in the modern world. Digital platforms enable instant access to information across the globe. Through innovative solutions, people can now connect with others regardless of geographical boundaries. The rapid advancement of technology continues to reshape our daily lives, making knowledge more accessible than ever before. Educational resources and professional development opportunities are readily available through various online channels, empowering individuals to enhance their skills and expand their horizons.",
  },
  vocabulary: {
    type: Array,
    default: () => [
      {
        word: "Technology",
        text: "Technology",
        phonetic: "tekˈnɒlədʒi",
        definition:
          "The application of scientific knowledge for practical purposes",
        translation: "技术",
        example: "Modern technology has changed our lives.",
      },
      {
        word: "communicate",
        text: "communicate",
        phonetic: "kəˈmjuːnɪkeɪt",
        definition: "To exchange information or ideas with someone",
        translation: "交流",
        example: "We communicate through various digital channels.",
      },
      {
        word: "platform",
        text: "platform",
        phonetic: "ˈplætfɔːm",
        definition:
          "A raised level surface or a digital system for delivering content",
        translation: "平台",
        example: "This platform provides excellent learning resources.",
      },
      {
        word: "access",
        text: "access",
        phonetic: "ˈækses",
        definition: "The means or opportunity to approach or enter a place",
        translation: "访问",
        example: "Students have access to online libraries.",
      },
      {
        word: "innovative",
        text: "innovative",
        phonetic: "ˈɪnəvətɪv",
        definition: "Featuring new methods; advanced and original",
        translation: "创新的",
        example:
          "The company developed innovative solutions to solve the problem.",
      },
      {
        word: "solutions",
        text: "solutions",
        phonetic: "səˈluːʃnz",
        definition:
          "Means of solving a problem or dealing with a difficult situation",
        translation: "解决方案",
        example: "We need practical solutions to these complex challenges.",
      },
      {
        word: "advancement",
        text: "advancement",
        phonetic: "ədˈvɑːnsmənt",
        definition:
          "The process of promoting a cause or plan; development or improvement",
        translation: "进步",
        example: "The rapid advancement of technology has transformed society.",
      },
      {
        word: "accessible",
        text: "accessible",
        phonetic: "əkˈsesəbl",
        definition:
          "Easily reached, entered, or used by people who have a disability",
        translation: "可访问的",
        example: "The website is accessible to users with disabilities.",
      },
    ],
  },
  playbackSpeed: {
    type: Number,
    default: 2000,
    validator: (value) => value >= 500,
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["wordClick", "playbackStart", "playbackEnd"]);

const articleContainer = ref(null);
const showWordCard = ref(false);
const selectedWord = ref(null);
const highlightedWord = ref(-1);
const cardPosition = ref({ top: "0px", left: "0px" });
const isPlaying = ref(false);
const cursorStyle = ref({ top: "0px", left: "0px", opacity: "0" });
const cardKey = ref(0);

let playbackInterval = null;
let currentPlaybackIndex = 0;
let autoPlayTimeout = null;

const words = computed(() => {
  const text = props.articleText;
  const vocabMap = new Map();

  props.vocabulary.forEach((v) => {
    vocabMap.set(v.word.toLowerCase(), v);
  });

  return text
    .split(/(\s+)/)
    .filter((w) => w.trim())
    .map((wordText) => {
      const cleanWord = wordText.replace(/[^\w]/g, "").toLowerCase();
      const vocab = vocabMap.get(cleanWord);
      return {
        text: wordText,
        isVocab: !!vocab,
        vocab: vocab || null,
      };
    });
});

const vocabWords = computed(() => {
  return words.value
    .map((w, i) => ({ ...w.vocab, index: i }))
    .filter((w) => w.word);
});

function handleWordClick(word, index, event) {
  if (word.isVocab && word.vocab) {
    selectedWord.value = word.vocab;
    highlightedWord.value = index;
    showWordCard.value = true;
    cardKey.value++;

    const rect = event.target.getBoundingClientRect();
    const containerRect = articleContainer.value.getBoundingClientRect();

    cardPosition.value = {
      top: `${rect.bottom - containerRect.top + 10}px`,
      left: `${rect.left - containerRect.left}px`,
    };

    emit("wordClick", word.vocab);
  } else {
    closeWordCard();
  }
}

function closeWordCard() {
  showWordCard.value = false;
  selectedWord.value = null;
  highlightedWord.value = -1;
}

function startPlayback() {
  isPlaying.value = true;
  currentPlaybackIndex = 0;
  emit("playbackStart");

  if (vocabWords.value.length === 0) {
    return;
  }

  playNextWord();
}

function playNextWord() {
  if (!isPlaying.value) {
    return;
  }

  if (currentPlaybackIndex >= vocabWords.value.length) {
    currentPlaybackIndex = 0;
    setTimeout(() => {
      playNextWord();
    }, 1000);
    return;
  }

  const wordData = vocabWords.value[currentPlaybackIndex];
  const wordElement =
    articleContainer.value?.querySelectorAll(".word-span")[wordData.index];

  if (wordElement) {
    const rect = wordElement.getBoundingClientRect();
    const containerRect = articleContainer.value.getBoundingClientRect();

    cursorStyle.value = {
      top: `${rect.top - containerRect.top + 12}px`,
      left: `${rect.left - containerRect.left}px`,
      opacity: "1",
    };

    setTimeout(() => {
      handleWordClick({ isVocab: true, vocab: wordData }, wordData.index, {
        target: wordElement,
      });

      currentPlaybackIndex++;
      playbackInterval = setTimeout(playNextWord, props.playbackSpeed);
    }, 700);
  } else {
    currentPlaybackIndex++;
    playbackInterval = setTimeout(playNextWord, 100);
  }
}

function stopPlayback() {
  isPlaying.value = false;
  cursorStyle.value = { ...cursorStyle.value, opacity: "0" };

  if (playbackInterval) {
    clearTimeout(playbackInterval);
    playbackInterval = null;
  }

  if (autoPlayTimeout) {
    clearTimeout(autoPlayTimeout);
    autoPlayTimeout = null;
  }

  setTimeout(() => {
    closeWordCard();
  }, 1000);

  emit("playbackEnd");
}

function resetDemo() {
  stopPlayback();
  closeWordCard();
  currentPlaybackIndex = 0;

  if (props.autoPlay) {
    autoPlayTimeout = setTimeout(() => {
      startPlayback();
    }, 500);
  }
}

onMounted(() => {
  if (props.autoPlay) {
    autoPlayTimeout = setTimeout(() => {
      startPlayback();
    }, 1000);
  }
});

onUnmounted(() => {
  if (playbackInterval) {
    clearTimeout(playbackInterval);
  }
  if (autoPlayTimeout) {
    clearTimeout(autoPlayTimeout);
  }
});

watch(
  () => props.articleText,
  () => {
    closeWordCard();
    resetDemo();
  }
);

watch(
  () => props.autoPlay,
  (newVal) => {
    if (newVal && !isPlaying.value) {
      resetDemo();
    }
  }
);
</script>

<style scoped>
.article-reading-demo {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-container {
  background: #ffffff;
  border-radius: 12px;
  position: relative;
}

.article-content {
  position: relative;
  min-height: 300px;
  padding: 1.5rem;
  background: #e2ded1;
  border-radius: 8px;
  border: 3px solid #282828;
  overflow: visible;
}

.article-text {
  font-size: 1.25rem;
  color: #282828;
  text-align: justify;
}

.word-span {
  display: inline-block;
  padding: 2px 6px;
  margin: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  position: relative;
}

.word-span:hover {
  background-color: #e2ded1;
}

.word-span.highlighted {
  background-color: #d4cfc0;
  color: #282828;
  text-shadow: 0 0 0.5px rgba(40, 40, 40, 0.3);
}

.word-card-popup {
  position: absolute;
  z-index: 100;
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.word-card {
  background: #e2ded1;
  border-radius: 8px;
  border: 2px solid #282828;
  padding: 1.5rem;
  min-width: 280px;
  max-width: 350px;
}

.word-card-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #282828;
}

.word-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #282828;
  margin-bottom: 0.25rem;
}

.word-phonetic {
  font-size: 1rem;
  color: #282828;
  font-style: italic;
  opacity: 0.8;
}

.word-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.word-definition {
  font-size: 1rem;
  color: #282828;
  line-height: 1.5;
  opacity: 0.85;
}

.word-translation {
  font-size: 1.1rem;
  color: #282828;
  font-weight: 500;
}

.word-example {
  background: #ffffff;
  border: 1px solid #282828;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.example-label {
  font-weight: 600;
  color: #282828;
  margin-right: 0.5rem;
}

.example-text {
  color: #282828;
  font-style: italic;
  opacity: 0.85;
}

.cursor-element {
  position: absolute;
  z-index: 50;
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2ded1;
}

.control-button {
  padding: 0.75rem 2rem;
  border: 2px solid #282828;
  background: transparent;
  color: #282828;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: #282828;
  color: #ffffff;
}

.control-button.active {
  background: #282828;
  color: #ffffff;
}

@media (max-width: 768px) {
  .article-reading-demo {
    padding: 1rem;
  }

  .demo-container {
    padding: 1.5rem;
  }

  .article-text {
    font-size: 1.1rem;
    line-height: 1.8;
  }

  .word-card {
    min-width: 240px;
    max-width: 300px;
    padding: 1.25rem;
  }

  .word-title {
    font-size: 1.3rem;
  }

  .demo-controls {
    flex-direction: column;
  }

  .control-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .article-text {
    font-size: 1rem;
    line-height: 1.6;
  }

  .word-card {
    min-width: 200px;
    max-width: 260px;
    padding: 1rem;
  }

  .word-title {
    font-size: 1.2rem;
  }
}
</style>
