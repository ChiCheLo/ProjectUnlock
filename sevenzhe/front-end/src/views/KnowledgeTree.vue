<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import PathLayout from '../components/quiz/PathLayout.vue'
import QuestionCard from '../components/quiz/QuestionCard.vue'
import QuestionModal from '../components/quiz/QuestionModal.vue'

// 暫時保留 quizData.js 的 subjects 結構作為科目列表
import { subjects as defaultSubjects } from '../data/quizData.js'

interface Question {
  id: number
  level: number
  subject: string
  content: string
  answer: string
  completed: boolean
}

interface Subject {
  id: string
  name: string
  color: string
  progress: {
    completed: number
    total: number
  }
  questions: Question[]
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

const router = useRouter()
const subjects = ref<Subject[]>([])
const currentSubjectIndex = ref(0)
const currentSubject = ref<Subject | null>(null)
const showModal = ref(false)
const selectedQuestion = ref<any>(null)
const resultState = ref('idle') // 'idle', 'correct', 'wrong'
const subjectCards = ref<any[]>([])
const cardScrollIndex = ref(0) // 0=總覽卡，1~N=科目卡

// 視圖模式控制
const viewMode = ref<'detail'>('detail')
const isTransitioning = ref(false)
const isLoading = ref(true) // 載入狀態

// // 所有題目（跨科目）按 level 排序用於 allInOne 模式
// const allQuestions = computed(() => {
//   const all: Question[] = []
//   subjects.value.forEach(subject => {
//     subject.questions.forEach(q => {
//       all.push(q)
//     })
//   })
//   // 按 level 從高到低排序 (level 3 -> 1)
//   return all.sort((a, b) => b.level - a.level)
// })

// // 按 level 分組的題目，用於 allInOne 模式的佈局
// const questionsByLevel = computed(() => {
//   const grouped: { [key: number]: Question[] } = { 3: [], 2: [], 1: [] }
//   allQuestions.value.forEach(q => {
//     if (grouped[q.level]) {
//       grouped[q.level].push(q)
//     }
//   })
//   return grouped
// })

// // 計算卡片在 SVG 中的 X 座標（每層最多 5 個，居中排列）
// const getCardX = (index: number, totalCards: number) => {
//   const maxCards = 5
//   const actualCards = Math.min(totalCards, maxCards)
//   const cardWidth = 120 // 卡片寬度 + 間距
//   const startX = (600 - (actualCards * cardWidth)) / 2 + 60 // 居中
//   return startX + (index % maxCards) * cardWidth
// }

// // 計算卡片在 SVG 中的 Y 座標
// const getCardY = (level: number) => {
//   const levelYMap: { [key: number]: number } = {
//     3: 50,   // Level 3 在頂部
//     2: 200,  // Level 2 在中間
//     1: 350   // Level 1 在底部
//   }
//   return levelYMap[level] || 0
// }

// 根據科目名稱返回對應的漸層色
const getSubjectGradient = (subject: string) => {
  const gradientMap: Record<string, string> = {
    '物理': 'linear-gradient(to right top, #36FAB3, #27D589)',
    '化學': 'linear-gradient(to right top, #058CA1, #3640FA)', // 原色
    '生物': 'linear-gradient(to right top, #D3786C, #FA3636)',
    '地科': 'linear-gradient(to right top, #D3BE6C, #FAD636)',
    '地理': 'linear-gradient(to right top, #D3A06C, #FA8B36)'
  }
  return gradientMap[subject] || gradientMap['化學'] // 預設使用化學的顏色
}

// 載入題目資料
const loadQuestions = async () => {
  try {
    isLoading.value = true
    const subjectsToLoad = [
      { name: '物理', id: 'physics', color: '#10B981' },
      { name: '化學', id: 'chemistry', color: '#10B981' },
      { name: '生物', id: 'biology', color: '#10B981' },
      { name: '地科', id: 'earth-science', color: '#10B981' },
      { name: '地理', id: 'geography', color: '#10B981' }
    ]
    
    const loadedSubjects: Subject[] = []
    
    for (const subjectInfo of subjectsToLoad) {
      const response = await fetch(`/api/quiz-questions/?subject=${subjectInfo.name}`)
      const data = await response.json()
      
      if (data.ok && data.questions.length > 0) {
        loadedSubjects.push({
          id: subjectInfo.id,
          name: subjectInfo.name,
          color: subjectInfo.color,
          progress: {
            completed: 0,
            total: data.questions.length
          },
          questions: data.questions
        })
      }
    }
    
    if (loadedSubjects.length > 0) {
      subjects.value = loadedSubjects
      currentSubject.value = loadedSubjects[0]
    }
  } catch (error) {
    console.error('載入題目失敗:', error)
    // 如果 API 失敗，使用 defaultSubjects
    const fallbackSubjects = defaultSubjects.filter(s => 
      ['物理', '化學', '生物', '地科', '地理'].includes(s.name)
    )
    if (fallbackSubjects.length > 0) {
      subjects.value = fallbackSubjects as any
      currentSubject.value = fallbackSubjects[0] as any
    }
  } finally {
    isLoading.value = false
  }
}

// 輪詢 timer，用於即時同步其他玩家的答題狀態
let exhaustedPollTimer: ReturnType<typeof setInterval> | null = null

// ── 管理員計時器 ──────────────────────────────────────────
const isAdminKT = computed(() => localStorage.getItem('session_id') === '0')
const quizEnabledKT = ref(true)          // 預設 true，避免一進來就被踢
const quizTimerRemaining = ref(0)        // 後端回傳的剩餘秒數
const timerMinutes = ref(10)             // 管理員自訂分鐘數
let modeStatusPollTimer: ReturnType<typeof setInterval> | null = null

const adminTimerDisplay = computed(() => {
  const secs = quizTimerRemaining.value
  if (secs <= 0) return '-- : --'
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m} : ${s}`
})

async function loadKTModeStatus() {
  try {
    const res = await fetch('/api/mode-status/')
    const data = await res.json()
    quizEnabledKT.value = data.quiz_enabled
    quizTimerRemaining.value = data.quiz_timer_remaining ?? 0
    // 非管理員：一旦 quiz 被關閉就強制返回首頁
    if (!isAdminKT.value && !data.quiz_enabled) {
      router.push('/')
    }
  } catch (err) {
    console.warn('loadKTModeStatus failed', err)
  }
}

async function startQuizTimer() {
  try {
    const res = await fetch('/api/mode-control/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: Number(localStorage.getItem('student_id')), action: 'start_timer', minutes: timerMinutes.value })
    })
    const data = await res.json()
    if (!data.ok) console.warn('startQuizTimer error:', data.error)
    await loadKTModeStatus()   // 重新輪詢以取得最新 remaining
  } catch (err) {
    console.warn('startQuizTimer failed', err)
  }
}

async function resetQuizTimer() {
  try {
    const res = await fetch('/api/mode-control/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: Number(localStorage.getItem('student_id')), action: 'reset_timer' })
    })
    const data = await res.json()
    if (!data.ok) console.warn('resetQuizTimer error:', data.error)
    await loadKTModeStatus()
  } catch (err) {
    console.warn('resetQuizTimer failed', err)
  }
}
// ─────────────────────────────────────────────────────────

onMounted(async () => {
  await loadQuestions()
  await loadExhaustedQuestions()
  await loadMyCorrectQuestions()
  scrollToBottom(0)

  // 每 5 秒輪詢一次，同步其他人答題造成的反白變化
  exhaustedPollTimer = setInterval(async () => {
    await loadExhaustedQuestions()
  }, 5000)

  // 每 1 秒輪詢模式狀態（維持倒數秒數即時更新）
  await loadKTModeStatus()
  modeStatusPollTimer = setInterval(loadKTModeStatus, 1000)
})

onUnmounted(() => {
  if (exhaustedPollTimer) {
    clearInterval(exhaustedPollTimer)
    exhaustedPollTimer = null
  }
  if (modeStatusPollTimer) {
    clearInterval(modeStatusPollTimer)
    modeStatusPollTimer = null
  }
})

// 導覽列相關變數
const isNotificationActive = ref(true)
const showNotification = ref(false)
const showSidebar = ref(false)
const sidebarSection = ref<string | null>(null)

const players = ref(['玩家一', '玩家二', '玩家三', '玩家四', '玩家五'])
const groupMembers = ref<any[]>([])
const clues = ref([
 
  '消波塊能夠破壞海浪結構，使其在上岸前便消弭。'
])

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

let lastScrollPosition = 0

// 滾動到科目卡片底部
const scrollToBottom = (index: number) => {
  nextTick(() => {
    const card = subjectCards.value[index] as HTMLElement | undefined
    if (card) {
      card.scrollTop = card.scrollHeight - card.clientHeight
    }
  })
}

const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  // index 0 = 總覽卡，index 1~N = subjects[0]~subjects[N-1]
  const rawIndex = Math.round(container.scrollLeft / container.clientWidth)
  cardScrollIndex.value = rawIndex
  const subjectIndex = rawIndex - 1 // 扣掉總覽卡
  if (subjectIndex >= 0 && subjectIndex < subjects.value.length && subjectIndex !== currentSubjectIndex.value) {
    currentSubjectIndex.value = subjectIndex
    currentSubject.value = subjects.value[subjectIndex]
    scrollToBottom(subjectIndex)
  }
}

// 初次載入時滾動到底部
onMounted(() => {
  scrollToBottom(0)
})

// ─── 答題計時器 ──────────────────────────────────────────
const answerStartTime = ref<number | null>(null)

const openModal = (question: any) => {
  selectedQuestion.value = question
  showModal.value = true
  resultState.value = 'idle'
  answerStartTime.value = Date.now()  // 開始計時
}

const closeModal = () => {
  showModal.value = false
  answerStartTime.value = null  // 取消計時，不儲存紀錄
  setTimeout(() => {
    selectedQuestion.value = null
    resultState.value = 'idle'
  }, 300) // 等待動畫完成
}

// 線索 overlay 相關
const showClueOverlay = ref(false)
const clueUrl = ref<string | null>(null)
const clueId = ref<number | null>(null)
let clueTimer: ReturnType<typeof setTimeout> | null = null

const openClueOverlay = (url: string, id: number) => {
  clueUrl.value = url
  clueId.value = id
  showClueOverlay.value = true
  if (clueTimer) clearTimeout(clueTimer)
  clueTimer = setTimeout(() => {
    showClueOverlay.value = false
  }, 10000) // 10 秒自動關閉
}

const closeClueOverlay = () => {
  showClueOverlay.value = false
  if (clueTimer) clearTimeout(clueTimer)
}

const isSubmitting = ref(false)

const handleSubmit = async (userAnswer: string) => {
  if (!selectedQuestion.value || !currentSubject.value) return
  if (isSubmitting.value) return

  const studentId = localStorage.getItem('student_id')
  if (!studentId) {
    console.warn('找不到 student_id，無法判定答案')
    return
  }

  // 計算作答時間（秒）
  const wasteTime = answerStartTime.value
    ? Math.round((Date.now() - answerStartTime.value) / 1000)
    : 0
  answerStartTime.value = null

  isSubmitting.value = true
  try {
    const resp = await fetch('/api/quiz-answer-check/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: selectedQuestion.value.id,
        user_answer: userAnswer,
        student_id: Number(studentId)
      })
    })
    const data = await resp.json()

    if (!data.ok) {
      console.error('quiz-answer-check 錯誤:', data.error)
      resultState.value = 'wrong'
      // 仍然儲存答錯紀錄
      await saveAnswerRecord(Number(studentId), selectedQuestion.value.id, wasteTime, false, userAnswer)
      return
    }

    if (data.correct) {
      resultState.value = 'correct'
      // 更新完成題數
      if (!selectedQuestion.value.completed) {
        selectedQuestion.value.completed = true
        currentSubject.value.progress.completed++
      }
      // 若有線索，顯示 overlay
      if (data.clue_url) {
        openClueOverlay(data.clue_url, data.clue_id)
      }
    } else {
      resultState.value = 'wrong'
    }

    // 儲存答題紀錄
    await saveAnswerRecord(Number(studentId), selectedQuestion.value.id, wasteTime, data.correct, userAnswer)
    // 答對後重新檢查是否有題目被耗盡
    if (data.correct) {
      await loadExhaustedQuestions()
      await loadMyCorrectQuestions()
    }

  } catch (err) {
    console.error('呼叫 quiz-answer-check 失敗:', err)
    resultState.value = 'wrong'
  } finally {
    isSubmitting.value = false
  }
}

async function saveAnswerRecord(
  studentId: number,
  questionId: number,
  wasteTime: number,
  isCorrect: boolean,
  inputAnswer: string = ''
) {
  const sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    console.warn('找不到 session_id，略過儲存答題紀錄')
    return
  }
  try {
    await fetch('/api/answer-record/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        question_id: questionId,
        answered_wastetime: wasteTime,
        is_correct: isCorrect,
        input_answer: inputAnswer,
        session_id: Number(sessionId)
      })
    })
  } catch (err) {
    console.warn('儲存答題紀錄失敗:', err)
  }
}

// 已被 session 耗盡（答對 >= 3 次）的題目 ID 清單
const exhaustedQuestionIds = ref<number[]>([])

async function loadExhaustedQuestions() {
  const sessionId = localStorage.getItem('session_id')
  if (!sessionId) return
  try {
    const resp = await fetch(`/api/session-exhausted-questions/?session_id=${sessionId}`)
    const data = await resp.json()
    if (data.ok) {
      exhaustedQuestionIds.value = data.exhausted_question_ids
    }
  } catch (err) {
    console.warn('載入 exhausted questions 失敗:', err)
  }
}

// 此學生自己在此 session 答對過的題目 ID
const myCorrectIds = ref<number[]>([])

async function loadMyCorrectQuestions() {
  const studentId = localStorage.getItem('student_id')
  const sessionId = localStorage.getItem('session_id')
  if (!studentId || !sessionId) return
  try {
    const resp = await fetch(`/api/my-correct-questions/?student_id=${studentId}&session_id=${sessionId}`)
    const data = await resp.json()
    if (data.ok) {
      myCorrectIds.value = data.correct_question_ids
    }
  } catch (err) {
    console.warn('載入個人答對紀錄失敗:', err)
  }
}

// 合併：自己答對 OR session 耗盡 → 都禁用
const disabledQuestionIds = computed(() => {
  return [...new Set([...exhaustedQuestionIds.value, ...myCorrectIds.value])]
})

// 總覽卡片資料：3 rows (level 3,2,1) × 5 cols (subjects)
const overviewData = computed(() => {
  return [3, 2, 1].map(level =>
    subjects.value.map(subject => {
      const qs = subject.questions.filter((q: any) => q.level === level)
      const remaining = qs.filter((q: any) => !disabledQuestionIds.value.includes(q.id)).length
      const exhausted = qs.filter((q: any) => exhaustedQuestionIds.value.includes(q.id)).length
      return { subject, level, total: qs.length, remaining, exhausted }
    })
  )
})

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
  /*if (!showSidebar.value) {
    sidebarSection.value = null
    document.body.style.overflow = 'auto'
    window.removeEventListener('scroll', handleSidebarScroll)
  } else {
    lastScrollPosition = window.scrollY
    document.body.style.overflow = 'hidden'
    window.addEventListener('scroll', handleSidebarScroll)
  }*/
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

// 視圖切換函數 - 兩層模式
const switchToDetail = (subjectIndex: number) => {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSubjectIndex.value = subjectIndex
  currentSubject.value = subjects.value[subjectIndex]
  viewMode.value = 'detail'
  setTimeout(() => {
    isTransitioning.value = false
    scrollToBottom(0)
  }, 500)
}

// const switchToAllInOne = () => {
//   if (isTransitioning.value) return
//   isTransitioning.value = true
//   viewMode.value = 'allInOne'
//   setTimeout(() => {
//     isTransitioning.value = false
//   }, 500)
// }

// // allInOne 模式點擊題目處理
// const handleAllInOneQuestionClick = (question: Question) => {
//   // 找到該題目所屬的科目並切換到該科目的 detail 模式
//   const subjectIndex = subjects.value.findIndex(s => s.name === question.subject)
//   if (subjectIndex !== -1) {
//     switchToDetail(subjectIndex)
//   }
// }

// // allInOne 模式 PathLayout 點擊題目處理
// const handleAllInOnePathClick = (question: Question) => {
//   // 找到該題目所屬的科目並切換到該科目的 detail 模式
//   const subjectIndex = subjects.value.findIndex(s => s.name === question.subject)
//   if (subjectIndex !== -1) {
//     switchToDetail(subjectIndex)
//   }
// }

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

<template>
  <div class="quiz-page" :class="{ 'sidebar-open': showSidebar }">
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

    <div class="subject-info" v-if="viewMode === 'detail' && (currentSubject || cardScrollIndex === 0)">
      <div v-if="cardScrollIndex === 0" class="subject-badge" style="background: rgba(255,255,255,0.25)">總覽</div>
      <div v-else class="subject-badge" :style="currentSubject ? { background: getSubjectGradient(currentSubject.name) } : {}">{{ currentSubject?.name }}</div>
      <div class="subject-progress" :style="{ visibility: cardScrollIndex === 0 ? 'hidden' : 'visible' }">請選擇題目挑戰</div>
      <div class="subject-progress" :style="{ visibility: cardScrollIndex === 0 ? 'hidden' : 'visible' }">已完成 {{ currentSubject?.questions.filter((q: any) => disabledQuestionIds.includes(q.id)).length ?? 0 }}/{{ currentSubject?.progress.total ?? 0 }} 題</div>
    </div>

    <!-- 載入中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">載入知識地圖中...</p>
    </div>

    <!-- allInOne 模式：所有科目 PathLayout 並排（暫時停用，準備重新設計） -->
    <!-- <transition name="zoom-fade">
      <div v-if="viewMode === 'allInOne' && subjects.length > 0" class="all-in-one-container">
        <div class="all-in-one-paths-wrapper">
          <div
            v-for="(subject, index) in subjects"
            :key="subject.id"
            class="all-in-one-subject-path"
          >
            <PathLayout
              :subject-id="subject.id"
              :questions="subject.questions"
              :hide-svg="true"
              :compact="true"
              @question-click="handleAllInOnePathClick"
            >
              <template #question="{ question }">
                <QuestionCard :question="(question as any)" :compact="true" />
              </template>
            </PathLayout>
          </div>
        </div>
      </div>
    </transition> -->

    <!-- detail 模式：詳細檢視（原本的 cards-wrapper） -->
    <transition name="zoom-fade">
      <div v-if="viewMode === 'detail' && subjects.length > 0" class="cards-wrapper" @scroll="handleScroll">

        <!-- 總覽卡片（第一張，無 subject-badge） -->
        <div class="subject-card overview-card">
          <div class="overview-grid-container">
            <!-- SVG 虛線：同科目連線 -->
            <svg
              class="overview-lines-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- 5 條垂直虛線，x 對齊各欄中心 10/30/50/70/90；y 從第一列到第三列中心 -->
              <line
                v-for="(subject, i) in subjects"
                :key="subject.id"
                :x1="10 + i * 20"
                y1="16.67"
                :x2="10 + i * 20"
                y2="83.33"
                stroke="rgba(130,130,130,0.5)"
                stroke-width="0.6"
                stroke-dasharray="2.5 1.5"
                stroke-linecap="round"
              />
            </svg>

            <!-- 3 rows × 5 cols grid -->
            <div class="overview-grid">
              <template v-for="row in overviewData" :key="row[0]?.level">
                <div
                  v-for="cell in row"
                  :key="`${cell.level}-${cell.subject.id}`"
                  class="overview-mini-card"
                  :style="{ background: getSubjectGradient(cell.subject.name) }"
                >
                  <div class="overview-mini-stars">
                    <span v-for="n in 3" :key="n" class="overview-star">{{ n <= cell.level ? '★' : '☆' }}</span>
                  </div>
                  <div class="overview-mini-subject">{{ cell.subject.name }}</div>
                  <div class="overview-mini-count">{{ cell.exhausted }} / {{ cell.total }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 各科目詳細卡片 -->
        <div
          v-for="(subject, index) in subjects"
          :key="subject.id"
          :ref="el => { if (el) subjectCards[index] = el }"
          class="subject-card"
        >
          <PathLayout
            :subject-id="subject.id"
            :questions="subject.questions"
            :exhausted-ids="disabledQuestionIds"
            @question-click="openModal"
          >
            <template #question="{ question, exhausted }">
              <QuestionCard :question="(question as any)" :exhausted="exhausted" />
            </template>
          </PathLayout>
        </div>
      </div>
    </transition>

    <!-- 線索 Overlay -->
    <transition name="fade">
      <div v-if="showClueOverlay" class="clue-overlay" @click="closeClueOverlay">
        <div class="clue-overlay-inner" @click.stop>
          <div class="clue-overlay-header">
            <span class="clue-overlay-title">🎉 答對了！獲得新線索</span>
            <button class="clue-overlay-close" @click="closeClueOverlay">✕</button>
          </div>
          <img v-if="clueUrl" :src="clueUrl" class="clue-overlay-img" alt="線索圖片" />
          <p class="clue-overlay-hint">點擊任意處或等待 10 秒後關閉</p>
        </div>
      </div>
    </transition>

    <!-- 模態框 -->
    <QuestionModal
      v-if="selectedQuestion"
      :question="selectedQuestion"
      :show="showModal"
      :result-state="resultState"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- 管理員計時器面板 -->
    <div v-if="isAdminKT" class="admin-timer-panel">
      <div class="admin-timer-title">⏱ 管理員計時器</div>
      <div class="admin-timer-display">{{ adminTimerDisplay }}</div>
      <div class="admin-timer-input-row">
        <label class="admin-timer-label">時間（分鐘）</label>
        <input
          v-model.number="timerMinutes"
          type="number"
          min="1"
          max="120"
          class="admin-timer-input"
        />
      </div>
      <div class="admin-timer-actions">
        <button class="admin-timer-btn start" @click="startQuizTimer">▶ 開始</button>
        <button class="admin-timer-btn reset" @click="resetQuizTimer">■ 停止</button>
      </div>
      <div class="admin-timer-status">
        測驗狀態：<span :class="quizEnabledKT ? 'status-on' : 'status-off'">{{ quizEnabledKT ? '開放中' : '已關閉' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 線索 Overlay */
.clue-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.clue-overlay-inner {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.clue-overlay-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clue-overlay-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.clue-overlay-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.clue-overlay-img {
  max-width: 100%;
  max-height: 320px;
  border-radius: 10px;
  object-fit: contain;
}

.clue-overlay-hint {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

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

.quiz-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.subject-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  color: white;
}

.subject-info--hidden {
  visibility: hidden;
}

.subject-badge {
  color: white;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
}

.subject-progress {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.3;
}

/* 載入中樣式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: #3640FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
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

.cards-wrapper {
  flex: 1;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  gap: 20px;
  padding: 0 20px 40px;
}

.cards-wrapper::-webkit-scrollbar {
  display: none;
}

.subject-card {
  flex: 0 0 calc(100% - 40px);
  scroll-snap-align: center;
  background: white;
  border-radius: 20px;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 230px);
  scrollbar-width: thin; /* Firefox 細捲軸 */
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.subject-card::-webkit-scrollbar {
  width: 6px;
}

.subject-card::-webkit-scrollbar-track {
  background: transparent;
}

.subject-card::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

/* ─── 總覽卡片 ─── */
.overview-card {
  overflow: auto !important;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.overview-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
}

.overview-lines-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: clamp(8px, 1.5vw, 20px);
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  align-items: center;
  justify-items: center;
}

.overview-mini-card {
  width: 100%;
  height: 100%;
  border-radius: clamp(8px, 1vw, 12px);
  padding: clamp(6px, 1vw, 14px);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(3px, 0.5vw, 8px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.overview-mini-stars {
  display: flex;
  gap: 2px;
  font-size: clamp(10px, 1.2vw, 15px);
}

.overview-star {
  opacity: 0.85;
}

.overview-mini-subject {
  font-size: clamp(13px, 1.8vw, 22px);
  font-weight: 700;
}

.overview-mini-count {
  font-size: clamp(10px, 1.2vw, 14px);
  opacity: 0.9;
  letter-spacing: 0.5px;
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

/* ======= 三層視圖模式樣式 ======= */

/* 縮放淡入淡出過渡動畫 */
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.zoom-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.zoom-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* allInOne 模式：所有科目 PathLayout 並排（暫時停用，準備重新設計） */
/* .all-in-one-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 8px 4px 8px;
}

.all-in-one-paths-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 0;
}

.all-in-one-subject-path {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
} */

/* ── 管理員計時器面板 ──────────────────────────────────── */
.admin-timer-panel {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  background: rgba(20, 20, 40, 0.92);
  border: 1px solid rgba(150, 100, 255, 0.5);
  border-radius: 16px;
  padding: 18px 22px;
  min-width: 220px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.admin-timer-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgba(180, 150, 255, 0.9);
  margin-bottom: 8px;
}

.admin-timer-display {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-align: center;
  font-variant-numeric: tabular-nums;
  margin-bottom: 12px;
  color: #e0d4ff;
}

.admin-timer-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.admin-timer-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.admin-timer-label {
  font-size: 12px;
  color: rgba(200, 200, 220, 0.8);
  white-space: nowrap;
}

.admin-timer-input {
  width: 64px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(150, 100, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  outline: none;
}

.admin-timer-input:focus {
  border-color: rgba(180, 130, 255, 0.8);
  background: rgba(255, 255, 255, 0.12);
}

.admin-timer-btn {
  flex: 1;
  padding: 7px 0;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s;
}

.admin-timer-btn.start {
  background: linear-gradient(135deg, #7c4dff, #b040fb);
  color: white;
}

.admin-timer-btn.reset {
  background: rgba(255, 255, 255, 0.12);
  color: #ccc;
}

.admin-timer-btn:hover {
  filter: brightness(1.2);
}

.admin-timer-status {
  font-size: 12px;
  color: rgba(200, 200, 220, 0.7);
  text-align: center;
}

.status-on  { color: #6eff9e; font-weight: 700; }
.status-off { color: #ff6e6e; font-weight: 700; }
/* ──────────────────────────────────────────────────────── */


</style>
```
