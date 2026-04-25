<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "../components/Header.vue";
import Sidebar from "../components/Sidebar.vue";
import { callOpenAIChat } from "../api/index.js";
import { sendLog } from "../api/webLog";

type BuildingCard = {
  id: number
  title: string
  description: string
  image: string
  effects: { type: string; value: string; icon?: string }[]
}

const route = useRoute();
const router = useRouter();

/* ---------------------------------------------
   動態背景：依照 domain 切換
--------------------------------------------- */
const domainBackgrounds: Record<string, string> = {
  火域: "/海龜湯各域圖/火域.png",
  風域: "/海龜湯各域圖/風域.png",
  土域: "/海龜湯各域圖/土域.png",
  光域: "/海龜湯各域圖/光域.png",
  雷域: "/海龜湯各域圖/雷域.png",
  木域: "/海龜湯各域圖/木域.png",
  金域: "/海龜湯各域圖/金域.png",
  水域: "/海龜湯各域圖/水域.png",
  空域: "/海龜湯各域圖/空域.png"
};

const bgUrl = computed(() => {
  const name = route.params.domain as string;
  return domainBackgrounds[name] || "/chat-bg.svg";
});

/* 背景套用（跟你原本寫法一致） */
const pageStyle = computed(() => ({
  background: `url(${bgUrl.value}) no-repeat center center`,
  backgroundSize: "cover"
}));

/* ---------------------------------------------
   Header / Sidebar 基本邏輯
--------------------------------------------- */
const showSidebar = ref(false);
const sidebarSection = ref<string | null>(null);
const players = ref(["玩家一", "玩家二", "玩家三"]);
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

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}
function closeSidebar() {
  showSidebar.value = false;
}
function setSidebarSection(s: string | null) {
  sidebarSection.value = s;
}

/* ---------------------------------------------
   Each domain story（從後端 soup_table 讀取）
--------------------------------------------- */
const domainName = route.params.domain as string;

const storyText = ref("載入中…");

// 從後端取得湯面
const loadDomainStory = async () => {
  try {
    const res = await fetch(`/api/domain-story/?domain=${encodeURIComponent(domainName)}`);
    const data = await res.json();
    if (data.ok) {
      storyText.value = data.soup_content;
    } else {
      storyText.value = "尚無故事資料";
    }
  } catch {
    storyText.value = "無法載入故事資料";
  }
};
/* ---------------------------------------------
   Chat system
--------------------------------------------- */
interface Message {
  sender: "player" | "ai";
  text: string;
  isReveal?: boolean;
}

const messages = ref<Message[]>([
  { sender: "ai", text: "你好！我可以協助你分析這個謎題，有什麼想問的嗎？" }
]);

const userInput = ref("");

/* ---------------------------------------------
   追蹤是否已答對
--------------------------------------------- */
const hasRevealed = ref(false);

// 各域 AI 詢問的問題
const domainDecisionQuestion: Record<string, string> = {
  火域: '是否建設火力發電廠？',
  土域: '是否處理堰塞湖？',
  金域: '是否開放使用汞煉金？',
  光域: '是否推行夜間觀光？',
  水域: '是否限制捕魚方式？',
  雷域: '是否建設核能發電廠？',
  木域: '是否砍伐闊葉林改為種植經濟作物？',
  風域: '是否建設風力發電機？',
  空域: '疫情過後是否大力推行觀光？',
};

// 域 + 是/否 → policy_id（null 代表不寫入）
const domainPolicyMap: Record<string, { yes: number | null; no: number | null }> = {
  火域: { yes: null, no: 1 },
  土域: { yes: null, no: 5 },
  金域: { yes: null, no: 7 },
  光域: { yes: null, no: 10 },
  水域: { yes: 12,   no: null },
  雷域: { yes: null, no: 15 },
  木域: { yes: null, no: 19 },
  風域: { yes: null, no: 20 },
  空域: { yes: null, no: 24 },
};

// 等待玩家回答是/否的狀態
const waitingForDecision = ref(false);

// 政策卡展示
const showPolicyCard = ref(false);
const displayPolicyTitle = ref('');
const displayPolicyImage = ref('');
let policyCardTimer: ReturnType<typeof setTimeout> | null = null;

