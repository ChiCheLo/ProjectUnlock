<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'

interface StatIndicator {
  label: string
  value: number
  color: string
}

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

const stats = ref<StatIndicator[]>([
  { label: '經濟', value: 0, color: '#87FF7C' },
  { label: '人口', value: 0, color: '#7C7EFF' },
  { label: '健康', value: 0, color: '#FF7C7C' },
  { label: '糧食', value: 0, color: '#FFC47C' },
  { label: '電力', value: 0, color: '#FFEE7C' }
])

// circle constants for SVG progress
const circleR = 16
const circleCircumference = 2 * Math.PI * circleR

async function loadGroupValues() {
  try {
    const groupId = localStorage.getItem('group_id')
    if (!groupId) return

    const resp = await fetch(`/api/group-values/?group_id=${groupId}`)
    const json = await resp.json()
    if (!json.ok) {
      console.error('Failed to load group values', json.error)
      return
    }

    const d = json.data
    // 轉換並填入 stats（對應順序: 經濟, 人口, 健康, 糧食, 電力）
    const map: Record<string, number> = {
      economy: Number(d.economy) || 0,
      polulation: Number(d.polulation) || 0,
      healthy: Number(d.healthy) || 0,
      food: Number(d.food) || 0,
      eletricity: Number(d.eletricity) || 0
    }

    const updated = [
      { label: '經濟', value: Math.max(0, Math.min(100, map.economy)), color: '#87FF7C' },
      { label: '人口', value: Math.max(0, Math.min(100, map.polulation)), color: '#7C7EFF' },
      { label: '健康', value: Math.max(0, Math.min(100, map.healthy)), color: '#FF7C7C' },
      { label: '糧食', value: Math.max(0, Math.min(100, map.food)), color: '#FFC47C' },
      { label: '電力', value: Math.max(0, Math.min(100, map.eletricity)), color: '#FFEE7C' }
    ]

    stats.value = updated
  } catch (err) {
    console.error('loadGroupValues error', err)
  }
}

// 建設卡片資料 - 從 API 載入
const buildingCards = ref<BuildingCard[]>([])
const isLoadingPolicies = ref(false)

