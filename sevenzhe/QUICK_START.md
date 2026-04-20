# 快速開始指南

## 📋 核心修改總結

### 後端改變
| 文件 | 變更內容 |
|------|--------|
| `.env` | ✅ 添加 MySQL 連接配置 |
| `settings.py` | ✅ MySQL 連接、CORS 配置、新增應用 |
| `requirements.txt` | ✅ 添加 openai, django-cors-headers, PyMySQL |
| `backEnd/models.py` | ✅ 4 個 Django Models |
| `backEnd/views.py` | ✅ 3 個 API endpoints |
| `backEnd/urls.py` | ✅ 新建 URL 路由 |
| `ProjectUnlock/urls.py` | ✅ 包含 backEnd URLs |
| `ProjectUnlock/__init__.py` | ✅ PyMySQL 初始化 |

### 前端改變
| 文件 | 變更內容 |
|------|--------|
| `front-end/src/api/index.js` | ✅ 新增 `callOpenAIChat()` 函數 |
| `front-end/src/views/ChatRoom.vue` | ✅ 改用後端 API 而非本地 proxy |

---

## 🎬 運行命令

```bash
# 後端
cd sevenzhe/back-end/ProjectUnlock
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000

# 前端（新的終端）
cd sevenzhe/front-end
npm install
npm run dev
```

---

## ✨ 成功標誌
- ✅ 後端在 `http://localhost:8000` 運行
- ✅ 前端在 `http://localhost:5173` 運行
- ✅ 打開 ChatRoom 頁面，輸入問題後，能看到後端的回應
- ✅ 不再看到本地 openai-proxy 的錯誤

---

## 🔑 重要提醒
1. **確保 MySQL 在端口 8080 運行**
2. **`.env` 文件必須在 `sevenzhe/` 根目錄**
3. **前端會調用 `http://127.0.0.1:8000/api/openai/`**
4. **舊的 `npm run start:server` 可以刪除或保留**