// policy_id → { title, image }
const policyCardData: Record<number, { title: string; image: string }> = {
  1:  { title: '不建設火力發電廠',        image: '/policyCards/火域/不建設.png' },
  2:  { title: '海邊建立火力發電廠',      image: '/policyCards/火域/海邊.png' },
  3:  { title: '河邊建立火力發電廠',      image: '/policyCards/火域/河邊.png' },
  4:  { title: '無水源區域建立火力發電廠', image: '/policyCards/火域/無水.png' },
  5:  { title: '堰塞湖開發為觀光區',      image: '/policyCards/土域/觀光.png' },
  6:  { title: '處理堰塞湖',              image: '/policyCards/土域/處理.png' },
  7:  { title: '不得使用汞提煉金',        image: '/policyCards/金域/不可.png' },
  8:  { title: '上游使用汞提煉金',        image: '/policyCards/金域/上游.png' },
  9:  { title: '下游使用汞提煉金',        image: '/policyCards/金域/下游.png' },
  10: { title: '不推行夜間觀光',          image: '/policyCards/光域/不可.png' },
  11: { title: '推行夜間觀光',            image: '/policyCards/光域/可.png' },
  12: { title: '限制捕魚方式',            image: '/policyCards/水域/限制.png' },
  13: { title: '不限制捕魚方式，非爭議海域', image: '/policyCards/水域/一般海域.png' },
  14: { title: '不限制捕魚方式，爭議海域',  image: '/policyCards/水域/爭議海域.png' },
  15: { title: '不建設核能發電廠',        image: '/policyCards/雷域/不建設.png' },
  16: { title: '於海邊建立核能發電廠',    image: '/policyCards/雷域/海邊.png' },
  17: { title: '不靠海之內陸建立核能發電廠', image: '/policyCards/雷域/內陸.png' },
  19: { title: '不砍伐闊葉林換取經濟',   image: '/policyCards/木域/不種植.png' },
  18: { title: '砍伐闊葉林改為種植經濟作物', image: '/policyCards/木域/種植.png' },
  20: { title: '不建設風力發電機',        image: '/policyCards/風域/不建設.png' },
  21: { title: '外海建立離岸風力發電機',  image: '/policyCards/風域/外海.png' },
  22: { title: '出海口建立風力發電機',    image: '/policyCards/風域/出海口.png' },
  23: { title: '河邊建立風力發電機',      image: '/policyCards/風域/河邊.png' },
  24: { title: '不大力推行觀光',          image: '/policyCards/空域/不推行.png' },
  25: { title: '大力推行觀光',            image: '/policyCards/空域/推行.png' },
};

function closePolicyCardAndNavigate() {
  if (policyCardTimer) clearTimeout(policyCardTimer);
  showPolicyCard.value = false;
  sessionStorage.setItem('reloadOnReturn', '1');
  router.push({ path: '/sea-turtle-soup' });
}

function showPolicyCardOverlay(policyId: number | null) {
  if (policyId !== null && policyId !== undefined && policyCardData[policyId]) {
    displayPolicyTitle.value = policyCardData[policyId].title;
    displayPolicyImage.value = policyCardData[policyId].image;
    showPolicyCard.value = true;
    policyCardTimer = setTimeout(() => closePolicyCardAndNavigate(), 5000);
  } else {
    sessionStorage.setItem('reloadOnReturn', '1');
    router.push({ path: '/sea-turtle-soup' });
  }
}

/* ---------------------------------------------
   地圖放置 Overlay（火域選「是」）
--------------------------------------------- */
// 14x14 虛擬座標 → CSS 百分比（原點左上角，y 向下為正取絕對值）
function mapCoordToPercent(x: number, y: number) {
  return { left: `${(x / 14) * 100}%`, top: `${(Math.abs(y) / 14) * 100}%` };
}

const showMapOverlay = ref(false);

