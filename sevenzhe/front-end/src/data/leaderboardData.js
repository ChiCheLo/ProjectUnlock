// 排行榜模擬數據
export const subjects = [
  {
    id: 'overall',
    name: '總排行',
    color: '#667eea'
  },
  {
    id: 'chemistry',
    name: '化學',
    color: '#10B981'
  },
  {
    id: 'physics',
    name: '物理',
    color: '#3B82F6'
  },
  {
    id: 'biology',
    name: '生物',
    color: '#8B5CF6'
  },
  {
    id: 'earth-science',
    name: '地科',
    color: '#F59E0B'
  },
  {
    id: 'geography',
    name: '地理',
    color: '#EF4444'
  }
]

// 生成玩家名稱
const generatePlayerName = (index) => {
  const names = [
    '玩家一', '玩家二', '玩家三', '玩家四', '玩家五',
    '玩家六', '玩家七', '玩家八', '玩家九', '玩家十'
  ]
  return names[index] || `玩家${index + 1}`
}

// 生成隨機排行榜數據
const generateLeaderboardData = (subjectId) => {
  const players = []

  // 生成10名玩家
  for (let i = 0; i < 10; i++) {
    const baseCoins = 60 - (i * 5) // 分數遞減
    const baseTime = 25 + (i * 3) // 時間遞增

    players.push({
      rank: i + 1,
      playerName: generatePlayerName(i),
      coins: baseCoins + Math.floor(Math.random() * 5), // 加入一些隨機性
      maxCoins: 60,
      avgTime: baseTime + Math.floor(Math.random() * 5)
    })
  }

  return players
}

