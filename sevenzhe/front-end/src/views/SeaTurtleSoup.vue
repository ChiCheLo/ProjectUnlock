<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'

type Domain = { name: string; color: string; image?: string }

type BuildingCard = {
  id: number
  title: string
  description: string
  image: string
  effects: { type: string; value: string; icon?: string }[]
}

const router = useRouter()
const route = useRoute()

// 決策彈窗狀態
const showDecisionModal = ref(false)
const decisionDomain = ref('')

// 載入組別政策數量
const loadPolicyCount = async () => {
  try {
    const groupId = localStorage.getItem('group_id')
    if (!groupId) {
      console.warn('未找到 group_id，使用預設值')
      return
    }

    const response = await fetch(`http://127.0.0.1:8000/api/group-policy-count/?group_id=${groupId}`)
    const data = await response.json()

    if (data.ok) {
      progressText.value = `${data.policy_count} / 9`
    }
  } catch (error) {
    console.error('載入政策數量失敗:', error)
  }
}

// 載入組別線索數量
const loadCluesCount = async () => {
  try {
    const groupId = localStorage.getItem('group_id')
    if (!groupId) {
      console.warn('未找到 group_id，使用預設值')
      return
    }

    const response = await fetch(`http://127.0.0.1:8000/api/group-clues-count/?group_id=${groupId}`)
    const data = await response.json()

    if (data.ok) {
      cluesFoundText.value = `${data.group_clues} / ${data.total_clues}`
    }
  } catch (error) {
    console.error('載入線索數量失敗:', error)
  }
}

// 載入已完成的域
const completedDomains = ref<string[]>([])

const loadCompletedDomains = async () => {
  try {
    const groupId = localStorage.getItem('group_id')
    if (!groupId) {
      console.warn('未找到 group_id，使用預設值')
      return
    }

    const response = await fetch(`http://127.0.0.1:8000/api/completed-domains/?group_id=${groupId}`)
    const data = await response.json()

    if (data.ok) {
      completedDomains.value = data.completed_domains
    }
  } catch (error) {
    console.error('載入已完成域失敗:', error)
  }
}

// 檢查域是否已完成
const isDomainCompleted = (domainName: string) => {
  return completedDomains.value.includes(domainName)
}

// 檢查是否從 ChatRoom 答對後返回
onMounted(() => {
  if (route.query.showDecision === 'true' && route.query.domain) {
    decisionDomain.value = route.query.domain as string
    showDecisionModal.value = true
    // 清除 query 參數
    router.replace({ path: '/sea-turtle-soup' })
  }
  
  // 載入政策數量、線索數量和已完成域
  loadPolicyCount()
  loadCluesCount()
  loadCompletedDomains()
})

const domains = ref<Domain[]>([
  { name: '風域', color: '#A8D8EA', image: '/海龜湯選擇/風域.png' },      // 第1個 - 左上
  { name: '火域', color: '#FF6B6B', image: '/海龜湯選擇/火域.png' },      // 第2個
  { name: '土域', color: '#AA7E5A', image: '/海龜湯選擇/土域.png' },      // 第3個 - 右上
  { name: '木域', color: '#6BCF7F', image: '/海龜湯選擇/木域.png' },      // 第4個 - 左中
  { name: '空域', color: '#A29BFE', image: '/海龜湯選擇/空域.png' },      // 第5個 - 中中
  { name: '金域', color: '#FFD93D', image: '/海龜湯選擇/金域.png' },      // 第6個 - 右中
  { name: '雷域', color: '#B8E994', image: '/海龜湯選擇/雷域.png' },      // 第7個 - 左下
  { name: '水域', color: '#4FACFE', image: '/海龜湯選擇/水域.png' },      // 第8個
  { name: '光域', color: '#FFE66D', image: '/海龜湯選擇/光域.png' }       // 第9個 - 右下
])

const centerDomain = computed(() => {
  return null  // 不再使用中心域
})

const surroundingDomains = computed(() => domains.value)  // 所有域

const selectedDomain = ref<string | null>(null)
const hoveredDomain = ref<string | null>(null)
const progressText = ref('0 / 9')
const cluesFoundText = ref('0 / 40')
const showCluesModal = ref(false)