// 各域的地圖放置設定（之後可擴充其他域）
type MapPlacement = {
  image: string;
  positions: { x: number; y: number; policyId: number }[];
};
const domainMapPlacement: Record<string, MapPlacement> = {
  火域: {
    image: '/地圖放置區/海邊火力發電廠放置區.png',
    positions: [
      { x: 3, y: -3, policyId: 2 },
      { x: 5, y: -4, policyId: 3 },
      { x: 5.5, y: -6, policyId: 4 },
    ],
  },
  土域: {
    image: '/地圖放置區/堰塞湖土壩放置區.png',
    positions: [
      { x: 13, y: -4, policyId: 6 },
    ],
  },
  金域: {
    image: '/地圖放置區/金塊放置區.png',
    positions: [
      { x: 12, y: -4, policyId: 8 },
      { x: 13, y: -6, policyId: 9 },
    ],
  },
  光域: {
    image: '/地圖放置區/光害放置區.png',
    positions: [
      { x: 11.5, y: -9, policyId: 11 },
    ],
  },
  水域: {
    image: '/地圖放置區/漁網放置區.png',
    positions: [
      { x: 8,  y: -11, policyId: 13 },
      { x: 9,  y: -13, policyId: 14 },
    ],
  },
  雷域: {
    image: '/地圖放置區/核能放置區.png',
    positions: [
      { x: 1,   y: -11, policyId: 16 },
      { x: 5.5, y: -8,  policyId: 17 },
    ],
  },
  木域: {
    image: '/地圖放置區/木材放置區.png',
    positions: [
      { x: 4, y: -7, policyId: 18 },
    ],
  },
  風域: {
    image: '/地圖放置區/風力放置區.png',
    positions: [
      { x: 2,   y: -4.5, policyId: 22 },
      { x: 8.5, y: -1,   policyId: 21 },
      { x: 8,   y: -4.5, policyId: 23 },
    ],
  },
  空域: {
    image: '/地圖放置區/觀光公害放置區.png',
    positions: [
      { x: 11, y: -6, policyId: 25 },
    ],
  },
};

// 各域地圖觸發條件：'yes' = 選是才顯示，'no' = 選否才顯示
const domainMapTrigger: Record<string, 'yes' | 'no'> = {
  火域: 'yes',
  土域: 'yes',
  金域: 'yes',
  光域: 'yes',
  水域: 'no',
  雷域: 'yes',
  木域: 'yes',
  風域: 'yes',
  空域: 'yes',
};

async function selectMapPosition(policyId: number) {
  // 寫入選擇的 policy
  await saveGroupPolicy(policyId);
  showMapOverlay.value = false;
  setTimeout(() => showPolicyCardOverlay(policyId), 300);
}

function tryShowMapOverlay(isYes: boolean, policyId: number | null) {
  const placement = domainMapPlacement[domainName];
  const trigger = domainMapTrigger[domainName];
  const shouldShow = placement && (
    (trigger === 'yes' && isYes) ||
    (trigger === 'no'  && !isYes)
  );
  if (shouldShow) {
    showMapOverlay.value = true;
    // 不自動關閉，玩家必須點擊位置選擇
  } else {
    showPolicyCardOverlay(policyId);
  }
}

// ── 海龜湯模式狀態輪詢（被關閉時強制回首頁）──────────────────
let turtleModeTimerCR: ReturnType<typeof setInterval> | null = null

async function checkTurtleEnabledCR() {
  if (localStorage.getItem('session_id') === '0') return  // 管理員不踢
  try {
    const res = await fetch('/api/mode-status/')
    const data = await res.json()
    if (data.ok && !data.turtle_enabled) {
      router.push('/')
    }
  } catch { /* 忽略網路錯誤 */ }
}
// ─────────────────────────────────────────────────────────────

onMounted(() => {
  loadDomainStory();
  loadAndShowEntryClues();

  // 每 3 秒輪詢海龜湯模式狀態
  checkTurtleEnabledCR();
  turtleModeTimerCR = setInterval(checkTurtleEnabledCR, 3000);
});

onBeforeUnmount(() => {
  if (turtleModeTimerCR) {
    clearInterval(turtleModeTimerCR);
    turtleModeTimerCR = null;
  }
});

// 進入域線索 overlay
const showEntryClueOverlay = ref(false);
const entryClueImages = ref<{ clue_id: number; clue_url: string }[]>([]);
let entryClueTimer: ReturnType<typeof setTimeout> | null = null;

function closeEntryClueOverlay() {
  if (entryClueTimer) clearTimeout(entryClueTimer);
  showEntryClueOverlay.value = false;
}

// 組別線索：按鈕 → 取得同組所有學生的線索（去重、正規化） → 顯示 modal
const groupClues = ref<{ clue_id?: number; clue_url: string }[]>([]);
const isLoadingGroupClues = ref(false);
const showGroupCluesModal = ref(false);
const zoomImage = ref<string | null>(null);

function openZoom(url: string) {
  zoomImage.value = url;
}

