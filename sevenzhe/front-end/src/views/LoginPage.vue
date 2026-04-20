<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表單資料
const account = ref('')
const password = ref('')
const loginError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

// 登入函數
const handleLogin = async () => {
  // 清除之前的錯誤
  loginError.value = false
  errorMessage.value = ''

  // 驗證輸入
  if (!account.value.trim() || !password.value.trim()) {
    loginError.value = true
    errorMessage.value = '帳號和密碼不能為空'
    return
  }

  isLoading.value = true

  try {
    // 調用後端登入 API
    const response = await fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: account.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // 登入成功，保存用戶信息
      localStorage.setItem('student_id', data.student_id)
      localStorage.setItem('student_name', data.student_name)
      localStorage.setItem('group_id', data.group_id)
      
      // 導向首頁
      router.push('/')
    } else {
      // 登入失敗
      loginError.value = true
      errorMessage.value = data.message || '密碼錯誤'
    }
  } catch (error) {
    console.error('登入出錯:', error)
    loginError.value = true
    errorMessage.value = '登入失敗，請檢查網路連線'
  } finally {
    isLoading.value = false
  }
}

// 處理 Enter 鍵
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 背景圖片 -->
    <div class="background-section">
      <img src="/安洛克地圖 20260327.png" alt="Project Unlock Map" class="background-image" />
      <div class="title-overlay">
        <h1 class="title-text">破解安洛克</h1>
        <p class="subtitle-text">Project Unlock</p>
      </div>
    </div>

    <!-- 登入標籤和區塊（覆蓋在背景上） -->
    <div class="login-overlay">
      <!-- Sign In 標籤框 -->
      <div class="sign-in-label-box">Sign In</div>

      <!-- 登入區塊 -->
      <div class="login-section">
        <div class="login-content">
        <!-- 帳號輸入框 -->
        <div class="input-wrapper">
          <input
            v-model="account"
            type="text"
            placeholder="Account"
            class="input-field"
            @keypress="handleKeyPress"
            :disabled="isLoading"
          />
        </div>

        <!-- 密碼輸入框 -->
        <div class="input-wrapper">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="input-field"
            @keypress="handleKeyPress"
            :disabled="isLoading"
          />
        </div>

        <!-- 錯誤提示 -->
        <transition name="error-fade">
          <div v-if="loginError" class="error-message">
            <svg class="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2" />
              <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="error-text">{{ errorMessage }}</span>
          </div>
        </transition>

        <!-- 登入按鈕 -->
        <button
          class="login-button"
          @click="handleLogin"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 背景圖片區 */
.background-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 標題和副標題覆蓋層 */
.title-overlay {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.title-text {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.subtitle-text {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 3px;
  opacity: 0.95;
}

/* 登入覆蓋層 */
.login-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
}

/* Sign In 標籤 */
.sign-in-label-top {
  position: absolute;
  bottom: 30px;
  left: 40px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  z-index: 3;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* 登入包裝容器（覆蓋層） */
.login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

/* Sign In 標籤框 */
.sign-in-label-box {
  background: #E1EBF0;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 96px;
  margin-left: 0;
  border-radius: 0 8px 0 0;
  position: relative;
  z-index: 2;
}

/* 登入區（覆蓋在背景上） */
.login-section {
  background: #E1EBF0;
  padding: 60px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 350px;
  width: 100%;
}

.login-content {
  width: 100%;
  max-width: 400px;
}

.input-wrapper {
  margin-bottom: 16px;
}

.input-field {
  width: 100%;
  height: 48px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: #E8EAED;
  color: #333;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

.input-field::placeholder {
  color: #999;
  font-weight: 400;
}

.input-field:focus {
  background: #D8DCE5;
  box-shadow: 0 0 0 3px rgba(91, 141, 191, 0.1);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 錯誤提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 24px;
  padding: 12px 16px;
  background: #FFE8E8;
  border-radius: 6px;
  color: #D84040;
}

.error-icon {
  color: #D84040;
  flex-shrink: 0;
}

.error-text {
  font-size: 14px;
  font-weight: 500;
}

/* 登入按鈕 */
.login-button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #5B8DBF 0%, #4A7AA8 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4A7AA8 0%, #3A6A98 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(90, 141, 191, 0.35);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(90, 141, 191, 0.25);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 錯誤消息動畫 */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .background-section {
    flex: 0.8;
  }

  .login-section {
    flex: 0.6;
    padding: 40px 20px;
    min-height: 280px;
  }

  .login-content {
    max-width: 100%;
  }

  .title-text {
    font-size: 36px;
  }

  .subtitle-text {
    font-size: 14px;
  }

  .sign-in-label-top {
    left: 20px;
    bottom: 20px;
    font-size: 14px;
  }

  .input-field,
  .login-button {
    height: 44px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .background-section {
    flex: 0.7;
  }

  .login-section {
    flex: 0.7;
    padding: 30px 16px;
  }

  .title-text {
    font-size: 28px;
  }

  .subtitle-text {
    font-size: 12px;
  }
}
</style>
