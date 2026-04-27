<template>
  <!-- ── 浮動可拖曳按鈕 ───────────────────────────── -->
  <Teleport to="body">
    <div
      class="ct-float-btn"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
      @mousedown="onMouseDown"
      @click="onBtnClick"
    >
      🔀 線索交易
    </div>

    <!-- ── 交易申請 Modal ─────────────────────────── -->
    <div v-if="showModal" class="ct-backdrop" @click.self="closeModal">
      <div class="ct-modal">
        <button class="ct-close" @click="closeModal">✕</button>
        <h3 class="ct-title">線索交易</h3>

        <!-- Step 1：選擇對象 -->
        <label class="ct-label">選擇交易對象</label>
        <select v-model="selectedPlayerId" class="ct-select" @change="onPlayerChange">
          <option value="">-- 請選擇玩家 --</option>
          <option
            v-for="m in groupMembers"
            :key="m.student_id"
            :value="String(m.student_id)"
          >
            {{ m.student_name }}（ID: {{ m.student_id }}）
          </option>
        </select>

        <!-- 預覽：對象的線索 -->
        <div v-if="selectedPlayerId" class="ct-clue-section">
          <p class="ct-label">選擇想要的線索</p>
          <div v-if="loadingClues" class="ct-hint">載入中…</div>
          <div v-else-if="targetClues.length === 0" class="ct-hint">該玩家目前沒有線索</div>
          <div v-else class="ct-clue-grid">
            <img
              v-for="clue in targetClues"
              :key="clue.clue_id"
              :src="clue.clue_url"
              :class="['ct-clue-thumb', { 'ct-selected': selectedClue?.clue_id === clue.clue_id }]"
              @click="selectClue(clue)"
              @error="(e: any) => (e.target.style.display='none')"
            />
          </div>
        </div>

        <!-- Step 2：選擇金幣 -->
        <template v-if="selectedClue">
          <label class="ct-label">願意支付的金幣數量（組別現有：{{ maxCoin }}）</label>
          <select v-model="offerCoin" class="ct-select">
            <option v-for="n in coinOptions" :key="n" :value="n">{{ n }} 枚</option>
          </select>

          <div class="ct-preview-row">
            <img :src="selectedClue.clue_url" class="ct-preview-img" />
            <span class="ct-arrow">➜</span>
            <span class="ct-coin-tag">🪙 {{ offerCoin }}</span>
          </div>

          <button
            class="ct-submit-btn"
            :disabled="submitting"
            @click="submitTrade"
          >
            {{ submitting ? '申請中…' : '申請交易' }}
          </button>
        </template>
      </div>
    </div>

    <!-- ── 收到交易申請 Overlay ───────────────────── -->
    <div v-if="incomingTrade" class="ct-incoming-overlay">
      <div class="ct-incoming-modal">
        <h3 class="ct-incoming-title">📩 收到線索交易申請</h3>
        <p class="ct-incoming-desc">
          玩家 <strong>{{ incomingTrade.from_student_name }}</strong> 想要你的線索，<br />
          提供 <strong>{{ incomingTrade.coin_amount }}</strong> 枚金幣
        </p>
        <img
          :src="incomingTrade.clue_url"
          class="ct-incoming-img"
          @error="(e: any) => (e.target.style.display='none')"
        />
        <div class="ct-incoming-actions">
          <button class="ct-accept-btn" @click="respondTrade('accept')">✅ 接受</button>
          <button class="ct-reject-btn" @click="respondTrade('reject')">❌ 拒絕</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { sendLog } from '../api/webLog'

const emit = defineEmits<{ (e: 'trade-completed'): void }>()

// ── 浮動按鈕拖曳 ─────────────────────────────────────────
const pos = ref({ x: window.innerWidth - 150, y: 200 })
let dragStartX = 0
let dragStartY = 0
let hasDragged = false

