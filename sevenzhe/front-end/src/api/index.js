import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 獲取國家狀態
export const getCountryStatus = () => {
  return api.get('/country-status/')
}

// 獲取排行榜
export const getLeaderboard = () => {
  return api.get('/leaderboard/')
}

// 呼叫 OpenAI Chat API
export const callOpenAIChat = (message, domain, game_record_id = null) => {
  return api.post('/openai/', {
    message,
    domain,
    game_record_id
  })
}

export default api
