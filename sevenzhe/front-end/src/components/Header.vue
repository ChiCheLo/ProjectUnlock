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

      <div class="header-right">
        <!-- 組別金幣顯示 -->
        <div class="header-coin" title="組別金幣（點擊刷新）" @click="loadMyGroupCoin">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FFD54A" stroke="#C8960C" stroke-width="1" />
            <text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="800" fill="#8A5C00">$</text>
          </svg>
          <span class="coin-text">{{ coinDisplay }}</span>
        </div>

        <!-- 通知鈴鐺 -->
        <button class="notif-btn" :title="notifEnabled ? '通知已開啟（點擊關閉）' : '通知已關閉（點擊開啟）'" @click="toggleNotif">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1046 22 14 21.1046 14 20H10C10 21.1046 10.8954 22 12 22Z" :fill="notifEnabled ? '#ff0000' : '#333333'" />
            <path d="M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" :fill="notifEnabled ? '#ff0000' : '#333333'" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 通知列表（固定在 header 下方右側） -->
    <transition-group name="notif-slide" tag="div" class="notif-list">
      <div
        v-for="n in visibleNotifications"
        :key="n.id"
        class="notif-item"
      >
        <span class="notif-text"><span class="notif-name">{{ n.student_name }}</span> {{ n.policy_title }}</span>
        <button class="notif-close" @click="dismissNotif(n.id)">✕</button>
      </div>
    </transition-group>
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

// ── 政策通知 ───────────────────────────────────────────────
interface PolicyNotif {
  id: string
  student_name: string
  policy_title: string
  ts: number
}

const notifEnabled = ref(true)
const visibleNotifications = ref<PolicyNotif[]>([])
let notifSince = ref(Date.now() / 1000)  // 只拿比此時間新的
let notifTimer: ReturnType<typeof setInterval> | null = null
const notifTimers: Record<string, ReturnType<typeof setTimeout>> = {}

function toggleNotif() {
  notifEnabled.value = !notifEnabled.value
  if (!notifEnabled.value) {
    // 關閉通知：清除全部顯示中的通知
    visibleNotifications.value = []
    Object.values(notifTimers).forEach(t => clearTimeout(t))
  }
}

function dismissNotif(id: string) {
  visibleNotifications.value = visibleNotifications.value.filter(n => n.id !== id)
  if (notifTimers[id]) { clearTimeout(notifTimers[id]); delete notifTimers[id] }
}

async function pollPolicyNotifications() {
  if (!notifEnabled.value) return
  try {
    const res = await fetch(`/api/policy-notifications/?since=${notifSince.value}`)
    const json = await res.json()
    if (json.ok && json.data?.length) {
      for (const n of json.data) {
        visibleNotifications.value.push(n)
        // 3 秒後自動消失
        notifTimers[n.id] = setTimeout(() => dismissNotif(n.id), 3000)
        if (n.ts > notifSince.value) notifSince.value = n.ts
      }
    }
  } catch { /* ignore */ }
}
// ──────────────────────────────────────────────────────────

onMounted(() => {
  notifSince.value = Date.now() / 1000
  loadMyGroupCoin()
  coinTimer = setInterval(loadMyGroupCoin, 5000)
  notifTimer = setInterval(pollPolicyNotifications, 3000)
})

onBeforeUnmount(() => {
  if (coinTimer) clearInterval(coinTimer)
  if (notifTimer) clearInterval(notifTimer)
  Object.values(notifTimers).forEach(t => clearTimeout(t))
})

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
.header-right { display:flex; align-items:center; gap:14px }

/* ── 金幣 ── */
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

/* ── 鈴鐺按鈕 ── */
.notif-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

/* ── 通知列表 ── */
.notif-list {
  position: absolute;
  top: 68px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 200;
  pointer-events: none;
}
.notif-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #ff0000;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  min-width: 220px;
  max-width: 320px;
  pointer-events: all;
}
.notif-name {
  color: #ff0000;
  font-weight: 700;
}
.notif-text {
  font-size: 14px;
  color: #333;
  flex: 1;
}
.notif-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #999;
  padding: 0 2px;
  line-height: 1;
}
.notif-close:hover { color: #333 }

/* ── 通知滑入動畫 ── */
.notif-slide-enter-active { transition: all 0.25s ease; }
.notif-slide-leave-active { transition: all 0.2s ease; }
.notif-slide-enter-from { opacity: 0; transform: translateX(30px); }
.notif-slide-leave-to   { opacity: 0; transform: translateX(30px); }

.header-title {
  font-size:18px;
  color:#333;
  cursor: pointer;
  transition: color 0.2s ease;
}
.header-title:hover { color: #1890ff; }
.icon-btn { background:none; border:none; cursor:pointer; padding:0 }
</style>
