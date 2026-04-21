<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  showSidebar: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const router = useRouter()

// ─── 狀態 ────────────────────────────────────────────────
const sidebarSection = ref<string | null>(null)
const groupMembers = ref<any[]>([])
const clues = ref<any[]>([])
const buildingCards = ref<any[]>([])

// 從 localStorage 讀取玩家名稱
const studentName = ref(localStorage.getItem('student_name') || '玩家')

// ─── sidebar 開關 ────────────────────────────────────────
function close() {
  sidebarSection.value = null
  emit('toggle-sidebar')
}

// 當 sidebar 關閉時重置子區塊
watch(() => props.showSidebar, (val) => {
  if (!val) sidebarSection.value = null
})

// ─── 子區塊切換 ──────────────────────────────────────────
function toggleSection(section: string) {
  if (sidebarSection.value === section) {
    sidebarSection.value = null
  } else {
    sidebarSection.value = section
    if (section === 'group') loadGroupMembers()
    if (section === 'clues') loadStudentClues()
    if (section === 'construction') fetchGroupPolicies()
  }
}

// ─── 組員 API ────────────────────────────────────────────
async function loadGroupMembers() {
  try {
    const groupId = localStorage.getItem('group_id')
    const studentId = localStorage.getItem('student_id')
    const sessionId = localStorage.getItem('session_id')
    if (!groupId) return

    const response = await fetch(`/api/group-members/?group_id=${groupId}&student_id=${studentId}&session_id=${sessionId}`)
    const data = await response.json()
    if (data.ok) {
      groupMembers.value = data.data
    } else {
      console.error('Failed to load group members:', data.error)
    }
  } catch (error) {
    console.error('Error loading group members:', error)
  }
}

// ─── 線索 API ────────────────────────────────────────────
async function loadStudentClues() {
  try {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) return

    const response = await fetch(`/api/student-clues/?student_id=${studentId}`)
    const data = await response.json()

    if (data.ok) {
      clues.value = (data.data || []).map((clue: any) => {
        let clueUrl = clue.clue_url || ''
        if (clueUrl.includes('assets/clues/')) {
          clueUrl = clueUrl.replace('assets/clues/', '/clues/')
        } else if (clueUrl.startsWith('assets/')) {
          clueUrl = clueUrl.replace('assets/', '/clues/')
        }
        return { ...clue, clue_url: clueUrl }
      })
    } else {
      console.error('Failed to load student clues:', data.error)
      clues.value = []
    }
  } catch (error) {
    console.error('Error loading student clues:', error)
    clues.value = []
  }
}

// ─── 政策卡片 API ────────────────────────────────────────
async function fetchGroupPolicies() {
  const groupId = localStorage.getItem('group_id')
  const sessionId = localStorage.getItem('session_id')
  if (!groupId) return

  try {
    const response = await fetch(`/api/group-policies/?group_id=${groupId}&session_id=${sessionId}`)
    const data = await response.json()

    if (data.ok && data.policies) {
      buildingCards.value = data.policies.map((policy: any) => ({
        id: policy.policy_id,
        title: policy.policy_title,
        image: policy.image
      }))
    }
  } catch (error) {
    console.error('Failed to fetch group policies:', error)
  }
}

// ─── 登出 ────────────────────────────────────────────────
function handleLogout() {
  localStorage.removeItem('student_id')
  localStorage.removeItem('student_name')
  localStorage.removeItem('group_id')
  localStorage.removeItem('account')
  router.push('/login')
}
</script>