async function fetchGroupClues() {
  const groupId = localStorage.getItem('group_id') || localStorage.getItem('student_id');
  if (!groupId) return;
  isLoadingGroupClues.value = true;
  try {
    const membersRes = await fetch(`/api/group-members/?group_id=${encodeURIComponent(groupId)}`);
    const membersData = await membersRes.json();
    if (!membersData.ok) {
      groupClues.value = [];
      showGroupCluesModal.value = true;
      isLoadingGroupClues.value = false;
      return;
    }

    const members: { student_id: number }[] = membersData.data || [];
    // 針對每個成員平行抓取其線索
    const fetches = members.map(m => fetch(`/api/student-clues/?student_id=${m.student_id}`)
      .then(r => r.json())
      .catch(() => ({ ok: false, data: [] })));

    const results = await Promise.all(fetches);
    const seen = new Set<string>();
    const collected: { clue_id?: number; clue_url: string }[] = [];

    for (const res of results) {
      if (!res.ok || !res.data) continue;
      for (const item of res.data) {
        const rawUrl = item.clue_url || item.clue || '';
        const url = normalizeClueUrl(rawUrl || '');
        if (!url) continue;
        if (seen.has(url)) continue;
        seen.add(url);
        collected.push({ clue_id: item.clue_id, clue_url: url });
      }
    }

    groupClues.value = collected;
    showGroupCluesModal.value = true;
  } catch (err) {
    console.error('fetchGroupClues failed:', err);
    groupClues.value = [];
    showGroupCluesModal.value = true;
  } finally {
    isLoadingGroupClues.value = false;
  }
}

function normalizeClueUrl(url: string): string {
  if (url.includes('public/clues/')) return url.replace('public/clues/', '/clues/');
  if (url.startsWith('public/')) return url.replace('public/', '/');
  if (url.includes('assets/clues/')) return url.replace('assets/clues/', '/clues/');
  if (url.startsWith('assets/')) return url.replace('assets/', '/clues/');
  return url;
}

async function loadAndShowEntryClues() {
  const studentId = localStorage.getItem('student_id');
  if (!studentId) return;
  try {
    const res = await fetch('/api/grant-domain-entry-clues/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: Number(studentId), domain: domainName }),
    });
    const data = await res.json();
    if (data.ok && data.clues && data.clues.length > 0) {
      entryClueImages.value = data.clues.map((c: { clue_id: number; clue_url: string }) => ({
        ...c,
        clue_url: normalizeClueUrl(c.clue_url),
      }));
      showEntryClueOverlay.value = true;
      entryClueTimer = setTimeout(() => closeEntryClueOverlay(), 5000);
    }
  } catch (err) {
    console.error('loadAndShowEntryClues failed:', err);
  }
}

async function saveGroupPolicy(policyId: number) {
  const groupId = localStorage.getItem('group_id');
  if (!groupId) {
    console.warn('No group_id in localStorage');
    return;
  }
  try {
    await fetch('/api/save-group-policy/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: Number(groupId), policy_id: policyId }),
    });
    const policyTitle = policyCardData[policyId]?.title ?? `policy_id=${policyId}`;
    sendLog(`海龜湯【${domainName}】選擇政策：${policyTitle}`);
  } catch (err) {
    console.error('save_group_policy failed:', err);
  }
}