function onMouseDown(e: MouseEvent) {
  dragStartX = e.clientX
  dragStartY = e.clientY
  hasDragged = false
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    hasDragged = true
    pos.value = {
      x: Math.max(0, Math.min(window.innerWidth - 120, e.clientX - 60)),
      y: Math.max(0, Math.min(window.innerHeight - 40, e.clientY - 16)),
    }
  }
}

function onMouseUp() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function onBtnClick() {
  if (!hasDragged) openModal()
}

// ── 交易 Modal ────────────────────────────────────────────
const showModal     = ref(false)
const groupMembers  = ref<any[]>([])
const selectedPlayerId = ref('')
const targetClues   = ref<any[]>([])
const loadingClues  = ref(false)
const selectedClue  = ref<any>(null)
const offerCoin     = ref(0)
const maxCoin       = ref(0)
const submitting    = ref(false)

const coinOptions = computed(() => {
  const arr: number[] = []
  for (let i = 0; i <= maxCoin.value; i++) arr.push(i)
  return arr
})

async function openModal() {
  showModal.value = true
  selectedPlayerId.value = ''
  targetClues.value = []
  selectedClue.value = null
  offerCoin.value = 0
  await Promise.all([loadSessionMembers(), loadMaxCoin()])
}

function closeModal() {
  showModal.value = false
}

async function loadSessionMembers() {
  try {
    const studentId = localStorage.getItem('student_id')
    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) return
    const params = new URLSearchParams({ session_id: sessionId })
    if (studentId) params.append('student_id', studentId)
    const res  = await fetch(`/api/session-members/?${params}`)
    const data = await res.json()
    if (data.ok) groupMembers.value = data.data
  } catch { /* silent */ }
}

async function loadMaxCoin() {
  try {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) return
    const res  = await fetch(`/api/my-group-coin/?student_id=${encodeURIComponent(studentId)}`)
    const data = await res.json()
    maxCoin.value = (data.ok && data.data?.coin_amount != null) ? Number(data.data.coin_amount) : 0
  } catch { /* silent */ }
}

async function onPlayerChange() {
  selectedClue.value = null
  targetClues.value  = []
  if (!selectedPlayerId.value) return
  loadingClues.value = true
  try {
    const res  = await fetch(`/api/student-clues/?student_id=${encodeURIComponent(selectedPlayerId.value)}`)
    const data = await res.json()
    if (data.ok) targetClues.value = data.data.filter((c: any) => c.clue_url)
  } catch { /* silent */ }
  loadingClues.value = false
}

function selectClue(clue: any) {
  selectedClue.value = clue
}

async function submitTrade() {
  if (!selectedClue.value || !selectedPlayerId.value) return
  submitting.value = true
  try {
    const fromStudentId = localStorage.getItem('student_id')
    const res = await fetch('/api/trade-request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_student_id: fromStudentId,
        to_student_id:   selectedPlayerId.value,
        clue_id:         selectedClue.value.clue_id,
        clue_url:        selectedClue.value.clue_url,
        coin_amount:     offerCoin.value,
      }),
    })
    const data = await res.json()
    if (data.ok) {
      sendLog(`提出線索交易申請：對象玩家ID=${selectedPlayerId.value}，線索ID=${selectedClue.value.clue_id}，提供金幣=${offerCoin.value}`)
      alert('✅ 交易申請已送出！等待對方回應。')
      closeModal()
    } else {
      alert('申請失敗：' + data.error)
    }
  } catch {
    alert('申請失敗，請確認網路連線')
  }
  submitting.value = false
}

// ── 收到交易申請（輪詢）────────────────────────────────────

interface Trade {
  id: string
  from_student_id: string
  from_student_name: string
  to_student_id: string
  clue_id: number
  clue_url: string
  coin_amount: number
  status: string
}

const incomingTrade = ref<Trade | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null

async function sendHeartbeat() {
  try {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) return
    await fetch('/api/heartbeat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    })
  } catch { /* silent */ }
}

