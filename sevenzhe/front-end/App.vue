<template>
  <router-view />
  <ClueTrade v-if="route.name !== 'login'" />
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ClueTrade from './src/components/ClueTrade.vue'

const route = useRoute()

// ── 音樂管理 ──────────────────────────────────────────────
// 路由名稱 → 音樂群組
const ROUTE_MUSIC: Record<string, { src: string; group: string }> = {
  login:               { src: '/audio/Login.mp3',        group: 'login' },
  homepage:            { src: '/audio/Homepage.mp3',     group: 'home' },
  leaderboard:         { src: '/audio/Homepage.mp3',     group: 'home' },
  seaturtlesoup:       { src: '/audio/Homepage.mp3',     group: 'home' },
  'seaturtlesoup-domain': { src: '/audio/Chat.mp3',      group: 'chat' },
  knowledgetree:       { src: '/audio/KnowledgeTree.mp3',group: 'quiz' },
}

let currentAudio: HTMLAudioElement | null = null
let currentGroup: string | null = null

// 需要播放 enter.mp3 的路由轉換（from → to）
const ENTER_TRANSITIONS = new Set([
  'login→homepage',
  'homepage→knowledgetree',
  'homepage→leaderboard',
  'homepage→seaturtlesoup',
  'seaturtlesoup→seaturtlesoup-domain',
  'leaderboard→homepage',
  'seaturtlesoup→homepage',
  'seaturtlesoup-domain→seaturtlesoup',
  // 登出（任何頁面 → login）
  'homepage→login',
  'leaderboard→login',
  'seaturtlesoup→login',
  'seaturtlesoup-domain→login',
  'knowledgetree→login',
])

function playEnterSound() {
  const enter = new Audio('/audio/enter.mp3')
  enter.volume = 0.7
  enter.play().catch(() => {})
}

function switchMusic(routeName: string) {
  const config = ROUTE_MUSIC[routeName]

  // 未定義的頁面 → 停止音樂
  if (!config) {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
      currentGroup = null
    }
    return
  }

  // 同群組 → 繼續播放，不重頭
  if (config.group === currentGroup && currentAudio) {
    return
  }

  // 不同群組 → 停止舊音樂，建立新音樂
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio.loop = false
    currentAudio = null
    currentGroup = null
  }

  const audio = new Audio(config.src)
  audio.loop = true
  audio.volume = 0.4
  audio.play().catch(() => {
    // 瀏覽器自動播放政策：等待使用者互動後播放
    const resume = () => {
      audio.play().catch(() => {})
      window.removeEventListener('click', resume)
      window.removeEventListener('keydown', resume)
    }
    window.addEventListener('click', resume)
    window.addEventListener('keydown', resume)
  })

  currentAudio = audio
  currentGroup = config.group
}

onMounted(() => {
  if (route.name) switchMusic(route.name as string)
})

watch(() => route.name, (name, prevName) => {
  if (!name) return
  // 檢查是否需要播放 enter.mp3
  if (prevName && ENTER_TRANSITIONS.has(`${String(prevName)}→${String(name)}`)) {
    playEnterSound()
  }
  switchMusic(name as string)
})
// ──────────────────────────────────────────────────────────
</script>