const showSidebar = ref(false)
const sidebarSection = ref<string | null>(null)
const players = ref<string[]>(['玩家一', '玩家二', '玩家三'])
const buildingCards = ref<BuildingCard[]>([
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
])

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

const isNotificationActive = ref(true)
const showNotification = ref(true)

function getDomainPosition(index: number) {
  // 3x3 網格佈局（9個域）
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const row = Math.floor(index / 3)
  const col = index % 3
  const colPercent = col === 0 ? 25 : col === 1 ? 50 : 75
  const rowPercent = row === 0 ? 25 : row === 1 ? 50 : 75
  return { left: `${colPercent}%`, top: `${rowPercent}%`, transform: 'translate(-50%, -50%)' }
}

function getLineEndX(index: number) {
  // 不再使用連線
  return 100
}

function getLineEndY(index: number) {
  // 不再使用連線
  return 100
}

function selectDomain(domain: Domain) {
  // 檢查域是否已完成，如果已完成則不允許選取
  if (isDomainCompleted(domain.name)) {
    console.log('[SeaTurtleSoup] 域已完成，無法選取:', domain.name)
    return
  }
  
  console.log('[SeaTurtleSoup] selectDomain called:', domain)
  selectedDomain.value = domain.name
  const routeName = 'seaturtlesoup-domain'
  try {
    router.push({ name: routeName, params: { domain: domain.name } })
  } catch (e) {
    // fallback to path
    router.push(`/sea-turtle-soup/${encodeURIComponent(domain.name)}`)
  }
}

function handleBack() {
  router.push('/')
}
function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

function closeSidebar() {
  showSidebar.value = false
}

function setSidebarSection(s: string | null) {
  sidebarSection.value = s
}

// 處理決策選擇
function handleDecision(choice: '建立' | '不建立') {
  console.log(`[${decisionDomain.value}] 玩家選擇：${choice}`)

  // 根據選擇計算數值變化
  let effects: { 經濟: number; 健康: number; 電力: number }
  if (choice === '建立') {
    effects = { 經濟: 1, 健康: -2, 電力: 3 }
  } else {
    effects = { 經濟: 1, 健康: 1, 電力: 2 }
  }

  // 從 sessionStorage 讀取現有數值，並更新
  const currentStats = JSON.parse(sessionStorage.getItem('gameStats') || '{"經濟":50,"人口":50,"健康":50,"糧食":50,"電力":50}')
  currentStats.經濟 += effects.經濟
  currentStats.健康 += effects.健康
  currentStats.電力 += effects.電力

  // 儲存回 sessionStorage（關閉瀏覽器會自動重置）
  sessionStorage.setItem('gameStats', JSON.stringify(currentStats))

  showDecisionModal.value = false
}
</script>

