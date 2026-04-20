<template>
  <div class="question-card" :class="{ expanded: question.expanded }">
    <div class="stars">
      <span
        v-for="i in 3"
        :key="i"
        class="star"
        :class="{ active: i <= question.level }"
      >
        {{ i <= question.level ? '★' : '☆' }}
      </span>
    </div>
    <div class="question-text">{{ question.content }}</div>
    <div v-if="question.expanded" class="question-detail">
      <div class="detail-content">
        這裡是題目的詳細說明和答案內容...
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  question: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.question-card {
  width: 200px;
  min-height: 120px;
  background: linear-gradient(to right top, #058CA1, #3640FA);
  color: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.question-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.question-card.expanded {
  min-height: 180px;
}

.stars {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.star {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.3s;
}

.star.active {
  color: #FFD700;
}

.question-text {
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
  flex: 1;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.question-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
}

.detail-content {
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
}
</style>
