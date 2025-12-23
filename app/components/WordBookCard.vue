<template>
  <div :class="['word-book-card', positionClass]" @click="handleClick">
    <div class="book-info">
      <h3 class="book-title">{{ book.name }}</h3>
      <p class="book-description">{{ book.description }}</p>
      <div class="book-stats">
        <span class="word-count">{{ book.totalWordCount }}词</span>
        <span class="study-count">{{ book.learnedWordCount || 0 }}人学习</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 接收词书数据作为props
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
});

// 定义点击事件
const emit = defineEmits(["select"]);

const handleClick = () => {
  emit("select", props.book);
};

// 计算位置类名
const positionClass = `position-${props.position}`;
</script>

<style scoped>
.word-book-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
}

.book-info {
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Book card colors - 统一颜色方案 */
.position-1,
.position-2,
.position-3,
.position-4,
.position-6,
.position-7,
.position-8,
.position-9 {
  background-color: #fff3e0; /* Light orange - 统一颜色 */
}

/* 标题卡片保持不同颜色 */
.position-5 {
  background-color: transparent; /* 透明背景，与标题卡片样式一致 */
}

.book-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #000033;
  margin: 0.5rem 0 0.3rem;
  line-height: 1.1;
}

.book-description {
  color: #666;
  margin: 0.3rem 0;
  font-size: 0.7rem;
  line-height: 1.3;
  max-height: 2.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-stats {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.65rem;
  color: #000076;
  font-weight: 500;
  margin-top: 0.5rem;
}

.word-count::after {
  content: "|";
  color: #ccc;
  margin: 0 0.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .word-book-card {
    width: calc(50% - 0.5rem);
    height: calc(50% - 0.5rem);
    max-width: 150px;
    max-height: 150px;
  }

  .book-title {
    font-size: 1.2rem;
  }

  .book-description {
    font-size: 0.6rem;
    max-height: 2rem;
  }

  .book-stats {
    font-size: 0.55rem;
  }
}
</style>
