<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "../components/Header.vue";
import Sidebar from "../components/Sidebar.vue";
import { callOpenAIChat } from "../api/index.js";

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
    const res = await fetch(`http://127.0.0.1:8000/api/domain-story/?domain=${encodeURIComponent(domainName)}`);
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

onMounted(() => {
  loadDomainStory();
});

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // 加入玩家訊息
  messages.value.push({ sender: "player", text });
  userInput.value = "";

  // 顯示暫時 loading 回覆（可視化）
  messages.value.push({ sender: "ai", text: "思考中…" });

  try {
    // 呼叫後端 API（只需傳 domain，後端自動查詢湯面/湯底）
    const response = await callOpenAIChat(text, domainName);
    
    const data = response.data;

    // 取代剛剛的 loading 訊息為真實回應
    const lastIndex = messages.value.length - 1;
    if (messages.value[lastIndex].sender === "ai" && messages.value[lastIndex].text === "思考中…") {
      messages.value[lastIndex].text = data.ok ? (data.text || "（無回應）") : "伺服器回應錯誤";
      if (data.reveal_truth) {
        messages.value[lastIndex].isReveal = true;
      }
    } else {
      messages.value.push({
        sender: "ai",
        text: data.ok ? (data.text || "（無回應）") : "伺服器回應錯誤",
        isReveal: data.reveal_truth
      });
    }

    // 如果答對，顯示湯底並標記已揭曉
    if (data.ok && data.reveal_truth && data.truth) {
      hasRevealed.value = true;
      messages.value.push({
        sender: "ai",
        text: `【湯底揭曉】\n${data.truth}`,
        isReveal: true
      });
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


/* 返回：若已答對則帶參數到 SeaTurtleSoup 顯示決策 */
function goBack() {
  if (hasRevealed.value) {
    router.push({
      path: '/sea-turtle-soup',
      query: { showDecision: 'true', domain: domainName }
    });
  } else {
    router.back();
  }
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
        placeholder="輸入你的推理或提問…"
      />
      <button @click="sendMessage">送出</button>
    </div>

    <!-- Sidebar -->
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
   底部輸入框
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
</style>
