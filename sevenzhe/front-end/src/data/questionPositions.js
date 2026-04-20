// 新的9題架構配置 - 從上到下: 3星(1題) → 2星(1題) → 1星(7題)
// 使用像素單位以實現垂直滾動
const physicsPositions = [
  // 第1題 (3星) - 頂部中央
  { index: 0, x: 50, y: 100, connections: [1] },
  
  // 第2題 (2星) - 中間
  { index: 1, x: 50, y: 400, connections: [2, 3] },
  
  // 第3-4題 (1星) - 第一排分叉
  { index: 2, x: 30, y: 700, connections: [4] },
  { index: 3, x: 70, y: 700, connections: [5] },
  
  // 第5-6題 (1星) - 第二排合併到中間
  { index: 4, x: 30, y: 1000, connections: [6] },
  { index: 5, x: 70, y: 1000, connections: [6] },
  
  // 第7題 (1星) - 中間
  { index: 6, x: 50, y: 1300, connections: [7, 8] },
  
  // 第8-9題 (1星) - 底部分叉
  { index: 7, x: 30, y: 1600, connections: [] },
  { index: 8, x: 70, y: 1600, connections: [] }
]

// 化學的5題架構配置 - 從上到下: 3星(2題) → 2星(3題)
const chemistryPositions = [
  // 第1題 (3星) - 頂部中央
  { index: 0, x: 50, y: 100, connections: [2] },
  
  // 第2題 (3星) - 第二層中央
  { index: 1, x: 50, y: 400, connections: [2] },
  
  // 第3題 (2星) - 中間
  { index: 2, x: 50, y: 700, connections: [3, 4] },
  
  // 第4-5題 (2星) - 底部分叉
  { index: 3, x: 30, y: 1000, connections: [] },
  { index: 4, x: 70, y: 1000, connections: [] }
]

// 生物的8題架構配置 - 從上到下: 3星(2題) → 2星(3題) → 1星(3題)
const biologyPositions = [
  // 第1題 (3星) - 頂部中央
  { index: 0, x: 50, y: 100, connections: [2] },
  
  // 第2題 (3星) - 第二層中央
  { index: 1, x: 50, y: 350, connections: [2] },
  
  // 第3題 (2星) - 中間
  { index: 2, x: 50, y: 600, connections: [3, 4] },
  
  // 第4-5題 (2星) - 第三層分叉
  { index: 3, x: 30, y: 850, connections: [5] },
  { index: 4, x: 70, y: 850, connections: [5] },
  
  // 第6題 (1星) - 合併到中間
  { index: 5, x: 50, y: 1100, connections: [6, 7] },
  
  // 第7-8題 (1星) - 底部分叉
  { index: 6, x: 30, y: 1350, connections: [] },
  { index: 7, x: 70, y: 1350, connections: [] }
]

// 地科的9題架構配置 - 從上到下: 2星(3題) → 1星(6題)
const earthSciencePositions = [
  // 第1題 (2星) - 頂部中央
  { index: 0, x: 50, y: 100, connections: [3] },
  
  // 第2-3題 (2星) - 第二層分叉
  { index: 1, x: 30, y: 350, connections: [3] },
  { index: 2, x: 70, y: 350, connections: [3] },
  
  // 第4題 (1星) - 合併到中間
  { index: 3, x: 50, y: 600, connections: [4, 5] },
  
  // 第5-6題 (1星) - 第三層分叉
  { index: 4, x: 30, y: 850, connections: [6] },
  { index: 5, x: 70, y: 850, connections: [6] },
  
  // 第7題 (1星) - 第四層中間
  { index: 6, x: 50, y: 1100, connections: [7, 8] },
  
  // 第8-9題 (1星) - 底部分叉
  { index: 7, x: 30, y: 1350, connections: [] },
  { index: 8, x: 70, y: 1350, connections: [] }
]