<template>
  <div class="page-wrapper">
    <Header @toggle-sidebar="toggleSidebar" />

    <main class="main-content seaturtle-main">
      <!-- 返回按鈕 -->
      <button class="seaturtle-back-btn" @click="handleBack">
        <svg class="seaturtle-back-icon" viewBox="0 0 24 24" fill="none">
          <path d="M7.828 10.9999L13.192 5.63592L11.778 4.22192L4 11.9999L11.778 19.7779L13.192 18.3639L7.828 12.9999H20V10.9999H7.828Z" fill="white" />
        </svg>
        <span>返回</span>
      </button>

      <div class="seaturtle-grid">
        <div class="wheel-card">
          <!-- Logo at top-left -->
          <div class="turtle-logo-box">
            <svg class="turtle-logo-icon" viewBox="0 0 19 19" fill="none">
              <path d="M4.9362 5.10879C3.92686 6.15639 3.30893 7.51953 3.18628 8.96909C3.06363 10.4186 3.44373 11.8662 4.2627 13.0685C5.08167 14.2708 6.28957 15.1546 7.68338 15.5711C9.07718 15.9877 10.5719 15.9118 11.9163 15.3561C12.0074 14.7624 11.8079 14.1924 11.7263 13.9929C11.5442 13.5495 10.9442 12.7919 9.9427 11.7414C9.67512 11.4603 9.69254 11.2442 9.78833 10.6037L9.79862 10.5317C9.86354 10.0931 9.97279 9.83345 11.4492 9.59912C12.1997 9.48037 12.3969 9.77962 12.67 10.1952L12.7618 10.3314C13.0215 10.7114 13.2139 10.7985 13.5044 10.9299C13.635 10.9893 13.7973 11.0645 14.015 11.1872C14.5312 11.4825 14.5312 11.8158 14.5312 12.5457V12.6288C14.5312 12.9384 14.5011 13.2107 14.4536 13.4474C15.0611 12.685 15.4845 11.7926 15.6907 10.8398C15.8969 9.88701 15.8804 8.89946 15.6426 7.95406C15.4047 7.00866 14.9519 6.13091 14.3193 5.38915C13.6867 4.64738 12.8915 4.06162 11.9955 3.67745C11.5577 3.97275 10.9568 4.39154 10.747 4.67891C10.6402 4.82537 10.4882 5.57508 9.99495 5.63683C9.8667 5.65266 9.69333 5.64158 9.50966 5.6297C9.01725 5.59804 8.34433 5.5545 8.129 6.13954C7.99204 6.51004 7.96829 7.51704 8.41083 8.03954C8.48208 8.12266 8.49554 8.27704 8.44725 8.45041C8.38391 8.67762 8.25645 8.81616 8.21608 8.84466C8.14008 8.80033 7.98808 8.62379 7.88437 8.50425C7.63658 8.21529 7.32625 7.85508 6.92566 7.74425C6.78 7.70387 6.62008 7.67062 6.46412 7.63737C6.0295 7.54633 5.53787 7.44262 5.42308 7.19879C5.33916 7.01987 5.33995 6.77366 5.33995 6.514C5.33995 6.18387 5.33995 5.811 5.17845 5.4492C5.12231 5.32009 5.03979 5.20414 4.9362 5.10879ZM9.50016 17.4168C5.12779 17.4168 1.5835 13.8725 1.5835 9.50016C1.5835 5.12779 5.12779 1.5835 9.50016 1.5835C13.8725 1.5835 17.4168 5.12779 17.4168 9.50016C17.4168 13.8725 13.8725 17.4168 9.50016 17.4168Z" />
            </svg>
            <span class="turtle-logo-text">海龜湯</span>
          </div>

          <div class="wheel-inner">
            <div class="wheel-container">
              <div class="wheel-lines">
                <button
                  v-for="(domain, idx) in surroundingDomains"
                  :key="`${domain.name}-${idx}`"
                  class="domain-item"
                  :class="{ 
                    'domain-selected': selectedDomain === domain.name,
                    'domain-adjust-up': domain.name === '水域' || domain.name === '雷域',
                    'domain-completed': isDomainCompleted(domain.name)
                  }"
                  @click="selectDomain(domain)"
                  @mouseenter="hoveredDomain = domain.name"
                  @mouseleave="hoveredDomain = null"
                  :disabled="isDomainCompleted(domain.name)"
                >
                  <div class="domain-circle">
                    <img v-if="domain.image" :src="domain.image" :alt="domain.name" class="domain-img" />
                    <div v-else :style="{ background: domain.color }" class="domain-fallback"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="seaturtle-right">
          <div class="info-card">
            <div class="info-card-title-row">
              <div class="info-card-icon">🏆</div>
              <div class="info-card-title">完成進度</div>
            </div>
            <div class="info-card-main-text">
              <div class="info-card-main-number">{{ progressText }}</div>
            </div>
          </div>

          <div class="info-card" @click="showCluesModal = true">
            <div class="info-card-title-row">
              <div class="info-card-icon">🔎</div>
              <div class="info-card-title">已知線索</div>
            </div>
            <div class="info-card-main-text">
              <div class="info-card-main-number" >{{ cluesFoundText }}</div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="showCluesModal" class="clues-modal-overlay" @click.self="showCluesModal = false">
          <div class="clues-modal">
            <button class="clues-modal-close" @click="showCluesModal = false">
              <svg class="clues-modal-close-icon" viewBox="0 0 37 36" fill="none">
                <path d="M5.50098 4.49951L32.501 31.4995" stroke="#333" stroke-width="5" stroke-linecap="round" />
                <path d="M32.1396 4.13965L5.13965 31.1397" stroke="#333" stroke-width="5" stroke-linecap="round" />
              </svg>
            </button>

            <div class="clues-modal-inner">
              <div v-for="(clue, index) in clues" :key="index" class="clue-item">
                <div class="clue-badge">線索</div>
                <div class="clue-text">{{ clue }}</div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </main>

  <Sidebar
    v-if="showSidebar"
    :showSidebar="showSidebar"
    :sidebarSection="sidebarSection"
    :buildingCards="buildingCards"
    :players="players"
    :clues="clues"
    @toggle-sidebar="closeSidebar"
    @toggle-section="setSidebarSection"
  />

    <!-- 決策彈出視窗 -->
    <div v-if="showDecisionModal" class="decision-modal-overlay">
      <div class="decision-modal">
        <h2 class="decision-modal-title">{{ decisionDomain }} - 國家決策</h2>
        <p class="decision-modal-subtitle">是否建立火力發電廠？</p>
        <div class="decision-modal-buttons">
          <button class="decision-btn-yes" @click="handleDecision('建立')">建立</button>
          <button class="decision-btn-no" @click="handleDecision('不建立')">不建立</button>
        </div>
      </div>
    </div>
    </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
}

