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

.level-button:hover:not(:disabled) {
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

.level-button.active:hover:not(:disabled) {
  background-color: #000066dd;
}

.level-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>

<template>
  <div class="know-level-buttons">
    <button
      class="level-button"
      :class="{ active: modelValue === 1 }"
      :disabled="isProcessing"
      @click="handleChange(1)"
    >
      认识
    </button>
    <button
      class="level-button"
      :class="{ active: modelValue === 0 }"
      :disabled="isProcessing"
      @click="handleChange(0)"
    >
      不认识
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue", "next"]);

const isProcessing = ref(false);
const CLICK_INTERVAL = 800;

function handleChange(value) {
  if (isProcessing.value) {
    return;
  }

  isProcessing.value = true;
  emit("update:modelValue", value);

  setTimeout(() => {
    emit("next");
  }, 200);

  setTimeout(() => {
    isProcessing.value = false;
  }, CLICK_INTERVAL);
}
</script>