// 地理的9題架構配置 - 從上到下: 3星(3題) → 2星(1題) → 1星(5題)
const geographyPositions = [
  // 第1題 (3星) - 頂部中央
  { index: 0, x: 50, y: 100, connections: [3] },
  
  // 第2-3題 (3星) - 第二層分叉
  { index: 1, x: 30, y: 350, connections: [3] },
  { index: 2, x: 70, y: 350, connections: [3] },
  
  // 第4題 (2星) - 合併到中間
  { index: 3, x: 50, y: 600, connections: [4, 5] },
  
  // 第5-6題 (1星) - 第三層分叉
  { index: 4, x: 30, y: 850, connections: [6] },
  { index: 5, x: 70, y: 850, connections: [6] },
  
  // 第7題 (1星) - 第四層中間
  { index: 6, x: 50, y: 1100, connections: [7, 8] },
  
  // 第8-9題 (1星) - 底部分叉
  { index: 7, x: 30, y: 1350, connections: [] },
  { index: 8, x: 70, y: 1350, connections: [] }
]

// 舊的8題架構配置 - 使用像素單位以實現垂直滾動
const basePositions = [
  { index: 0, x: 50, y: 100, connections: [1, 2] },   // 題1 (3星) - 頂部中央
  { index: 1, x: 28, y: 450, connections: [3] },      // 題2 (2星) - 左側
  { index: 2, x: 72, y: 450, connections: [3] },      // 題3 (2星) - 右側
  { index: 3, x: 50, y: 800, connections: [4, 5] },   // 題4 (1星) - 中央
  { index: 4, x: 28, y: 1150, connections: [6] },     // 題5 (1星) - 左側
  { index: 5, x: 72, y: 1150, connections: [7] },     // 題6 (1星) - 右側
  { index: 6, x: 28, y: 1500, connections: [] },      // 題7 (1星) - 左下
  { index: 7, x: 72, y: 1500, connections: [] }       // 題8 (1星) - 右下
]

// 灰色框配置
const baseFrames = [
  { x: 15, y: 300, width: 70, height: 250, rx: 8 },   // 第一個框 (2星題目區域)
  { x: 15, y: 650, width: 70, height: 950, rx: 8 }    // 第二個框 (1星題目區域)
]

// 為每個科目生成位置配置
const generateSubjectPositions = (startId, layoutType = 'base') => {
  let positions
  switch(layoutType) {
    case 'physics':
      positions = physicsPositions
      break
    case 'chemistry':
      positions = chemistryPositions
      break
    case 'biology':
      positions = biologyPositions
      break
    case 'earth-science':
      positions = earthSciencePositions
      break
    case 'geography':
      positions = geographyPositions
      break
    default:
      positions = basePositions
  }
  
  return positions.map((pos, index) => ({
    id: startId + index,
    x: pos.x,
    y: pos.y,
    connections: pos.connections.map(conn => startId + conn)
  }))
}

export const questionPositions = {
  physics: generateSubjectPositions(1, 'physics'),           // 物理使用新的9題佈局
  chemistry: generateSubjectPositions(10, 'chemistry'),      // 化學使用5題佈局
  biology: generateSubjectPositions(19, 'biology'),          // 生物使用8題佈局
  'earth-science': generateSubjectPositions(28, 'earth-science'), // 地科使用9題佈局
  geography: generateSubjectPositions(37, 'geography')       // 地理使用9題佈局
}

export const frames = baseFrames

// 計算連接線的座標
export function calculateConnections(subjectId, cardWidth = 140, cardHeight = 100) {
  const positions = questionPositions[subjectId]
  if (!positions) return []

  const lines = []
  positions.forEach(pos => {
    pos.connections.forEach(targetId => {
      const target = positions.find(p => p.id === targetId)
      if (target) {
        lines.push({
          x1: pos.x,
          y1: pos.y,
          x2: target.x,
          y2: target.y
        })
      }
    })
  })
  return lines
}