async function pollIncomingTrades() {
  try {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) return
    if (incomingTrade.value) return // 已有一筆待處理，不覆蓋
    const res  = await fetch(`/api/pending-trades/?student_id=${encodeURIComponent(studentId)}`)
    const data = await res.json()
    if (data.ok && Array.isArray(data.data) && data.data.length > 0) {
      incomingTrade.value = data.data[0] as Trade
    }
  } catch { /* silent */ }
}

async function respondTrade(action: 'accept' | 'reject') {
  if (!incomingTrade.value) return
  try {
    const studentId = localStorage.getItem('student_id')
    const res = await fetch('/api/trade-respond/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trade_id:   incomingTrade.value.id,
        action,
        student_id: studentId,
      }),
    })
    const data = await res.json()
    if (!data.ok) alert('操作失敗：' + data.error)
    else if (action === 'accept') {
      sendLog(`接受線索交易：來自玩家ID=${incomingTrade.value.from_student_id}，線索ID=${incomingTrade.value.clue_id}，獲得金幣=${incomingTrade.value.coin_amount}`)
      alert('✅ 交易完成！金幣已入帳。')
      emit('trade-completed')
      window.dispatchEvent(new CustomEvent('clue-trade-completed'))
    } else if (action === 'reject') {
      sendLog(`拒絕線索交易：來自玩家ID=${incomingTrade.value.from_student_id}，線索ID=${incomingTrade.value.clue_id}`)
    }
  } catch {
    alert('操作失敗，請確認網路連線')
  }
  incomingTrade.value = null
}

onMounted(() => {
  sendHeartbeat()
  heartbeatTimer = setInterval(sendHeartbeat, 15000)
  pollTimer = setInterval(pollIncomingTrades, 3000)
})

onBeforeUnmount(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  if (pollTimer) clearInterval(pollTimer)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<style scoped>
/* ── 浮動按鈕 ─────────────────────────────────── */
.ct-float-btn {
  position: fixed;
  z-index: 500;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: grab;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
  user-select: none;
  white-space: nowrap;
  transition: background 0.15s;
}
.ct-float-btn:active { cursor: grabbing; }
.ct-float-btn:hover  { background: #4338ca; }

/* ── 背景遮罩 ─────────────────────────────────── */
.ct-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── 交易 Modal ────────────────────────────────── */
.ct-modal {
  background: #fff;
  border-radius: 12px;
  padding: 28px 24px 24px;
  width: 440px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.ct-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}
.ct-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #1e1e2e;
}
.ct-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin: 12px 0 4px;
}
.ct-select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
}

/* ── 線索格 ───────────────────────────────────── */
.ct-clue-section { margin-top: 12px; }
.ct-hint { font-size: 13px; color: #888; padding: 6px 0; }
.ct-clue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 6px;
}
.ct-clue-thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.ct-clue-thumb:hover   { transform: scale(1.05); }
.ct-clue-thumb.ct-selected {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.25);
}

/* ── 預覽列 & 送出 ───────────────────────────── */
.ct-preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0 10px;
}
.ct-preview-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.ct-arrow  { font-size: 20px; color: #888; }
.ct-coin-tag {
  font-size: 18px;
  font-weight: 700;
  color: #b45309;
}
.ct-submit-btn {
  width: 100%;
  padding: 10px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.ct-submit-btn:hover:not(:disabled) { background: #4338ca; }
.ct-submit-btn:disabled { background: #a5b4fc; cursor: not-allowed; }

/* ── 收到交易申請 Overlay ────────────────────── */
.ct-incoming-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-incoming-modal {
  background: #fff;
  border-radius: 14px;
  padding: 32px 28px 24px;
  width: 360px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
}
.ct-incoming-title {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1e1e2e;
}
.ct-incoming-desc {
  font-size: 15px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 16px;
}
.ct-incoming-img {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #ddd;
  display: block;
  margin: 0 auto 20px;
}
.ct-incoming-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.ct-accept-btn,
.ct-reject-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.ct-accept-btn { background: #22c55e; color: #fff; }
.ct-reject-btn { background: #ef4444; color: #fff; }
.ct-accept-btn:hover, .ct-reject-btn:hover { opacity: 0.85; }
</style>
