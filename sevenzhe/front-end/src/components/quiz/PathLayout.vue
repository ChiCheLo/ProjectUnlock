<template>
  <div class="path-layout" :style="{ height: `${layoutHeight}px` }">
    <!-- SVG 連接線層 -->
    <svg class="path-svg" :viewBox="svgViewBox" preserveAspectRatio="none">
      <!-- 繪製帶有交匯點的連接路徑 -->
      <path
        v-for="(path, index) in connectionPaths"
        :key="`path-${index}`"
        :d="path"
        fill="none"
        stroke="#6B7280"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <!-- 題目卡片層 -->
    <div
      v-for="(question, index) in questions"
      :key="question.id"
      class="question-wrapper"
      :style="getPositionStyle(index)"
      @click="$emit('questionClick', question)"
    >
      <slot name="question" :question="question"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { questionPositions } from '../../data/questionPositions.js'

const props = defineProps({
  subjectId: {
    type: String,
    required: true
  },
  questions: {
    type: Array,
    required: true
  }
})

defineEmits(['questionClick'])

const positions = computed(() => questionPositions[props.subjectId] || [])

// 動態計算容器高度，根據最後一個題目的 y 位置
const layoutHeight = computed(() => {
  if (positions.value.length === 0) return 1650
  
  const maxY = Math.max(...positions.value.map(pos => pos.y))
  // 加上額外的 padding (200px) 確保底部題目完整顯示
  return maxY + 200
})

// SVG viewBox 高度也要動態調整
const svgViewBox = computed(() => {
  return `0 0 100 ${layoutHeight.value}`
})

// 生成帶有交匯點的連接路徑
const connectionPaths = computed(() => {
  const paths = []
  const posArray = positions.value

  // 遍歷每個題目的連接
  posArray.forEach((pos, index) => {
    if (!pos.connections || pos.connections.length === 0) return

    const startX = pos.x
    const startY = pos.y

    // 如果連接到多個目標（分叉）
    if (pos.connections.length === 2) {
      const target1 = posArray.find(p => p.id === pos.connections[0])
      const target2 = posArray.find(p => p.id === pos.connections[1])

      if (target1 && target2) {
        const junctionY = (startY + target1.y) / 2

        // 主幹：從起點到交匯點
        paths.push(`M ${startX},${startY} L ${startX},${junctionY}`)

        // 左分支：交匯點到左側目標
        paths.push(`M ${startX},${junctionY} L ${target1.x},${junctionY} L ${target1.x},${target1.y}`)

        // 右分支：交匯點到右側目標
        paths.push(`M ${startX},${junctionY} L ${target2.x},${junctionY} L ${target2.x},${target2.y}`)
      }
    }
    // 如果只連接一個目標，檢查是否需要合併
    else if (pos.connections.length === 1) {
      const target = posArray.find(p => p.id === pos.connections[0])
      if (!target) return

      // 檢查是否有其他題目也連接到同一個目標（合併）
      const siblings = posArray.filter(p =>
        p.id !== pos.id &&
        p.connections &&
        p.connections.includes(target.id)
      )

      if (siblings.length > 0) {
        // 有合併：畫到中間交匯點
        const junctionY = (startY + target.y) / 2

        // 從起點到交匯處（垂直+水平）
        paths.push(`M ${startX},${startY} L ${startX},${junctionY} L ${target.x},${junctionY}`)

        // 只有一個題目負責畫從交匯點到目標的線（避免重複）
        if (pos.id < siblings[0].id) {
          paths.push(`M ${target.x},${junctionY} L ${target.x},${target.y}`)
        }
      } else {
        // 無合併：直接連接
        if (startX === target.x) {
          // 垂直線（同一X座標）
          paths.push(`M ${startX},${startY} L ${startX},${target.y}`)
        } else {
          // 需要轉彎的連接
          paths.push(`M ${startX},${startY} L ${startX},${target.y} L ${target.x},${target.y}`)
        }
      }
    }
  })

  return paths
})

const getPositionStyle = (index) => {
  const pos = positions.value[index]
  if (!pos) return {}

  return {
    left: `${pos.x}%`,
    top: `${pos.y}px`,
    transform: 'translate(-50%, -50%)'
  }
}
</script>

<style scoped>
.path-layout {
  position: relative;
  width: 100%;
  min-height: 1200px; /* 最小高度 */
  /* height 由 inline style 動態設定 */
}

.path-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none; /* 讓 SVG 不阻擋點擊事件 */
}

.question-wrapper {
  position: absolute;
  z-index: 2;
}
</style>