async function saveChat(type: 0 | 1, chat: string) {
  const studentId = localStorage.getItem('student_id');
  if (!studentId) return;
  try {
    await fetch('/api/save-chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        chat,
        student_id: Number(studentId),
        domain: domainName,
      }),
    });
  } catch (err) {
    console.error('save_chat failed:', err);
  }
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // 如果正在等待決策，偵測「是」/「否」
  if (waitingForDecision.value) {
    messages.value.push({ sender: 'player', text });
    userInput.value = '';

    const answer = text.trim();
    const isYes = answer === '是' || answer === 'yes' || answer === 'YES';
    const isNo  = answer === '否' || answer === 'no'  || answer === 'NO';

    if (!isYes && !isNo) {
      messages.value.push({ sender: 'ai', text: '請回答「是」或「否」。' });
      return;
    }

    waitingForDecision.value = false;
    const policyEntry = domainPolicyMap[domainName];
    const policyId = isYes ? policyEntry?.yes : policyEntry?.no;

    if (policyId !== null && policyId !== undefined) {
      await saveGroupPolicy(policyId);
      const aiDecisionText = `好的，已記錄您的決策！`;
      messages.value.push({ sender: 'ai', text: aiDecisionText, isReveal: true });
      saveChat(1, text);
      saveChat(0, aiDecisionText);
    } else {
      const aiDecisionText = `好的，已記錄您的決策！`;
      messages.value.push({ sender: 'ai', text: aiDecisionText, isReveal: true });
      saveChat(1, text);
      saveChat(0, aiDecisionText);
    }

    // 展示地圖（若有）→ 再展示政策卡後導回
    setTimeout(() => tryShowMapOverlay(isYes, policyId ?? null), 800);
    return;
  }

  // 加入玩家訊息
  messages.value.push({ sender: "player", text });
  userInput.value = "";
  saveChat(1, text);

  // 顯示暫時 loading 回覆（可視化）
  messages.value.push({ sender: "ai", text: "思考中…" });

  try {
    // 呼叫後端 API（只需傳 domain，後端自動查詢湯面/湯底）
    const response = await callOpenAIChat(text, domainName);
    
    const data = response.data;

    // 取代剛剛的 loading 訊息為真實回應
    const aiReplyText = data.ok ? (data.text || "（無回應）") : "伺服器回應錯誤";
    const lastIndex = messages.value.length - 1;
    if (messages.value[lastIndex].sender === "ai" && messages.value[lastIndex].text === "思考中…") {
      messages.value[lastIndex].text = aiReplyText;
      if (data.reveal_truth) {
        messages.value[lastIndex].isReveal = true;
      }
    } else {
      messages.value.push({
        sender: "ai",
        text: aiReplyText,
        isReveal: data.reveal_truth
      });
    }
    saveChat(0, aiReplyText);

    // 如果答對，顯示湯底並標記已揭曉
    if (data.ok && data.reveal_truth && data.truth) {
      hasRevealed.value = true;
      sendLog(`海龜湯【${domainName}】答對，湯底揭曉`);
      const truthText = `【湯底揭曉】\n${data.truth}`;
      messages.value.push({
        sender: "ai",
        text: truthText,
        isReveal: true
      });
      saveChat(0, truthText);
      // AI 在聊天室發出對應域的決策問題
      const question = domainDecisionQuestion[domainName];
      if (question) {
        setTimeout(() => {
          const decisionText = `【國家決策】${question}\n請輸入「是」或「否」。`;
          messages.value.push({ sender: 'ai', text: decisionText });
          saveChat(0, decisionText);
          waitingForDecision.value = true;
        }, 600);
      }
    }
  } catch (err) {
    console.error("call openai proxy failed:", err);
    // 替換 loading 或新增錯誤訊息
    const lastIndex = messages.value.length - 1;
    if (messages.value[lastIndex].sender === "ai" && messages.value[lastIndex].text === "思考中…") {
      messages.value[lastIndex].text = "呼叫失敗，請稍後再試";
    } else {
      messages.value.push({ sender: "ai", text: "呼叫失敗，請稍後再試" });
    }
  }
}