.page-wrapper.sidebar-open::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(145, 145, 145, 0.4);
  z-index: 95;
  pointer-events: none;
}

/* Header */
.header {
  border-bottom: 1px solid #c2c2c2;
  background: #fff;
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

/* Notification */
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
  background: url('https://api.builder.io/api/v1/image/assets/TEMP/04fc62df1623912b4d9d4e67ee4161cfe407f580?width=72')
    no-repeat center center;
  background-size: cover;
  flex-shrink: 0;
}

.notification-text {
  display: flex;
  gap: 5px;
  padding-left: 6px;
}

.notification-country {
  color: #ff7c7c;
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

/* Sidebar */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 200;
  display: flex;
}

.sidebar {
  width: 236px;
  height: 100vh;
  background: #fff;
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
  display: flex;
  flex-direction: column;
  gap: 37px;
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
  width: 100%;
  height: 1px;
  background: #eee;
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
  background: #ddd;
  margin: 0 -50px;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 10px;
}

.clue-item {
  display: flex;
  padding: 10px 25px;
  align-items: center;
  gap: 15px;
  border-radius: 25px;
  border: 1px solid #fead00;
  background: #fff4d8;
  min-height: 50px;
}

.clue-badge {
  padding: 10px 15px;
  border-radius: 20px;
  background: #fead00;
  color: #fff;
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
  font-size: 16px;
  line-height: 22px;
}

/* Main */
.main-content {
  flex: 1;
  padding: 39px 50px 40px;
}

/* 海龜湯整體背景 */
.seaturtle-main {
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 40%, #ff9447 100%);
  border-radius: 0;
  margin: 0 -50px -40px;
  padding: 30px 60px 60px;
}

/* 上方：返回 + title */
.seaturtle-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.seaturtle-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  margin-bottom: 24px;
  transition: background-color 0.2s ease;
}

.seaturtle-back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.seaturtle-back-icon {
  width: 20px;
  height: 20px;
}

.seaturtle-title-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.seaturtle-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seaturtle-title-row h2 {
  color: #fff;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
}

.seaturtle-title-icon {
  width: 18px;
  height: 18px;
  fill: #ff5739;
}

.seaturtle-subtitle {
  color: #fff;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 40px;
}

/* Grid：左輪盤 + 右資訊 */
.seaturtle-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.3fr);
  gap: 32px;
}

/* 左側輪盤卡片 */
.wheel-card {
  background: #f7f7f7;
  border-radius: 30px;
  padding: 32px 24px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
  position: relative;
}

/* 左上角的海龜湯 Logo */
.turtle-logo-box {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 10;
}

.turtle-logo-icon {
  width: 24px;
  height: 24px;
  fill: #ff5739;
}

.turtle-logo-text {
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.wheel-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wheel-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  margin-top: 24px;
}

/* 九宮格 3x3 佈局 */
.wheel-lines {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  pointer-events: none;
}

/* allow buttons inside wheel to receive pointer events */
.wheel-lines .domain-item {
  pointer-events: auto;
}

