<template>
  <div class="leaderboard-page" :class="{ 'sidebar-open': showSidebar }">
    <!-- Sidebar -->
    <Sidebar :showSidebar="showSidebar" @toggle-sidebar="toggleSidebar" />

    <!-- Header -->
    <Header @toggle-sidebar="toggleSidebar" @toggle-notification="toggleNotification" :isNotificationActive="isNotificationActive" />

    <!-- Notification Panel -->
    <transition name="fade">
      <div v-if="showNotification && isNotificationActive" class="notification-panel">
        <div class="notification-content">
          <div class="notification-avatar"></div>
          <div class="notification-text">
            <span class="notification-country">風車國</span>
            <span class="notification-message">建造了火力發電廠</span>
          </div>
        </div>
        <button class="notification-close" @click="closeNotification">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9.00005 7.93955L12.7126 4.22705L13.7731 5.28755L10.0606 9.00005L13.7731 12.7126L12.7126 13.7731L9.00005 10.0606L5.28755 13.7731L4.22705 12.7126L7.93955 9.00005L4.22705 5.28755L5.28755 4.22705L9.00005 7.93955Z" fill="#666666"/>
          </svg>
        </button>
      </div>
    </transition>

    <!-- 返回按鈕 -->
    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" class="back-icon">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">返回</span>
      </div>
    </div>

    <!-- 標題資訊 -->
    <div class="page-info">
      <div class="title-row">
        <div class="trophy-icon">🏆</div>
        <h2 class="page-title">搶答排行榜</h2>
      </div>
      <p class="subtitle">查看各科目排行與總排行</p>
    </div>

    <!-- 科目標籤容器 -->
    <div class="subjects-container">
      <div class="subjects-scroll" ref="subjectsScroll">
        <div class="subjects-wrapper">
          <button
            v-for="subject in subjects"
            :key="subject.id"
            class="subject-tab"
            :class="{ active: currentSubject.id === subject.id }"
            @click="selectSubject(subject)"
          >
            {{ subject.name }}
          </button>
        </div>
      </div>

      <!-- 玩家排行榜列表 -->
      <div class="leaderboard-content">
        <div class="players-list">
          <div
            v-for="player in currentPlayers"
            :key="player.rank"
            class="player-card"
            :class="{ 'top-rank': player.rank <= 3 }"
          >
            <!-- 排名顯示 -->
            <div class="rank-badge">
              <span v-if="player.rank === 1" class="medal gold">🥇</span>
              <span v-else-if="player.rank === 2" class="medal silver">🥈</span>
              <span v-else-if="player.rank === 3" class="medal bronze">🥉</span>
              <span v-else class="rank-number">{{ player.rank }}</span>
            </div>

            <!-- 玩家資訊 -->
            <div class="player-info">
              <div class="player-name">{{ player.playerName }}</div>
              <div class="player-stats">
                <div class="stat-item">
                  <span class="stat-icon">✏️</span>
                  <span class="stat-label">答題數:</span>
                  <span class="stat-value">{{ player.questionsAnswered }} / {{ player.totalQuestions }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">⏱️</span>
                  <span class="stat-label">平均作答時間:</span>
                  <span class="stat-value">{{ player.avgTime }}秒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import { subjects, leaderboardData } from '../data/leaderboardData'

interface BuildingCard {
  id: number
  title: string
  description: string
  image: string
  effects: {
    type: string
    value: string
    icon: string
  }[]
}

const router = useRouter()
const subjectsScroll = ref(null)

// 導覽列相關變數
const isNotificationActive = ref(true)
const showNotification = ref(false)
const showSidebar = ref(false)
const sidebarSection = ref<string | null>(null)

const players = ref(['玩家一', '玩家二', '玩家三', '玩家四', '玩家五'])
const groupMembers = ref<any[]>([])
const clues = ref([
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。',
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。'
])

/*const buildingCards = ref<BuildingCard[]>([
  {
    id: 1,
    title: '火力發電廠',
    description: '透過建設火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2Fc4de6010b3be41548b416bd62c8334da?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 2,
    title: '堰塞湖',
    description: '處理堰塞湖，花費了大量經濟及人力。\n但因為妥善處理，於後續的大雨中並無造成人口傷亡，同時糧食也順利收成。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2Fd74f6bb3a084490baaf984f7e1cc2e2d?format=webp&width=800',
    effects: [
      { type: '經濟', value: '-3', icon: '#87FF7C' },
      { type: '人口', value: '-1', icon: '#7C7EFF' },
      { type: '糧食', value: '+2', icon: '#FFC47C' }
    ]
  },
  {
    id: 3,
    title: '金域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2Ff6d013861f294f4c90630637a06577e7?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 4,
    title: '光域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2Fd2932616865f401ebc49890ae648582f?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 5,
    title: '水域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2F78a89b8524fd40f3a369c1ea1122945a?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 6,
    title: '雷域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2F790594077862490d806b7169d2887e8b?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 7,
    title: '木域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2F96ae0937fafa460c9863aa786605a37c?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 8,
    title: '風域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2F2333e1220b3a4077a859f4cb9b5ec726?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  },
  {
    id: 9,
    title: '空域建設',
    description: '透過火力發電廠，國家電力提升、就業機會增加進而帶動經濟。\n但由於燃煤及燃氣發電廠釋放了大量溫室氣體，人民健康度下降，全球溫室效應加劇，全球人民健康度下降。',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2F36288cf9aad0457f901b18157254c94b?format=webp&width=800',
    effects: [
      { type: '經濟', value: '+2', icon: '#87FF7C' },
      { type: '健康', value: '-3', icon: '#FF7C7C' },
      { type: '電力', value: '+3', icon: '#FFEE7C' }
    ]
  }
])*/

let lastScrollPosition = 0

// 當前選中的科目
const currentSubject = ref(subjects[0])

// 真實總排行資料
const overallLeaderboard = ref<any[]>([])
const totalQuestions = ref(0)

// 科目 ID → 中文名稱對照（對應 question_table.subject）
const subjectIdToName: Record<string, string> = {
  physics: '物理',
  chemistry: '化學',
  biology: '生物',
  'earth-science': '地科',
  geography: '地理'
}

// 各科目真實排行資料快取
const subjectLeaderboards = ref<Record<string, any[]>>({})
const subjectTotalQuestions = ref<Record<string, number>>({})

async function loadSessionLeaderboard() {
  const sessionId = localStorage.getItem('session_id')
  if (!sessionId) return
  try {
    const resp = await fetch(`/api/session-leaderboard/?session_id=${sessionId}`)
    const data = await resp.json()
    if (data.ok) {
      totalQuestions.value = data.total_questions
      overallLeaderboard.value = data.leaderboard.map((p: any) => ({
        rank: p.rank,
        playerName: p.student_name,
        questionsAnswered: p.correct_count,
        totalQuestions: data.total_questions,
        avgTime: p.avg_time
      }))
    }
  } catch (err) {
    console.warn('載入排行榜失敗:', err)
  }
}

async function loadSubjectLeaderboard(subjectId: string) {
  const sessionId = localStorage.getItem('session_id')
  if (!sessionId) return
  const subjectName = subjectIdToName[subjectId]
  if (!subjectName) return
  try {
    const resp = await fetch(`/api/session-subject-leaderboard/?session_id=${sessionId}&subject=${encodeURIComponent(subjectName)}`)
    const data = await resp.json()
    if (data.ok) {
      subjectTotalQuestions.value[subjectId] = data.total_questions
      subjectLeaderboards.value[subjectId] = data.leaderboard.map((p: any) => ({
        rank: p.rank,
        playerName: p.student_name,
        questionsAnswered: p.correct_count,
        totalQuestions: data.total_questions,
        avgTime: p.avg_time
      }))
    }
  } catch (err) {
    console.warn(`載入 ${subjectName} 排行榜失敗:`, err)
  }
}

onMounted(() => {
  loadSessionLeaderboard()
})

// 當前顯示的玩家列表（只取前五名）
const currentPlayers = computed(() => {
  if (currentSubject.value.id === 'overall') {
    return overallLeaderboard.value.slice(0, 5)
  }
  return (subjectLeaderboards.value[currentSubject.value.id] || []).slice(0, 5)
})

// 選擇科目
const selectSubject = (subject: any) => {
  currentSubject.value = subject
  if (subject.id !== 'overall' && !subjectLeaderboards.value[subject.id]) {
    loadSubjectLeaderboard(subject.id)
  }
}

// 從 localStorage 讀取學生名字
const studentName = computed(() => {
  return localStorage.getItem('student_name') || '玩家'
})

// 導覽列相關函數
function toggleNotification() {
  isNotificationActive.value = !isNotificationActive.value
  if (isNotificationActive.value) {
    showNotification.value = true
  } else {
    showNotification.value = false
  }
}

function closeNotification() {
  showNotification.value = false
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
  if (!showSidebar.value) {
    sidebarSection.value = null
    document.body.style.overflow = 'auto'
    window.removeEventListener('scroll', handleSidebarScroll)
  } else {
    lastScrollPosition = window.scrollY
    document.body.style.overflow = 'hidden'
    window.addEventListener('scroll', handleSidebarScroll)
  }
}

function handleSidebarScroll() {
  if (showSidebar.value && window.scrollY !== lastScrollPosition) {
    showSidebar.value = false
    sidebarSection.value = null
    document.body.style.overflow = 'auto'
    window.removeEventListener('scroll', handleSidebarScroll)
  }
}

function toggleSection(section: string) {
  if (sidebarSection.value === section) {
    sidebarSection.value = null
  } else {
    sidebarSection.value = section
    // 如果切換到組員，加載同組成員
    if (section === 'group') {
      loadGroupMembers()
    }
  }
}

async function loadGroupMembers() {
  try {
    const groupId = localStorage.getItem('group_id')
    const studentId = localStorage.getItem('student_id')

    if (!groupId) {
      console.error('Group ID not found in localStorage')
      return
    }

    const response = await fetch(`/api/group-members/?group_id=${groupId}&student_id=${studentId}`)
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

// 返回首頁
const goBack = () => {
  router.push('/')
}

function handleLogout() {
  // 清除本地存儲的用戶數據
  localStorage.removeItem('student_id')
  localStorage.removeItem('student_name')
  localStorage.removeItem('group_id')
  localStorage.removeItem('account')
  
  // 重定向到登入頁面
  router.push('/login')
}
</script>

<style scoped>
/* 導覽列相關樣式 */
.header {
  border-bottom: 1px solid #C2C2C2;
  background: #FFF;
  padding: 33px 50px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: flex-end;
  gap: 50px;
}

.header-title {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 22px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 0.7;
}

.notification-panel {
  position: fixed;
  top: 100px;
  right: 50px;
  width: 350px;
  height: 56px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  gap: 10px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.notification-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: url('https://api.builder.io/api/v1/image/assets/TEMP/04fc62df1623912b4d9d4e67ee4161cfe407f580?width=72') no-repeat center center;
  background-size: cover;
  flex-shrink: 0;
}

.notification-text {
  display: flex;
  gap: 5px;
  padding-left: 6px;
}

.notification-country {
  color: #FF7C7C;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 22px;
}

.notification-message {
  color: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 22px;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

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
  padding: 30px 0 5px;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.sidebar-user {
  display: flex;
  padding: 0 50px;
  align-items: center;
  gap: 50px;
}

.sidebar-username {
  color: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 20px;
  line-height: 22px;
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

.sidebar-divider {
  width: 1px;
  height: 24px;
  background: #EEE;
  margin: 0 20px;
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
  background: none;
  color: #ff6b6b !important;
  font-weight: 700 !important;
  padding: 0 !important;
  margin: 0 !important;
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
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  line-height: 22px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.player-btn:hover {
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.85);
}

.clues-content {
  max-width: 500px;
}

.clues-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.clue-item {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 2px 0 4px 0 rgba(0, 0, 0, 0.25);
}

.clue-badge {
  padding: 4px 12px;
  border-radius: 12px;
  background: #10B981;
  color: white;
  font-size: 14px;
  font-weight: 600;
  height: fit-content;
  flex-shrink: 0;
}

.clue-text {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* 過場動畫 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-active {
  transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-sidebar-leave-active {
  transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-sidebar-enter-active .sidebar {
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-sidebar-leave-active .sidebar {
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-sidebar-enter-from {
  opacity: 0;
}

.slide-sidebar-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-from .sidebar,
.slide-sidebar-leave-to .sidebar {
  transform: translateX(-100%);
}

.slide-content-enter-active, .slide-content-leave-active {
  transition: all 0.3s ease;
}

.slide-content-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-content-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.leaderboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 頁面資訊 */
.page-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  color: white;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trophy-icon {
  font-size: 24px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.subtitle {
  font-size: 13px;
  opacity: 0.95;
  margin: 0;
  text-align: center;
}

/* 返回按鈕 */
.back-button-container {
  padding: 12px 20px 0 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: white;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
}

.back-icon {
  color: white;
}

.back-text {
  color: white;
  font-size: 14px;
}

/* 科目標籤容器 */
.subjects-container {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.subjects-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.subjects-scroll::-webkit-scrollbar {
  display: none;
}

.subjects-wrapper {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 25px;
  justify-content: space-evenly;
}

.subject-tab {
  flex-shrink: 0;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #4b5563;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.subject-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.subject-tab.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 排行榜內容 */
.leaderboard-content {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: none;
}

.leaderboard-content::-webkit-scrollbar {
  display: none;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 820px;
  margin: 0 auto;
}

/* 玩家卡片 */
.player-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.player-card.top-rank {
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  box-shadow: 0 4px 12px rgba(252, 211, 77, 0.3);
}

/* 排名徽章 */
.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 45px;
}

.medal {
  font-size: 32px;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  color: #6b7280;
}

/* 玩家資訊 */
.player-info {
  flex: 1;
}

.player-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.player-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.stat-icon {
  font-size: 14px;
}

.stat-label {
  color: #6b7280;
}

.stat-value {
  color: #1f2937;
  font-weight: 600;
}

.stat-item:last-child .stat-value {
  font-weight: normal;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-info {
    padding: 12px 15px;
  }

  .trophy-icon {
    font-size: 28px;
  }

  .page-title {
    font-size: 18px;
  }

  .subtitle {
    font-size: 12px;
  }

  .subjects-container {
    padding: 15px;
  }

  .player-card {
    padding: 12px 15px;
  }

  .player-stats {
    flex-direction: column;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .trophy-icon {
    font-size: 24px;
  }

  .page-title {
    font-size: 16px;
  }

  .subtitle {
    font-size: 11px;
  }

  .player-name {
    font-size: 14px;
  }

  .stat-item {
    font-size: 12px;
  }

  .subject-tab {
    padding: 8px 15px;
    font-size: 13px;
  }
}

/* 國家建設狀態相關樣式 */
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

.building-card {
  display: flex;
  width: min(100%, 280px);
  flex-direction: column;
  border-radius: 25px;
  flex-shrink: 0;
  background: #EEE;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 280 / 536;
}

.building-card-img {
  width: 100%;
  aspect-ratio: 280 / 301;
  object-fit: cover;
  border-radius: 25px 25px 0 0;
  flex-shrink: 0;
}

.building-card-content {
  display: flex;
  padding: clamp(10px, 4vw, 15px);
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 2vw, 15px);
  flex: 1;
  justify-content: space-between;
}

.building-card-text {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.building-card-title {
  color: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: clamp(13px, 3vw, 18px);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  flex-shrink: 0;
}

.building-card-desc {
  color: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: clamp(10px, 2.5vw, 13px);
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
  overflow-y: auto;
  flex: 1;
}

.building-card-effects {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(8px, 2vw, 15px);
  flex-shrink: 0;
  width: 100%;
  min-height: clamp(15px, 3vw, 20px);
}

.effect-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: auto;
}

.effect-icon {
  width: clamp(15px, 3vw, 20px);
  height: clamp(15px, 3vw, 20px);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.effect-icon svg {
  width: 100%;
  height: 100%;
}

.effect-value {
  color: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: clamp(10px, 2.5vw, 14px);
  line-height: 1.4;
}

.building-card-locked {
  filter: grayscale(100%);
  opacity: 0.8;
}

.building-card-locked .effect-value {
  display: none;
}
</style>