/* 返回 */
function goBack() {
  router.push({ path: '/sea-turtle-soup' });
}
</script>
<template>
  <div class="page" :style="pageStyle">

    <!-- 全站 Header -->
    <Header @toggle-sidebar="toggleSidebar" />

    <!-- 回上一頁 -->
    <header class="top-bar">
      <button class="back-btn" @click="goBack">← 返回</button>
      <span class="title">{{ domainName }}｜海龜湯</span>
    </header>

    <!-- 故事卡片 -->
    <div class="story-card">
      <p class="story-text">
        {{ storyText }}
      </p>
    </div>

    <!-- 聊天內容 -->
    <div class="chat-container">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="chat-row"
        :class="msg.sender"
      >
        <div class="chat-bubble" :class="{ 'reveal-bubble': msg.isReveal }">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- 聊天輸入 -->
    <div class="chat-input-bar">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        :placeholder="waitingForDecision ? '請輸入「是」或「否」…' : '輸入你的推理或提問…'"
      />
      <button @click="sendMessage">送出</button>
    </div>

    <!-- Sidebar -->
    <Sidebar
      :showSidebar="showSidebar"
      @toggle-sidebar="closeSidebar"
    />

    <!-- 地圖放置 Overlay（火域選「是」） -->
    <div v-if="showMapOverlay" class="map-overlay">
      <div class="map-overlay-box">
        <p class="map-overlay-label">請選擇建設位置</p>
        <div class="map-container">
          <img class="map-bg" src="/安洛克地圖.png" alt="安洛克地圖" />
          <button
            v-for="(pos, i) in domainMapPlacement[domainName]?.positions"
            :key="i"
            class="map-placement-btn"
            :style="mapCoordToPercent(pos.x, pos.y)"
            @click="selectMapPosition(pos.policyId)"
          >
            <img
              class="map-placement"
              :src="domainMapPlacement[domainName].image"
              :alt="`位置${i+1}`"
            />
          </button>
        </div>
        <p class="map-overlay-hint">點擊地圖上的位置圖示以選擇建設地點</p>
      </div>
    </div>

    <!-- 政策卡展示 Overlay -->
    <div v-if="showPolicyCard" class="policy-card-overlay" @click.self="closePolicyCardAndNavigate">
      <div class="policy-card-box">
        <button class="policy-card-close" @click="closePolicyCardAndNavigate">✕</button>
        <p class="policy-card-label">獲得政策卡</p>
        <h2 class="policy-card-title">{{ displayPolicyTitle }}</h2>
        <img class="policy-card-img" :src="displayPolicyImage" :alt="displayPolicyTitle" />
        <p class="policy-card-hint">5 秒後自動關閉，或點擊旁邊關閉</p>
      </div>
    </div>

    <!-- 進入域線索 Overlay -->
    <div v-if="showEntryClueOverlay" class="entry-clue-overlay" @click.self="closeEntryClueOverlay">
      <div class="entry-clue-box">
        <button class="entry-clue-close" @click="closeEntryClueOverlay">✕</button>
        <p class="entry-clue-label">🔍 獲得線索</p>
        <div class="entry-clue-images">
          <img
            v-for="item in entryClueImages"
            :key="item.clue_id"
            class="entry-clue-img"
            :src="item.clue_url"
            :alt="`線索${item.clue_id}`"
          />
        </div>
        <p class="entry-clue-hint">5 秒後自動關閉，或點擊旁邊關閉</p>
      </div>
    </div>

    <!-- 組別線索固定按鈕 -->
    <button class="group-clues-btn" @click="fetchGroupClues">組別線索</button>

    <!-- 組別線索 Overlay（背景點擊可關閉） -->
    <div v-if="showGroupCluesModal" class="clues-modal-overlay" @click.self="showGroupCluesModal = false">
      <div class="clues-modal-inner">
        <p class="clues-modal-title">組別線索</p>
        <div v-if="isLoadingGroupClues" class="clues-loading">載入中…</div>
        <div v-else>
          <div v-if="groupClues.length === 0" class="no-clues">本組目前沒有線索</div>
          <div v-else class="image-clues">
            <div v-for="(c, i) in groupClues" :key="i" class="clue-image" @click.stop="openZoom(c.clue_url)">
              <img :src="c.clue_url" :alt="`線索${c.clue_id ?? i}`" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 縮放 Overlay -->
    <div v-if="zoomImage" class="zoom-overlay" @click.self="zoomImage = null">
      <div class="zoom-box">
        <img class="zoom-img" :src="zoomImage" alt="zoom" />
      </div>
    </div>

  </div>
</template>



<style scoped>
/* ---------------------------------------------
   PAGE（背景依照 pageStyle 動態套用）
--------------------------------------------- */
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ---------------------------------------------
   Header 區
--------------------------------------------- */
.top-bar {
  padding: 20px;
  display: flex;
  align-items: center;
}

.back-btn {
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
}

/* ---------------------------------------------
   故事卡片
--------------------------------------------- */
.story-card {
  margin: 10px 20px;
  padding: 20px;
  background: rgba(255, 250, 245, 0.95);
  border-radius: 20px;
  font-size: 16px;
  line-height: 1.6;
}

.story-text {
  margin: 0;
  color: #4b3e2f;
}

/* ---------------------------------------------
   聊天區
--------------------------------------------- */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-row {
  display: flex;
  width: 100%;
}

.chat-row.player {
  justify-content: flex-end;
}

.chat-row.ai {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.4;
}

