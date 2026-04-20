<template>
  <transition name="fade">
    <div v-if="showSidebar" class="sidebar-overlay" @click="$emit('toggle-sidebar')">
      <div class="sidebar" @click.stop>
        <div class="sidebar-header">
          <div class="sidebar-user">
            <button class="sidebar-close-btn" aria-label="Close menu" @click="$emit('toggle-sidebar')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="#333333" />
              </svg>
            </button>
            <span class="sidebar-username">玩家一</span>
          </div>
          <div class="sidebar-divider"></div>
        </div>

        <div class="sidebar-menu">
          <div class="menu-item-wrapper">
            <button class="menu-item" @click="$emit('toggle-section','group')">組員</button>
            <svg v-if="sidebarSection === 'group'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
              <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE" />
            </svg>
          </div>
          <div class="menu-divider"></div>

          <div class="menu-item-wrapper">
            <button class="menu-item" @click="$emit('toggle-section','clues')">個人擁有線索</button>
            <svg v-if="sidebarSection === 'clues'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
              <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE" />
            </svg>
          </div>
          <div class="menu-divider"></div>

          <div class="menu-item-wrapper">
            <button class="menu-item" @click="$emit('toggle-section','construction')">國家建設狀態</button>
            <svg v-if="sidebarSection === 'construction'" class="menu-arrow" width="11" height="12" viewBox="0 0 11 12" fill="none">
              <path d="M4.92758e-05 2.0032C4.91279e-05 0.4636 1.66672 -0.498652 3.00005 0.271148L9.91694 4.26461C11.2503 5.03441 11.2503 6.95892 9.91694 7.72872L3.00005 11.7222C1.66672 12.492 4.8823e-05 11.5297 4.90604e-05 9.99013L4.92758e-05 2.0032Z" fill="#EEEEEE" />
            </svg>
          </div>
          <div class="menu-divider"></div>

          <button class="menu-item">登出</button>
        </div>

        <!-- sections rendered by the component when toggled -->
        <transition name="slide-content">
          <div v-if="sidebarSection === 'group'" class="section-content">
            <div class="player-list">
              <button v-for="player in players" :key="player" class="player-btn">{{ player }}</button>
            </div>
          </div>
        </transition>

        <transition name="slide-content">
          <div v-if="sidebarSection === 'clues'" class="section-content clues-content">
            <div class="clues-list">
              <div v-for="(clue, index) in clues" :key="index" class="clue-item">
                <div class="clue-badge">線索</div>
                <div class="clue-text">{{ clue }}</div>
              </div>
            </div>
          </div>
        </transition>

        <!-- 國家建設狀態內容 -->
        <transition name="slide-content">
          <div v-if="sidebarSection === 'construction'" class="section-content construction-content">
            <div v-if="isLoadingPolicies" class="loading-message">載入中...</div>
            <div v-else-if="policyCards.length === 0" class="empty-message">暫無政策卡片</div>
            <div v-else class="building-cards-wrapper">
              <div class="building-cards">
                <img 
                  v-for="card in policyCards" 
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
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  showSidebar: boolean
  sidebarSection: string | null
  players?: string[]
  clues?: string[]
}>()

// 政策卡片資料
const policyCards = ref<any[]>([])
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
      policyCards.value = data.policies.map((policy: any) => {
        const effects = []
        
        // 經濟
        if (policy.economy !== 0) {
          effects.push({
            type: '經濟',
            value: policy.economy > 0 ? `+${policy.economy}` : `${policy.economy}`
          })
        }
        
        // 人口
        if (policy.population !== 0) {
          effects.push({
            type: '人口',
            value: policy.population > 0 ? `+${policy.population}` : `${policy.population}`
          })
        }
        
        // 健康
        if (policy.healthy !== 0) {
          effects.push({
            type: '健康',
            value: policy.healthy > 0 ? `+${policy.healthy}` : `${policy.healthy}`
          })
        }
        
        // 糧食
        if (policy.food !== 0) {
          effects.push({
            type: '糧食',
            value: policy.food > 0 ? `+${policy.food}` : `${policy.food}`
          })
        }
        
        // 電力
        if (policy.electricity !== 0) {
          effects.push({
            type: '電力',
            value: policy.electricity > 0 ? `+${policy.electricity}` : `${policy.electricity}`
          })
        }
        
        return {
          id: policy.policy_id,
          title: policy.policy_title,
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

// 監聽 sidebarSection 變化,當選擇 construction 時載入政策
watch(() => props.sidebarSection, (newSection) => {
  if (newSection === 'construction' && policyCards.value.length === 0) {
    fetchGroupPolicies()
  }
})
// emits: toggle-sidebar, toggle-section
</script>

<style scoped>
/* Overlay and container */
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

.sidebar-close-btn:hover { opacity: 0.7; }

.sidebar-divider { width: 100%; height: 1px; background: #eee; }

.sidebar-menu { display: flex; flex-direction: column; gap: 20px; padding: 0 50px; }

.menu-item-wrapper { position: relative; display: flex; align-items: center; justify-content: flex-start; width: 100%; }

.menu-item { color: #333; font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif; font-size: 18px; line-height: 22px; background: none; border: none; cursor: pointer; padding: 0; text-align: left; }

.menu-item:hover { opacity: 0.7; }

.menu-arrow { position: absolute; right: -35px; flex-shrink: 0; }

.menu-divider { width: calc(100% + 100px); height: 1px; background: #ddd; margin: 0 -50px; }

/* Sections that slide out next to the sidebar */
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

.player-list { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }

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

.player-btn:hover { background: rgba(255, 255, 255, 0.9); }

.clues-content { width: auto; max-width: calc(100vw - 280px); }

.clues-list { display: flex; flex-direction: column; gap: 20px; max-height: calc(100vh - 140px); overflow-y: auto; padding-right: 10px; }

.clue-item { display: flex; padding: 10px 25px; align-items: center; gap: 15px; border-radius: 25px; border: 1px solid #FEAD00; background: #FFF4D8; min-height: 50px; }

.clue-badge { padding: 10px 15px; border-radius: 20px; background: #FEAD00; color: #FFF; text-align: center; font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif; font-size: 16px; font-weight: 700; line-height: 22px; flex-shrink: 0; }

.clue-text { color: #333; font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif; font-size: 16px; line-height: 22px; }

/* Building cards (construction section) */
.construction-content { 
  position: fixed; 
  left: 0; 
  top: 0; 
  right: 0; 
  bottom: 0; 
  padding: 0; 
  background: rgba(0, 0, 0, 0.5); 
  z-index: 250; 
  overflow: hidden; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.building-cards-wrapper { 
  width: auto; 
  max-width: 90vw;
  height: auto;
  max-height: 80vh;
  overflow-x: auto; 
  overflow-y: hidden; 
  padding: 30px;
  background: transparent;
}

.building-cards { 
  display: flex; 
  align-items: center; 
  gap: clamp(20px, 5vw, 40px); 
  height: 100%; 
  padding: 20px;
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

.building-card-locked { filter: grayscale(100%); opacity: 0.8; }

/* 載入和空狀態訊息 */
.loading-message, .empty-message {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #666;
  font-family: Arial, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  z-index: 250;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-content-enter-active { transition: opacity 0.3s ease-in-out; }
.slide-content-leave-active { transition: opacity 0.2s ease-in-out; }
.slide-content-enter-from, .slide-content-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .building-cards-wrapper { padding: 30px 0 30px 15px; }
  .building-cards { gap: clamp(15px, 4vw, 30px); padding-right: clamp(15px, 4vw, 30px); }
}

</style>
