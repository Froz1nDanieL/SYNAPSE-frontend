<style scoped>
.know-level-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  min-width: 200px;
  margin: 0 auto;
}

.level-button {
  flex: 1;
  padding: 1rem 1rem;
  border: 2px solid #495057;
  border-radius: 8px;
  background: none;
  color: #495057;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.level-button:hover {
  border-color: #000066;
  color: #000066;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.level-button.active {
  border-color: #000066;
  color: white;
  font-weight: 600;
}

.level-button.active:hover {
  background-color: #000066dd;
}
</style>

<template>
  <div class="know-level-buttons">
    <button
      class="level-button"
      :class="{ active: modelValue === 1 }"
      @click="handleChange(1)"
    >
      认识
    </button>
    <button
      class="level-button"
      :class="{ active: modelValue === 0 }"
      @click="handleChange(0)"
    >
      不认识
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: undefined, // 没有默认值，由父组件控制
  },
});

const emit = defineEmits(["update:modelValue", "next"]);

function handleChange(value) {
  emit("update:modelValue", value);
  // 添加短暂延迟，让用户看到按钮状态变化
  setTimeout(() => {
    emit("next");
  }, 200);
}
</script>