.chat-row.player .chat-bubble {
  background: #647dff;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-row.ai .chat-bubble {
  background: #ffffff;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.chat-bubble.reveal-bubble {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #5c4813;
  border: 2px solid #f5c518;
  font-weight: 500;
  white-space: pre-line;
}

/* ---------------------------------------------
   底部輸入框（等待決策時顯示提示）
--------------------------------------------- */
.chat-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  gap: 10px;
  border-top: 1px solid #ddd;
}

.chat-input-bar input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 20px;
  border: 1px solid #bbb;
  font-size: 14px;
}

.chat-input-bar button {
  background: #ff914d;
  border: none;
  padding: 0 20px;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

/* ---------------------------------------------
   決策 Modal
--------------------------------------------- */
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

/* ---------------------------------------------
   地圖放置 Overlay
--------------------------------------------- */
.map-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1900;
}

.map-overlay-box {
  position: relative;
  background: #1a1a2e;
  border-radius: 20px;
  padding: 24px 20px 16px;
  max-width: 520px;
  width: 92%;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
  animation: pop-in 0.3s ease;
}

.map-overlay-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #aaa;
  line-height: 1;
}

.map-overlay-label {
  font-size: 14px;
  color: #ccc;
  margin: 0 0 12px;
  letter-spacing: 0.5px;
}

.map-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
}

.map-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.map-placement-btn {
  position: absolute;
  transform: translate(-50%, -50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 9.6%;
  transition: transform 0.2s;
}

.map-placement-btn:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.map-placement {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 0 6px rgba(255, 100, 50, 0.9));
  animation: pulse-glow 1.4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(255, 100, 50, 0.9)); }
  50%       { filter: drop-shadow(0 0 14px rgba(255, 160, 50, 1)); }
}

.map-overlay-hint {
  font-size: 12px;
  color: #888;
  margin: 10px 0 0;
}

/* ---------------------------------------------
   政策卡展示 Overlay
--------------------------------------------- */
.policy-card-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.policy-card-box {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 32px 28px 24px;
  max-width: 360px;
  width: 88%;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  animation: pop-in 0.3s ease;
}

@keyframes pop-in {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.policy-card-close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
  line-height: 1;
}

.policy-card-label {
  font-size: 13px;
  color: #888;
  margin: 0 0 6px;
  letter-spacing: 0.5px;
}

.policy-card-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
}

.policy-card-img {
  width: 100%;
  border-radius: 12px;
  object-fit: contain;
  max-height: 300px;
}

.policy-card-hint {
  font-size: 12px;
  color: #aaa;
  margin: 12px 0 0;
}

/* 進入域線索 Overlay */
.entry-clue-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
}

.entry-clue-box {
  position: relative;
  background: #1c2340;
  border-radius: 20px;
  padding: 28px 24px 20px;
  max-width: 720px;
  width: 95%;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  animation: pop-in 0.3s ease;
}

.entry-clue-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #aaa;
  line-height: 1;
}

.entry-clue-label {
  font-size: 16px;
  font-weight: 700;
  color: #f0d080;
  margin: 0 0 14px;
  letter-spacing: 0.5px;
}

.entry-clue-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.entry-clue-img {
  width: calc(50% - 6px);
  max-width: 300px;
  border-radius: 10px;
  object-fit: contain;
  background: #fff;
}

.entry-clue-hint {
  font-size: 12px;
  color: #777;
  margin: 12px 0 0;
}

/* 組別線索按鈕 */
.group-clues-btn {
  position: fixed;
  bottom: 82px; /* above chat input */
  right: 18px;
  background: #fead00;
  color: #333;
  border: none;
  padding: 12px 16px;
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.18);
  cursor: pointer;
  z-index: 1600;

}

/* 組別線索 modal */
.clues-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1700;
}
.clues-modal-inner {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  width: 92%;
  max-width: 900px;
  max-height: 80vh;
  box-shadow: 0 12px 48px rgba(0,0,0,0.6);
  overflow-y: auto;
}
.clues-modal-title {
  color: #333;
  font-weight: 700;
  margin: 6px 0 12px;
}
.clues-loading { color: #ccc; }
.no-clues { color: #666; text-align: center; padding: 28px 0; }

.image-clues {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.clue-image img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
  background: #fff;
}

/* 縮放 Overlay */
.zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2200;
}
.zoom-box { max-width: 92%; max-height: 92%; }
.zoom-img { width: 100%; height: auto; border-radius: 12px; }
</style>
