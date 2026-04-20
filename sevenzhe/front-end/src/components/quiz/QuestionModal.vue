<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  resultState: {
    type: String,
    default: 'idle' // 'idle', 'correct', 'wrong'
  }
})

const emit = defineEmits(['close', 'submit'])

const answer = ref('')

const handleSubmit = () => {
  if (answer.value.trim()) {
    emit('submit', answer.value.trim())
  }
}

const handleClose = () => {
  emit('close')
  answer.value = ''
}

// 當模態框關閉時重置答案
watch(() => props.show, (newVal) => {
  if (!newVal) {
    answer.value = ''
  }
})
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">搶答題目</h2>
          <button class="close-button" @click="handleClose">✕</button>
        </div>

        <div class="question-display">
          {{ question.content }}
        </div>

        <!-- 結果顯示區域 -->
        <div v-if="resultState === 'correct'" class="result-box result-correct">
          <div class="result-title">✓ 答對了！</div>
          <div class="result-explanation">解答：{{ question.explanation }}</div>
        </div>

        <div v-else-if="resultState === 'wrong'" class="result-box result-wrong">
          <div class="result-title">✕ 答錯了！</div>
        </div>

        <!-- 輸入區域（只在未答題時顯示） -->
        <div v-if="resultState === 'idle'" class="answer-section">
          <label class="answer-label">請輸入答案：</label>
          <input
            v-model="answer"
            type="text"
            class="answer-input"
            placeholder="輸入你的答案"
            @keyup.enter="handleSubmit"
          />
        </div>

        <button v-if="resultState === 'idle'" class="submit-button" @click="handleSubmit">
          提交答案
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.question-display {
  background: linear-gradient(135deg, #E0E7FF 0%, #DDD6FE 100%);
  padding: 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #4C1D95;
  text-align: center;
  margin-bottom: 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-section {
  margin-bottom: 20px;
}

.answer-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.answer-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.answer-input:focus {
  outline: none;
  border-color: #10B981;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background-color: #1F2937;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #111827;
}

.submit-button:active {
  transform: scale(0.98);
}

/* 結果顯示框 */
.result-box {
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.result-correct {
  background-color: #D1FAE5;
  border: 1px solid #10B981;
}

.result-wrong {
  background-color: #FEE2E2;
  border: 1px solid #EF4444;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.result-correct .result-title {
  color: #059669;
}

.result-wrong .result-title {
  color: #DC2626;
}

.result-explanation {
  font-size: 14px;
  color: #065F46;
  line-height: 1.6;
}

/* 模態框過場動畫 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