<template>
  <teleport to="body">
  <transition name="slide-sidebar">
    <div v-if="showSidebar" class="sidebar-overlay" @click="close">
      <div class="sidebar" @click.stop>
        <div class="sidebar-header">
          <button class="sidebar-close-btn" aria-label="Close menu" @click="close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="#333333"/>
            </svg>
          </button>
          <span class="sidebar-player-name">{{ studentName }}</span>
        </div>

        <div class="sidebar-menu">
          <div class="menu-item-wrapper">
            <button class="menu-item" @click="toggleSection('group')">組員</button>
            <svg v-if="sidebarSection === 'group'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
              <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE"/>
            </svg>
          </div>
          <div class="menu-divider"></div>

          <div class="menu-item-wrapper">
            <button class="menu-item" @click="toggleSection('clues')">個人擁有線索</button>
            <svg v-if="sidebarSection === 'clues'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
              <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE"/>
            </svg>
          </div>
          <div class="menu-divider"></div>

          <div class="menu-item-wrapper">
            <button class="menu-item" @click="toggleSection('construction')">國家建設狀態</button>
            <svg v-if="sidebarSection === 'construction'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
              <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE"/>
            </svg>
          </div>
          <div class="menu-divider"></div>

          <button class="menu-item logout-btn" @click="handleLogout">登出</button>
        </div>
      </div>

      <!-- 組員區塊 -->
      <transition name="slide-content">
        <div v-if="sidebarSection === 'group'" class="section-content">
          <div class="player-list">
            <button
              v-for="member in groupMembers"
              :key="member.student_id"
              class="player-btn"
            >
              {{ member.student_name }}
            </button>
          </div>
        </div>
      </transition>

      <!-- 個人線索區塊 -->
      <transition name="slide-content">
        <div v-if="sidebarSection === 'clues'" class="section-content clues-content">
          <div class="clues-list">
            <div
              v-for="(clue, index) in clues"
              :key="index"
              class="clue-item"
            >
              <div class="clue-image">
                <img :src="clue.clue_url" :alt="`線索 ${index + 1}`" />
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 國家建設狀態區塊 -->
      <transition name="slide-content">
        <div v-if="sidebarSection === 'construction'" class="section-content construction-content">
          <div class="building-cards-wrapper">
            <div class="building-cards">
              <img
                v-for="card in buildingCards"
                :key="card.id"
                :src="card.image"
                :alt="card.title"
                class="building-card-img"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
  </teleport>
</template>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
}

.sidebar {
  width: 236px;
  height: 100vh;
  background: #FFF;
  box-shadow: 2px 0 4px 0 rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: visible;
}

.sidebar-header {
  padding: 30px 20px 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.sidebar-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.sidebar-close-btn:hover {
  opacity: 0.7;
}

.sidebar-player-name {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
  flex: 1;
  text-align: center;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 50px;
}

.menu-item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.menu-item {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  line-height: 22px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.menu-item:hover {
  opacity: 0.7;
}

.menu-arrow {
  position: absolute;
  right: -35px;
  flex-shrink: 0;
}

.menu-divider {
  width: calc(100% + 100px);
  height: 1px;
  background: #DDD;
  margin: 0 -50px;
}

.logout-btn {
  color: #ff6b6b !important;
  font-weight: 700 !important;
}

.section-content {
  position: fixed;
  left: 236px;
  top: 100px;
  padding: 20px;
  background: transparent;
  height: auto;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 150;
}

.player-list {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.player-btn {
  padding: 10px 50px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 2px 0 4px 0 rgba(0, 0, 0, 0.25);
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  line-height: 22px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.player-btn:hover {
  background: rgba(255, 255, 255, 0.9);
}

.clues-content {
  width: auto;
  max-width: calc(100vw - 280px);
}

.clues-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 10px;
  padding-bottom: 20px;
}

.clue-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 15px;
  border: 2px solid #FEAD00;
  background: #FFF4D8;
  min-height: 150px;
  padding: 10px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.clue-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clue-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.construction-content {
  position: fixed;
  left: 236px;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 0;
  background: transparent;
  z-index: 150;
  overflow: hidden;
}

.building-cards-wrapper {
  width: 100%;
  height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 50px 0 50px 50px;
}

.building-cards {
  display: flex;
  align-items: center;
  gap: clamp(20px, 5vw, 40px);
  height: 100%;
  padding-right: clamp(20px, 5vw, 50px);
}

.building-card-img {
  width: auto;
  max-width: 280px;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

/* 動畫 */
.slide-sidebar-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-sidebar-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-sidebar-enter-active .sidebar {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-sidebar-leave-active .sidebar {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  opacity: 0;
}
.slide-sidebar-enter-from .sidebar,
.slide-sidebar-leave-to .sidebar {
  transform: translateX(-100%);
}

.slide-content-enter-active {
  transition: opacity 0.3s ease-in-out;
}
.slide-content-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.slide-content-enter-from,
.slide-content-leave-to {
  opacity: 0;
}
</style>
