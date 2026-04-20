<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <button class="icon-btn" aria-label="Menu" @click="$emit('toggle-sidebar')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="black" />
          </svg>
        </button>
        <h1 class="header-title" @click="goToHome">破解安洛克</h1>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToHome() {
  // 導航到首頁
  router.push('/')
}
</script>

<style scoped>
.header {
  border-bottom: 1px solid #c2c2c2;
  background: #fff;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-content { display:flex; justify-content:flex-start; align-items:center }
.header-left { display:flex; align-items:center; gap:16px }
.header-title { 
  font-size:18px; 
  color:#333;
  cursor: pointer;
  transition: color 0.2s ease;
}
.header-title:hover {
  color: #1890ff;
}
.icon-btn { background:none; border:none; cursor:pointer; padding:0 }
</style>