.center-fallback,
.domain-fallback {
  width: 100%;
  height: 100%;
}

/* 周圍域 Button */
.domain-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  aspect-ratio: 1 / 1;
  /* 未懸停時：較淡的顏色 */
  opacity: 0.7;
  transition: all 0.2s ease;
}

/* 懸停時：恢復完整顏色 並顯示在最上層 */
.domain-item:hover {
  opacity: 1;
  z-index: 10;
  position: relative;
}

/* 選中狀態也顯示完整顏色 */
.domain-item.domain-selected {
  opacity: 1;
}

/* 已完成的域 - 反白並禁用 */
.domain-item.domain-completed {
  opacity: 0.35;
  cursor: not-allowed;
  filter: grayscale(80%);
}

.domain-item.domain-completed:hover {
  opacity: 0.35;
  transform: none;
  z-index: 1;
}

.domain-item.domain-completed .domain-circle {
  transform: none !important;
}

.domain-circle {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: #f0f0f0;
}

.domain-item:hover .domain-circle,
.domain-item.domain-selected .domain-circle {
  transform: scale(1.05);
}

.domain-item:hover {
  transform: scale(1.05);
}

.domain-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 水域和雷域的圖片向上調整 */
.domain-adjust-up .domain-img {
  object-position: center 20%;
}

/* 選中狀態 */
.domain-selected .domain-circle {
  outline: 3px solid rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
  transition: transform 0.15s ease-out;
}

/* 右側資訊區 */
.seaturtle-right {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 五屬性 pill */
.stats-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 999px;
  background: #fff;
  padding: 16px 24px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

.stats-pill-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 40px;
}

.stats-pill-icon {
  width: 14px;
  height: 14px;
  border-radius: 999px;
}

.stats-pill-value {
  color: #555;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
}

/* 通用 info 卡片 */
.info-card {
  border-radius: 26px;
  background: #f5f5f5;
  padding: 20px 24px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: none;
}

.info-card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-card-icon {
  font-size: 20px;
}

.info-card-title {
  color: #555;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
}

.info-card-main-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-card-main-number {
  color: #333;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 26px;
  font-weight: 700;
}

.info-card-arrow {
  width: 22px;
  height: 22px;
}

/* 完成進度卡 */
.progress-card {
  background: #f7f7f7;
}

/* 已知線索卡 */
.clues-card-main {
  background: #f7f7f7;
  cursor: pointer;
}

/* 海龜湯 線索 Modal */
.clues-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.clues-modal {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  border-radius: 30px;
  background: #fff;
  padding: 30px 30px;
  overflow: hidden;
}

.clues-modal-close {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.clues-modal-close-icon {
  width: 30px;
  height: 30px;
}

.clues-modal-inner {
  max-height: calc(85vh - 60px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

/* 建設 cards（側欄） */
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
  background: #eee;
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

/* RWD */
@media (max-width: 1024px) {
  .seaturtle-main {
    padding: 24px 20px 40px;
    margin: 0 -20px -40px;
  }

  .seaturtle-grid {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1.3fr);
  }
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

  .seaturtle-main {
    padding: 24px 16px 32px;
    margin: 0 -16px -32px;
  }

  .seaturtle-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .wheel-card {
    padding: 20px 12px;
  }

  .seaturtle-topbar {
    align-items: flex-start;
  }

  .seaturtle-title-block {
    align-items: center;
  }
}

@media (max-width: 600px) {
  .stats-pill {
    flex-wrap: wrap;
    row-gap: 10px;
  }

  .stats-pill-item {
    flex: 1 0 20%;
  }
}

/* 決策彈出視窗樣式 */
.decision-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.decision-modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.decision-modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.decision-modal-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px;
}

.decision-modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.decision-modal-buttons button {
  padding: 14px 24px;
  border: 2px solid;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}

.decision-modal-buttons button:hover {
  opacity: 0.8;
}

.decision-btn-yes {
  background: #c8e6c9;
  color: #2e7d32;
  border-color: #81c784;
}

.decision-btn-no {
  background: #ffcdd2;
  color: #c62828;
  border-color: #ef9a9a;
}
</style>
