<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button class="icon-btn" aria-label="Menu" @click="$emit('toggle-sidebar')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="black" />
          </svg>
        </button>
        <h1 class="header-title" @click="goToHome">破解安洛克</h1>
      </div>

      <!-- Header 最右邊的組別金幣顯示，點擊可立即刷新 -->
      <div class="header-coin" title="組別金幣（點擊刷新）" @click="loadMyGroupCoin">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FFD54A" stroke="#C8960C" stroke-width="1" />
          <text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="800" fill="#8A5C00">$</text>
        </svg>
        <span class="coin-text">{{ coinDisplay }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()

// ── 組別金幣 ──────────────────────────────────────────────
const coinAmount = ref<number | null>(null)
let coinTimer: ReturnType<typeof setInterval> | null = null

const coinDisplay = computed(() =>
  coinAmount.value == null ? '—' : String(coinAmount.value)
)

async function loadMyGroupCoin() {
  try {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) { coinAmount.value = null; return }
    const res = await fetch(`/api/my-group-coin/?student_id=${encodeURIComponent(studentId)}`)
    const json = await res.json()
    coinAmount.value = json.ok && json.data ? (json.data.coin_amount ?? null) : null
  } catch (e) {
    coinAmount.value = null
  }
}

onMounted(() => {
  loadMyGroupCoin()
  coinTimer = setInterval(loadMyGroupCoin, 10000)
})

onBeforeUnmount(() => {
  if (coinTimer) clearInterval(coinTimer)
})
// ──────────────────────────────────────────────────────────

function goToHome() {
  router.push('/')
}
</script>

<style scoped>
.header {
  border-bottom: 1px solid #c2c2c2;
  background: #fff;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left { display:flex; align-items:center; gap:16px }

/* ── 最右邊的金幣 ── */
.header-coin {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.coin-text {
  font-weight: 700;
  font-size: 16px;
  color: #8A5C00;
  min-width: 24px;
}

.header-title {
  font-size:18px;
  color:#333;
  cursor: pointer;
  transition: color 0.2s ease;
}
.header-title:hover {
  color: #1890ff;
}
.icon-btn { background:none; border:none; cursor:pointer; padding:0 }
</style>