// 獲取群組政策
const fetchGroupPolicies = async () => {
  const groupId = localStorage.getItem('group_id')
  
  if (!groupId) {
    console.error('No group_id found in localStorage')
    return
  }
  
  isLoadingPolicies.value = true
  
  try {
    const response = await fetch(`/api/group-policies/?group_id=${groupId}`)
    const data = await response.json()
    
    if (data.ok && data.policies) {
      // 轉換數據格式以符合前端需求
      buildingCards.value = data.policies.map((policy: any) => {
        const effects = []
        
        // 經濟
        if (policy.economy !== 0) {
          effects.push({
            type: '經濟',
            value: policy.economy > 0 ? `+${policy.economy}` : `${policy.economy}`,
            icon: '#87FF7C'
          })
        }
        
        // 人口
        if (policy.population !== 0) {
          effects.push({
            type: '人口',
            value: policy.population > 0 ? `+${policy.population}` : `${policy.population}`,
            icon: '#7C7EFF'
          })
        }
        
        // 健康
        if (policy.healthy !== 0) {
          effects.push({
            type: '健康',
            value: policy.healthy > 0 ? `+${policy.healthy}` : `${policy.healthy}`,
            icon: '#FF7C7C'
          })
        }
        
        // 糧食
        if (policy.food !== 0) {
          effects.push({
            type: '糧食',
            value: policy.food > 0 ? `+${policy.food}` : `${policy.food}`,
            icon: '#FFC47C'
          })
        }
        
        // 電力
        if (policy.electricity !== 0) {
          effects.push({
            type: '電力',
            value: policy.electricity > 0 ? `+${policy.electricity}` : `${policy.electricity}`,
            icon: '#FFEE7C'
          })
        }
        
        return {
          id: policy.policy_id,
          title: policy.policy_title,
          description: '', // 資料庫中沒有 description 欄位
          image: policy.image,
          effects: effects
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch group policies:', error)
  } finally {
    isLoadingPolicies.value = false
  }
}

// 從 sessionStorage 讀取遊戲數值（關閉瀏覽器會自動重置）
onMounted(() => {
  const savedStats = sessionStorage.getItem('gameStats')
  if (savedStats) {
    const parsed = JSON.parse(savedStats)
    stats.value = stats.value.map(stat => ({
      ...stat,
      value: parsed[stat.label] ?? stat.value
    }))
  }

  // 載入組別的實際數值（若已登入）
  loadGroupValues()
  
  // 載入政策卡片
  fetchGroupPolicies()
})

// 從 localStorage 讀取學生名字
const studentName = computed(() => {
  return localStorage.getItem('student_name') || '玩家'
})

// 幸福度 = 五個數值的平均
const happiness = computed(() => {
  const total = stats.value.reduce((sum, stat) => sum + stat.value, 0)
  return Math.round(total / stats.value.length)
})

// 等級判定（根據需求： <45% 未開發國家；>=45% 且 <60% 為開發中國家；>=60% 為已開發國家）
const happinessLevel = computed(() => {
  if (happiness.value < 45) return '未開發國家'
  if (happiness.value >= 45 && happiness.value < 60) return '開發中國家'
  return '已開發國家'
})

const isNotificationActive = ref(true)
const showNotification = ref(false)
const showSidebar = ref(false)
const sidebarSection = ref<string | null>(null)

const players = ref(['玩家一', '玩家二', '玩家三', '玩家四', '玩家五'])
const groupMembers = ref<any[]>([])
const clues = ref<any[]>([])

const router = useRouter()
let lastScrollPosition = 0

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
    window.removeEventListener('scroll', handleScroll)
  } else {
    lastScrollPosition = window.scrollY
    document.body.style.overflow = 'hidden'
    window.addEventListener('scroll', handleScroll)
  }
}

function handleScroll() {
  if (showSidebar.value && window.scrollY !== lastScrollPosition) {
    showSidebar.value = false
    sidebarSection.value = null
    document.body.style.overflow = 'auto'
    window.removeEventListener('scroll', handleScroll)
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
    // 如果切換到線索，加載學生的線索
    if (section === 'clues') {
      loadStudentClues()
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

async function loadStudentClues() {
  try {
    const studentId = localStorage.getItem('student_id')
    if (!studentId) {
      console.error('Student ID not found in localStorage')
      return
    }

    const response = await fetch(`/api/student-clues/?student_id=${studentId}`)
    const data = await response.json()

    if (data.ok) {
      // 修正圖片 URL 路徑
      // 數據庫中的路徑是 'assets/clues/...'，需要轉換為 '/clues/...'
      const processedClues = (data.data || []).map((clue: any) => {
        let clueUrl = clue.clue_url || ''
        
        // 如果 URL 包含 'assets/clues/'，替換為 '/clues/'
        if (clueUrl.includes('assets/clues/')) {
          clueUrl = clueUrl.replace('assets/clues/', '/clues/')
        } else if (clueUrl.startsWith('assets/')) {
          // 備用方案：如果只是 'assets/' 開頭
          clueUrl = clueUrl.replace('assets/', '/clues/')
        }
        
        return {
          ...clue,
          clue_url: clueUrl
        }
      })
      
      clues.value = processedClues
    } else {
      console.error('Failed to load student clues:', data.error)
      clues.value = []
    }
  } catch (error) {
    console.error('Error loading student clues:', error)
    clues.value = []
  }
}

function goToKnowledgeTree() {
  router.push({ name: 'knowledgetree' })
}

function goToLeaderboard() {
  router.push({ name: 'leaderboard' })
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

function goToSeaTurtleSoup() {
  router.push({ name: 'seaturtlesoup' })
}

onBeforeUnmount(() => {
  if (showSidebar.value) {
    document.body.style.overflow = 'auto'
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="page-wrapper" :class="{ 'sidebar-open': showSidebar }">
    <!-- Sidebar Overlay (covers entire screen including header) -->
    <transition name="slide-sidebar">
      <div v-if="showSidebar" class="sidebar-overlay" @click="toggleSidebar">
        <div class="sidebar" @click.stop>
          <div class="sidebar-header">
            <button class="sidebar-close-btn" aria-label="Close menu" @click="toggleSidebar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="#333333"/>
              </svg>
            </button>
            <span class="sidebar-player-name">{{ studentName }}</span>
          </div>

          <div class="sidebar-menu">
            <div class="menu-item-wrapper">
              <button class="menu-item" @click="toggleSection('group')">
                組員
              </button>
              <svg v-if="sidebarSection === 'group'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
                <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE"/>
              </svg>
            </div>
            <div class="menu-divider"></div>
            
            <div class="menu-item-wrapper">
              <button class="menu-item" @click="toggleSection('clues')">
                個人擁有線索
              </button>
              <svg v-if="sidebarSection === 'clues'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
                <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE"/>
              </svg>
            </div>
            <div class="menu-divider"></div>
            
            <div class="menu-item-wrapper">
              <button class="menu-item" @click="toggleSection('construction')">
                國家建設狀態
              </button>
              <svg v-if="sidebarSection === 'construction'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
                <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE"/>
              </svg>
            </div>
            <div class="menu-divider"></div>

            <button class="menu-item logout-btn" @click="handleLogout">
              登出
            </button>
          </div>
        </div>

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

    <!-- Main Content -->
    <main class="main-content">
      <div class="status-card">
        <h2 class="status-title">國家狀態</h2>
        
        <div class="status-content">
          <div class="stats-grid">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="stat-item"
            >
              <svg class="stat-circle" viewBox="0 0 40 40">
                <!-- background track -->
                <circle cx="20" cy="20" :r="circleR" fill="none" stroke="#D9D9D9" stroke-width="4" />
                <!-- progress -->
                <circle cx="20" cy="20" :r="circleR" fill="none" :stroke="stat.color" stroke-width="4" stroke-linecap="round"
                  :stroke-dasharray="circleCircumference" :stroke-dashoffset="circleCircumference * (1 - (stat.value / 100))" transform="rotate(-90 20 20)" />
                <text x="20" y="24.85" text-anchor="middle" class="stat-value">{{ Math.round(stat.value) }}</text>
              </svg>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>

          <div class="horizontal-divider"></div>

          <div class="happiness-section">
            <span class="happiness-label">國家發展指數</span>
            <span class="happiness-percent">{{ happiness }}%</span>
            <div class="happiness-badge">
              <span class="happiness-level">{{ happinessLevel }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mode-cards-container">
        <div class="mode-cards">
          <div class="mode-card mode-card-quiz" @click="goToKnowledgeTree">
            <div class="mode-card-inner">
              <div class="mode-icon-box">
                <div class="mode-icon-bg">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/f2d996d90dba5a808fecb0535cf90a693c13fd96?width=390"
                    alt="搶答模式"
                    class="quiz-img"
                  />
                </div>
              </div>
              <div class="mode-text-content">
                <h3 class="mode-title">搶答模式</h3>
                <p class="mode-desc">競速模式搶答，獲得線索與金幣吧！</p>
              </div>
            </div>
          </div>

          <div class="mode-card mode-card-leaderboard" @click="goToLeaderboard">
            <div class="mode-card-inner">
              <div class="mode-icon-box">
                <div class="mode-icon-bg">
                  <svg width="192" height="195" viewBox="0 0 192 195" fill="none">
                    <rect width="195" height="195" rx="30" fill="#E1E1E1"/>
                    <defs>
                      <filter id="filter0_d" x="19" y="39.625" width="157" height="119.75" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="2"/>
                        <feGaussianBlur stdDeviation="2"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                      </filter>
                      <linearGradient id="leaderboardGrad" x1="23" y1="111" x2="172" y2="110" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FFBD42"/>
                        <stop offset="0.5" stop-color="#FF9C42"/>
                        <stop offset="1" stop-color="#FF7B42"/>
                      </linearGradient>
                    </defs>
                    <g filter="url(#filter0_d)">
                      <path d="M165.463 86.7968C164.935 85.7476 163.861 85.0833 162.688 85.0833H134.75V91.2917H167.71L165.463 86.7968ZM122.004 43.3385C121.477 42.2893 120.403 41.625 119.229 41.625H75.7708C74.5975 41.625 73.5234 42.2893 72.9957 43.3385L70.7483 47.8333H124.252L122.004 43.3385ZM171.857 99.8902C171.808 99.6915 171.783 99.4929 171.702 99.3128C171.212 98.2512 170.144 97.5 168.896 97.5H128.542V57.1458C128.542 56.8913 128.455 56.6678 128.399 56.4319C128.349 56.2332 128.324 56.0345 128.244 55.8545C127.753 54.7929 126.685 54.0417 125.438 54.0417H69.5625C68.3146 54.0417 67.253 54.7929 66.7563 55.8545C66.6756 56.0345 66.6446 56.2332 66.6011 56.4319C66.5452 56.6678 66.4583 56.8913 66.4583 57.1458V91.2917H26.1042C24.8563 91.2917 23.7947 92.0429 23.298 93.1045C23.2173 93.2845 23.1863 93.4832 23.1428 93.6819C23.0869 93.9178 23 94.1413 23 94.3958V150.271C23 151.978 24.3907 153.375 26.1042 153.375H168.896C170.609 153.375 172 151.978 172 150.271V100.604C172 100.35 171.913 100.126 171.857 99.8902ZM54.0417 128.535C55.7552 128.535 57.1458 129.932 57.1458 131.646C57.1458 133.359 55.7552 134.75 54.0417 134.75H41.625C40.3709 134.75 39.2348 133.993 38.7568 132.832C38.2725 131.671 38.5395 130.336 39.4272 129.448L47.4546 121.421C49.6958 119.173 50.9375 116.187 50.9375 113.015C50.9375 111.307 49.5468 109.91 47.8333 109.91C46.1198 109.91 44.7292 111.307 44.7292 113.015C44.7292 114.728 43.3385 116.119 41.625 116.119C39.9115 116.119 38.5208 114.728 38.5208 113.015C38.5208 107.88 42.699 103.702 47.8333 103.702C52.9676 103.702 57.1458 107.88 57.1458 113.015C57.1458 117.839 55.2647 122.389 51.8439 125.81L49.1185 128.535H54.0417ZM103.715 106.812H103.708C103.708 108.526 102.318 109.917 100.604 109.917C98.8907 109.917 97.5 108.526 97.5 106.812V83.2643L96.5936 84.1707C95.383 85.3813 93.4149 85.3813 92.2043 84.1707C90.9937 82.9601 90.9937 80.992 92.2043 79.7814L98.4126 73.5731C99.3004 72.6791 100.635 72.4183 101.796 72.9026C102.957 73.3806 103.715 74.5168 103.715 75.7708V106.812ZM156.479 131.646C156.479 136.78 152.301 140.958 147.167 140.958C142.032 140.958 137.854 136.78 137.854 131.646C137.854 129.932 139.245 128.542 140.958 128.542C142.672 128.542 144.062 129.932 144.062 131.646C144.062 133.353 145.453 134.75 147.167 134.75C148.88 134.75 150.271 133.353 150.271 131.646C150.271 129.939 148.88 128.542 147.167 128.542C145.453 128.542 144.062 127.151 144.062 125.438C144.062 123.724 145.453 122.333 147.167 122.333C148.88 122.333 150.271 120.936 150.271 119.229C150.271 117.522 148.88 116.125 147.167 116.125C145.453 116.125 144.062 117.522 144.062 119.229C144.062 120.943 142.672 122.333 140.958 122.333C139.245 122.333 137.854 120.943 137.854 119.229C137.854 114.095 142.032 109.917 147.167 109.917C152.301 109.917 156.479 114.095 156.479 119.229C156.479 121.613 155.579 123.786 154.101 125.438C155.579 127.089 156.479 129.262 156.479 131.646ZM60.25 78.875H32.3125C31.1391 78.875 30.0651 79.5393 29.5374 80.5885L27.29 85.0833H60.25V78.875Z" fill="url(#leaderboardGrad)"/>
                    </g>
                  </svg>
                </div>
              </div>
              <div class="mode-text">
                <h3 class="mode-title">排行榜</h3>
                <p class="mode-desc">看看你的對手有誰！</p>
              </div>
            </div>
          </div>

          <div class="mode-card mode-card-turtle" @click="goToSeaTurtleSoup">
            <div class="mode-card-inner">
              <div class="mode-icon-box">
                <div class="mode-icon-bg">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F07579a4373634a9cae301a29b729ecef%2F7cf59e86c9114cf69282ae8353e29bcb?format=webp&width=800"
                    alt=""
                    class="turtle-img"
                  />
                </div>
              </div>
              <div class="mode-text">
                <h3 class="mode-title">海龜湯模式</h3>
                <p class="mode-desc">解開不同主題海龜湯，建立自己的國家！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: #FFF;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

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
  background-color: #ddd;
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

.clue-text-only {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.clue-badge {
  padding: 10px 15px;
  border-radius: 20px;
  background: #FEAD00;
  color: #FFF;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  flex-shrink: 0;
}

.clue-text {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  word-break: break-word;
  white-space: normal;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  flex: 1;
  padding: 39px 20px;
  display: flex;
  flex-direction: column;
  gap: 51px;
}

.status-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 29px 51px;
  border-radius: 20px;
  border: 1px solid #E2E2E2;
  background: #FFF;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  align-self: center;
}

.status-title {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 40px;
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.happiness-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  justify-content: center;
}

.happiness-label {
  color: #333;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 22px;
}

.happiness-percent {
  color: #7C7EFF;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 22px;
}

.happiness-badge {
  padding: 6px;
  border-radius: 11px;
  background: #7C7EFF;
  display: flex;
  justify-content: center;
  align-items: center;
}

.happiness-level {
  color: #1C20FF;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 12px;
  line-height: 22px;
}

.horizontal-divider {
  width: 100%;
  height: 1px;
  background: #E5E5E5;
}

.stats-grid {
  display: flex;
  align-items: center;
  gap: 60px;
  flex: 1;
  justify-content: center;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.stat-circle {
  width: 40px;
  height: 40px;
}

.stat-value {
  fill: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
}

.stat-label {
  color: #666;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 22px;
}

.mode-cards-container {
  width: calc(100vw - 0px);
  margin-left: calc(-50vw + 50%);
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 20px;
  scroll-behavior: smooth;
}

.mode-cards {
  display: flex;
  gap: 59px;
  padding: 23px 20px;
  margin: 0 auto;
  width: fit-content;
}

.mode-card {
  width: 357px;
  height: 357px;
  border-radius: 30px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.3s;
  position: relative;
}

.mode-card:hover {
  transform: scale(1.05);
}

.mode-card-quiz {
  background: linear-gradient(135deg, #8B6EF2 0%, #CF6EF2 50%, #8B6EF2 100%);
  padding: 24px 61px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mode-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 30px;
}

.mode-card-leaderboard {
  background: linear-gradient(135deg, #4A53FF 0%, #9BAEFF 50%, #4A53FF 100%);
  padding: 24px 61px;
}

.mode-card-turtle {
  background: linear-gradient(135deg, #F90 0%, #FFC300 50%, #F90 100%);
  padding: 24px 31px;
}

.mode-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  height: 100%;
}

.mode-icon-box {
  width: 235px;
  height: 235px;
  padding: 20px;
  border-radius: 30px;
  background: rgba(243, 243, 245, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}

.mode-icon-bg {
  width: 195px;
  height: 195px;
  border-radius: 30px;
  background: #E1E1E1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.turtle-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 30px;
}

.quiz-img {
  width: 195px;
  height: 195px;
  border-radius: 30px;
  object-fit: cover;
}

.mode-text-content,
.mode-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mode-title {
  color: #FFF;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
}

.mode-desc {
  color: #FFF;
  text-align: center;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
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

.building-card-locked {
  filter: grayscale(100%);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .header {
    padding: 20px;
  }

  .header-left {
    gap: 20px;
  }

  .notification-panel {
    right: 20px;
    width: calc(100% - 40px);
    max-width: 350px;
  }

  .main-content {
    padding: 20px;
  }

  .status-card {
    padding: 20px;
  }

  .status-content {
    gap: 30px;
  }

  .horizontal-divider {
    width: 100%;
  }

  .stats-grid {
    flex-wrap: wrap;
    gap: 40px;
  }

  .mode-cards {
    gap: 30px;
  }

  .building-cards-wrapper {
    padding: 30px 0 30px 15px;
  }

  .building-cards {
    gap: clamp(15px, 4vw, 30px);
    padding-right: clamp(15px, 4vw, 30px);
  }

  .building-card {
    width: clamp(200px, 75vw, 280px);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    gap: 15px;
  }

  .stat-item {
    width: calc(33.33% - 10px);
  }
}
</style>
