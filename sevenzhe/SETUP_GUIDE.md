# ProjectUnlock 前後端分離配置完成指南

## ✅ 已完成的配置

### 1️⃣ MySQL 資料庫連接
- **配置檔案**: `sevenzhe/.env`
- **連接信息**:
  - Host: localhost
  - Port: 8080
  - Database: ProjectUnlock
  - User: root
  - Password: (空)

### 2️⃣ Django 後端配置
- **Settings 更新** (`ProjectUnlock/settings.py`):
  - ✅ 已設定 MySQL 資料庫連接
  - ✅ 已新增 CORS 支持，允許前端跨域請求
  - ✅ 已安裝 `corsheaders` 和 `rest_framework` 應用

- **依賴包** (`back-end/requirements.txt`):
  ```
  Django==4.2.30
  djangorestframework==3.14.0
  django-cors-headers==4.3.1
  python-dotenv==1.0.0
  openai==1.12.0
  PyMySQL==1.1.0
  ```

### 3️⃣ Django Models 建立
已在 `backEnd/models.py` 中定義以下模型：
- `GameDomain` - 遊戲領域（包含湯面和湯底）
- `GameRecord` - 遊戲紀錄（玩家遊戲歷史）
- `Leaderboard` - 排行榜（玩家成績排名）
- `ChatMessage` - 聊天消息（完整對話記錄）

### 4️⃣ OpenAI API 端點
在 `backEnd/views.py` 中實現了以下 API：
- `POST /api/openai/` - 海龜湯遊戲聊天 API
- `GET /api/country-status/` - 獲取遊戲領域列表
- `GET /api/leaderboard/` - 獲取排行榜數據

### 5️⃣ URL 路由配置
- `backEnd/urls.py` - 應用級別路由
- `ProjectUnlock/urls.py` - 項目級別路由（前綴 `/api/`）

### 6️⃣ 前端 API 調用更新
- `front-end/src/api/index.js` - 新增 `callOpenAIChat()` 函數
- `front-end/src/views/ChatRoom.vue` - 改為調用後端 API

---

## 🚀 運行步驟

### 後端啟動
```bash
cd sevenzhe/back-end/ProjectUnlock

# 創建資料庫表（首次運行）
python3 manage.py migrate

# 啟動開發伺服器
python3 manage.py runserver 0.0.0.0:8000
```

### 前端啟動
```bash
cd sevenzhe/front-end

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

---

## ⚠️ 下一步設置

### 1. 資料庫初始化
後端運行後，需要：
1. 創建管理員帳號
   ```bash
   python3 manage.py createsuperuser
   ```
2. 在 Django Admin 中添加遊戲領域數據
   - 訪問 `http://localhost:8000/admin/`
   - 添加 GameDomain 記錄（湯面和湯底）

### 2. 前端配置
檢查 `front-end/vite.config.js` 的代理設置，確保能夠正確代理後端請求：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/api')
  }
}
```

### 3. 測試連接
- 確保後端在 `http://localhost:8000` 運行
- 確保前端在 `http://localhost:5173` 運行
- 打開瀏覽器開發者工具檢查 Network 標籤，確認 API 請求成功

---

## 📝 API 文檔

### POST /api/openai/
**說明**: 呼叫 OpenAI GPT-4o 回應海龜湯遊戲問題

**請求**:
```json
{
  "message": "玩家的問題",
  "story_question": "湯面（謎題情景）",
  "story_answer": "湯底（真相）",
  "game_record_id": 1
}
```

**回應**:
```json
{
  "ok": true,
  "text": "是",
  "reveal_truth": false,
  "truth": null
}
```

或當玩家答對時：
```json
{
  "ok": true,
  "text": "🎉 恭喜答對！",
  "reveal_truth": true,
  "truth": "完整湯底"
}
```

### GET /api/country-status/
**說明**: 獲取所有遊戲領域

**回應**:
```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "火域",
      "description": "...",
      "question": "...",
      "answer": "..."
    }
  ]
}
```

### GET /api/leaderboard/
**說明**: 獲取排行榜（前 10 名）

**回應**:
```json
{
  "ok": true,
  "data": [
    {
      "rank": 1,
      "username": "player1",
      "points": 1000,
      "correct_answers": 10,
      "total_games": 20
    }
  ]
}
```

---

## 🔧 故障排除

### 1. `ModuleNotFoundError: No module named 'openai'`
運行: `python3 -m pip install -r requirements.txt`

### 2. `pymysql.err.OperationalError: (2003, "Can't connect to MySQL server")`
- 檢查 MySQL 服務是否啟動
- 確認 `.env` 中的連接信息是否正確
- 確保資料庫 `ProjectUnlock` 已存在

### 3. CORS 錯誤
確認 `settings.py` 中的 `CORS_ALLOWED_ORIGINS` 包含了前端地址

### 4. 前端無法訪問後端 API
- 檢查後端是否成功啟動在 `8000` 埠
- 檢查網路連接
- 在瀏覽器開發者工具中查看具體錯誤信息

---

## 📚 相關文檔
- Django 文檔: https://docs.djangoproject.com/
- OpenAI API: https://platform.openai.com/docs/
- Vue 3: https://vuejs.org/
- Vite: https://vitejs.dev/

---

**更新日期**: 2026 年 4 月 17 日
**版本**: 1.0