// 為每個科目生成排行榜數據
export const leaderboardData = {
  overall: [
    { rank: 1, playerName: '玩家一', questionsAnswered: 38, totalQuestions: 40, avgTime: 28 },
    { rank: 2, playerName: '玩家二', questionsAnswered: 36, totalQuestions: 40, avgTime: 32 },
    { rank: 3, playerName: '玩家三', questionsAnswered: 34, totalQuestions: 40, avgTime: 35 },
    { rank: 4, playerName: '玩家四', questionsAnswered: 32, totalQuestions: 40, avgTime: 38 },
    { rank: 5, playerName: '玩家五', questionsAnswered: 30, totalQuestions: 40, avgTime: 42 },
    { rank: 6, playerName: '玩家六', questionsAnswered: 28, totalQuestions: 40, avgTime: 45 },
    { rank: 7, playerName: '玩家七', questionsAnswered: 26, totalQuestions: 40, avgTime: 48 },
    { rank: 8, playerName: '玩家八', questionsAnswered: 24, totalQuestions: 40, avgTime: 52 },
    { rank: 9, playerName: '玩家九', questionsAnswered: 22, totalQuestions: 40, avgTime: 55 },
    { rank: 10, playerName: '玩家十', questionsAnswered: 20, totalQuestions: 40, avgTime: 58 }
  ],
  chemistry: [
    { rank: 1, playerName: '玩家一', questionsAnswered: 8, totalQuestions: 8, avgTime: 25 },
    { rank: 2, playerName: '玩家三', questionsAnswered: 7, totalQuestions: 8, avgTime: 28 },
    { rank: 3, playerName: '玩家二', questionsAnswered: 7, totalQuestions: 8, avgTime: 30 },
    { rank: 4, playerName: '玩家五', questionsAnswered: 6, totalQuestions: 8, avgTime: 33 },
    { rank: 5, playerName: '玩家四', questionsAnswered: 6, totalQuestions: 8, avgTime: 36 },
    { rank: 6, playerName: '玩家七', questionsAnswered: 6, totalQuestions: 8, avgTime: 39 },
    { rank: 7, playerName: '玩家六', questionsAnswered: 5, totalQuestions: 8, avgTime: 42 },
    { rank: 8, playerName: '玩家八', questionsAnswered: 5, totalQuestions: 8, avgTime: 45 },
    { rank: 9, playerName: '玩家十', questionsAnswered: 4, totalQuestions: 8, avgTime: 48 },
    { rank: 10, playerName: '玩家九', questionsAnswered: 4, totalQuestions: 8, avgTime: 52 }
  ],
  physics: [
    { rank: 1, playerName: '玩家二', questionsAnswered: 8, totalQuestions: 8, avgTime: 27 },
    { rank: 2, playerName: '玩家一', questionsAnswered: 7, totalQuestions: 8, avgTime: 29 },
    { rank: 3, playerName: '玩家四', questionsAnswered: 7, totalQuestions: 8, avgTime: 32 },
    { rank: 4, playerName: '玩家三', questionsAnswered: 6, totalQuestions: 8, avgTime: 35 },
    { rank: 5, playerName: '玩家六', questionsAnswered: 6, totalQuestions: 8, avgTime: 38 },
    { rank: 6, playerName: '玩家五', questionsAnswered: 6, totalQuestions: 8, avgTime: 41 },
    { rank: 7, playerName: '玩家八', questionsAnswered: 5, totalQuestions: 8, avgTime: 44 },
    { rank: 8, playerName: '玩家七', questionsAnswered: 5, totalQuestions: 8, avgTime: 47 },
    { rank: 9, playerName: '玩家九', questionsAnswered: 4, totalQuestions: 8, avgTime: 51 },
    { rank: 10, playerName: '玩家十', questionsAnswered: 4, totalQuestions: 8, avgTime: 54 }
  ],
  biology: [
    { rank: 1, playerName: '玩家三', questionsAnswered: 8, totalQuestions: 8, avgTime: 26 },
    { rank: 2, playerName: '玩家一', questionsAnswered: 8, totalQuestions: 8, avgTime: 28 },
    { rank: 3, playerName: '玩家五', questionsAnswered: 7, totalQuestions: 8, avgTime: 31 },
    { rank: 4, playerName: '玩家二', questionsAnswered: 7, totalQuestions: 8, avgTime: 34 },
    { rank: 5, playerName: '玩家四', questionsAnswered: 6, totalQuestions: 8, avgTime: 37 },
    { rank: 6, playerName: '玩家七', questionsAnswered: 6, totalQuestions: 8, avgTime: 40 },
    { rank: 7, playerName: '玩家六', questionsAnswered: 5, totalQuestions: 8, avgTime: 43 },
    { rank: 8, playerName: '玩家九', questionsAnswered: 5, totalQuestions: 8, avgTime: 46 },
    { rank: 9, playerName: '玩家八', questionsAnswered: 5, totalQuestions: 8, avgTime: 49 },
    { rank: 10, playerName: '玩家十', questionsAnswered: 4, totalQuestions: 8, avgTime: 53 }
  ],
  'earth-science': [
    { rank: 1, playerName: '玩家一', questionsAnswered: 8, totalQuestions: 8, avgTime: 24 },
    { rank: 2, playerName: '玩家四', questionsAnswered: 8, totalQuestions: 8, avgTime: 27 },
    { rank: 3, playerName: '玩家二', questionsAnswered: 7, totalQuestions: 8, avgTime: 30 },
    { rank: 4, playerName: '玩家六', questionsAnswered: 7, totalQuestions: 8, avgTime: 33 },
    { rank: 5, playerName: '玩家三', questionsAnswered: 6, totalQuestions: 8, avgTime: 36 },
    { rank: 6, playerName: '玩家五', questionsAnswered: 6, totalQuestions: 8, avgTime: 39 },
    { rank: 7, playerName: '玩家八', questionsAnswered: 5, totalQuestions: 8, avgTime: 42 },
    { rank: 8, playerName: '玩家七', questionsAnswered: 5, totalQuestions: 8, avgTime: 45 },
    { rank: 9, playerName: '玩家九', questionsAnswered: 5, totalQuestions: 8, avgTime: 48 },
    { rank: 10, playerName: '玩家十', questionsAnswered: 4, totalQuestions: 8, avgTime: 52 }
  ],
  geography: [
    { rank: 1, playerName: '玩家二', questionsAnswered: 8, totalQuestions: 8, avgTime: 29 },
    { rank: 2, playerName: '玩家一', questionsAnswered: 7, totalQuestions: 8, avgTime: 31 },
    { rank: 3, playerName: '玩家五', questionsAnswered: 7, totalQuestions: 8, avgTime: 34 },
    { rank: 4, playerName: '玩家三', questionsAnswered: 6, totalQuestions: 8, avgTime: 37 },
    { rank: 5, playerName: '玩家四', questionsAnswered: 6, totalQuestions: 8, avgTime: 40 },
    { rank: 6, playerName: '玩家六', questionsAnswered: 6, totalQuestions: 8, avgTime: 43 },
    { rank: 7, playerName: '玩家九', questionsAnswered: 5, totalQuestions: 8, avgTime: 46 },
    { rank: 8, playerName: '玩家七', questionsAnswered: 5, totalQuestions: 8, avgTime: 49 },
    { rank: 9, playerName: '玩家八', questionsAnswered: 4, totalQuestions: 8, avgTime: 52 },
    { rank: 10, playerName: '玩家十', questionsAnswered: 4, totalQuestions: 8, avgTime: 56 }
  ]
}
