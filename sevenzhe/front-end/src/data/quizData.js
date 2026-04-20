export const subjects = [
  {
    id: 'physics',
    name: '物理',
    color: '#10B981',
    progress: { completed: 0, total: 8 },
    questions: [
      { id: 19, text: '力的三要素為何？', difficulty: 3, expanded: false, answer: '大小方向作用點', explanation: '力的三要素包括：力的大小、力的方向、力的作用點。這三個要素完整描述了一個力的特性。' },
      { id: 20, text: '光的三原色是哪三種？', difficulty: 2, expanded: false, answer: '紅綠藍', explanation: '光的三原色是紅色(Red)、綠色(Green)、藍色(Blue)，簡稱RGB。混合這三種色光可以產生其他顏色。' },
      { id: 21, text: '聲音在什麼介質中傳播最快？', difficulty: 2, expanded: false, answer: '固體', explanation: '聲音在固體中傳播最快，因為固體分子排列緊密。傳播速度：固體 > 液體 > 氣體。' },
      { id: 22, text: '溫度計是測量什麼的工具？', difficulty: 1, expanded: false, answer: '溫度', explanation: '溫度計是用來測量物體溫度的工具，常見的有水銀溫度計、酒精溫度計和電子溫度計。' },
      { id: 23, text: '電燈泡發光是什麼能轉換成光能？', difficulty: 1, expanded: false, answer: '電能', explanation: '電燈泡將電能轉換成光能和熱能，讓燈絲發熱發光，是能量轉換的例子。' },
      { id: 24, text: '水的三態變化包括哪些？', difficulty: 1, expanded: false, answer: '固液氣', explanation: '水的三態是固態(冰)、液態(水)、氣態(水蒸氣)。物質的三態可以互相轉換。' },
      { id: 25, text: '鏡子反射光是什麼現象？', difficulty: 1, expanded: false, answer: '光的反射', explanation: '鏡子反射光是光的反射現象。光遇到光滑表面會反射，入射角等於反射角。' },
      { id: 26, text: '摩擦力的方向是？', difficulty: 1, expanded: false, answer: '相反', explanation: '摩擦力的方向與物體運動方向相反，是一種阻礙物體運動的力。' },
    ]
  },
  {
    id: 'chemistry',
    name: '化學',
    color: '#10B981',
    progress: { completed: 0, total: 8 },
    questions: [
      { id: 1, text: '週期表第一個元素為？', difficulty: 3, expanded: false, answer: '氫', explanation: '氫(H)是週期表上的第一個元素，原子序為1，是宇宙中含量最豐富的元素。' },
      { id: 2, text: '原子序為6的元素為？', difficulty: 2, expanded: false, answer: '碳', explanation: '碳(C)的原子序為6，是構成生命的重要元素，也是有機化合物的基礎。' },
      { id: 3, text: 'PH值為7代表什麼性質？', difficulty: 2, expanded: false, answer: '中性', explanation: 'PH值為7表示溶液呈中性，既不是酸性也不是鹼性，例如純水就是中性。' },
      { id: 4, text: '鐵生鏽是什麼變化？', difficulty: 1, expanded: false, answer: '化學變化', explanation: '鐵生鏽是鐵與空氣中的氧氣和水發生化學反應，生成氧化鐵，屬於化學變化。' },
      { id: 5, text: '打開汽水會冒出什麼氣體？', difficulty: 1, expanded: false, answer: '二氧化碳', explanation: '汽水中溶解了二氧化碳氣體，打開瓶蓋時壓力降低，二氧化碳就會釋放出來形成氣泡。' },
      { id: 6, text: '食鹽的化學式為？', difficulty: 1, expanded: false, answer: 'NaCl', explanation: '食鹽的化學名稱是氯化鈉，化學式為NaCl，由鈉離子(Na+)和氯離子(Cl-)組成。' },
      { id: 7, text: '什麼溶液可以讓紫色石蕊試紙變藍？', difficulty: 1, expanded: false, answer: '鹼性溶液', explanation: '鹼性溶液(或鹼溶液)可以使紫色石蕊試紙變藍色，這是檢驗鹼性的方法之一。' },
      { id: 8, text: '燃燒需要什麼氣體？', difficulty: 1, expanded: false, answer: '氧氣', explanation: '燃燒是一種氧化反應，需要氧氣作為助燃劑。沒有氧氣，燃燒就無法進行。' },
    ]
  },
  {
    id: 'biology',
    name: '生物',
    color: '#10B981',
    progress: { completed: 0, total: 8 },
    questions: [
      { id: 10, text: '植物細胞和動物細胞都有的構造？', difficulty: 3, expanded: false, answer: '細胞膜', explanation: '細胞膜是植物細胞和動物細胞都有的構造，用來控制物質進出細胞。其他如細胞核、細胞質也是共同構造。' },
      { id: 11, text: '光合作用需要什麼條件？', difficulty: 2, expanded: false, answer: '陽光', explanation: '光合作用需要陽光(光能)、二氧化碳和水，在葉綠體中進行，產生葡萄糖和氧氣。' },
      { id: 12, text: '人體最大的器官是？', difficulty: 2, expanded: false, answer: '皮膚', explanation: '皮膚是人體最大的器官，成人的皮膚面積約1.5-2平方公尺，具有保護、調節體溫等功能。' },
      { id: 13, text: '植物的根有什麼功能？', difficulty: 1, expanded: false, answer: '吸收水分', explanation: '植物的根主要功能包括吸收水分和養分、固定植物體，以及儲存養分。' },
      { id: 14, text: '人體有多少塊骨頭？', difficulty: 1, expanded: false, answer: '206', explanation: '成年人的身體有206塊骨頭，嬰兒出生時約有270塊，隨著成長部分骨頭會融合。' },
      { id: 15, text: '心臟的主要功能是？', difficulty: 1, expanded: false, answer: '輸送血液', explanation: '心臟是血液循環系統的中心，主要功能是將血液輸送到全身各處，提供氧氣和養分。' },
      { id: 16, text: '呼吸時吸入什麼氣體？', difficulty: 1, expanded: false, answer: '氧氣', explanation: '呼吸時吸入氧氣，呼出二氧化碳。氧氣進入肺部後，會進入血液中供給全身細胞使用。' },
      { id: 17, text: '食物在哪個器官開始消化？', difficulty: 1, expanded: false, answer: '口腔', explanation: '消化從口腔開始，透過咀嚼和唾液中的酵素開始分解食物，尤其是澱粉類食物。' },
    ]
  },
  {
    id: 'earth-science',
    name: '地科',
    color: '#10B981',
    progress: { completed: 0, total: 8 },
    questions: [
      { id: 28, text: '地球的內部構造由外而內為？', difficulty: 3, expanded: false, answer: '地殼地函地核', explanation: '地球內部構造由外而內分為：地殼、地函(地幔)、地核。地殼最薄，地核在最中心。' },
      { id: 29, text: '台灣位於哪兩個板塊交界處？', difficulty: 2, expanded: false, answer: '歐亞板塊菲律賓海板塊', explanation: '台灣位於歐亞板塊與菲律賓海板塊的交界處，兩板塊碰撞形成了台灣島。' },
      { id: 30, text: '岩石分為哪三大類？', difficulty: 2, expanded: false, answer: '火成岩沉積岩變質岩', explanation: '岩石分為三大類：火成岩(岩漿冷卻形成)、沉積岩(沉積物堆積形成)、變質岩(岩石變質形成)。' },
      { id: 31, text: '地震的震央是指？', difficulty: 1, expanded: false, answer: '地表正上方', explanation: '震央是指地震震源在地表的正上方位置，是地表受地震影響最嚴重的地方。' },
      { id: 32, text: '月亮繞地球一圈需要多久？', difficulty: 1, expanded: false, answer: '一個月', explanation: '月球繞地球公轉一圈約需27.3天，大約是一個月的時間。月相變化的週期約為29.5天。' },
      { id: 33, text: '火山噴發會噴出什麼物質？', difficulty: 1, expanded: false, answer: '岩漿', explanation: '火山噴發會噴出岩漿、火山灰、火山氣體等物質。岩漿冷卻後會形成火成岩。' },
      { id: 34, text: '大氣層中含量最多的氣體？', difficulty: 1, expanded: false, answer: '氮氣', explanation: '大氣中含量最多的氣體是氮氣，約佔78%。其次是氧氣約21%，其他氣體約1%。' },
      { id: 35, text: '雲是由什麼形成的？', difficulty: 1, expanded: false, answer: '水蒸氣', explanation: '雲是由水蒸氣凝結成的小水滴或冰晶組成。空氣中的水蒸氣上升冷卻後就會凝結成雲。' },
    ]
  },
  {
    id: 'geography',
    name: '地理',
    color: '#10B981',
    progress: { completed: 0, total: 8 },
    questions: [
      { id: 37, text: '台灣的經緯度大約為何？', difficulty: 3, expanded: false, answer: '北緯22-25度東經120-122度', explanation: '台灣位於北緯約22-25度，東經約120-122度之間，位於亞洲大陸東南方、太平洋西岸。' },
      { id: 38, text: '台灣最長的河川是？', difficulty: 2, expanded: false, answer: '濁水溪', explanation: '濁水溪是台灣最長的河川，全長約186.6公里，發源於合歡山，流經中部地區。' },
      { id: 39, text: '台灣的氣候類型為？', difficulty: 2, expanded: false, answer: '亞熱帶季風', explanation: '台灣屬於亞熱帶季風氣候，北部為副熱帶季風氣候，南部接近熱帶季風氣候，四季分明。' },
      { id: 40, text: '台灣本島最高峰是？', difficulty: 1, expanded: false, answer: '玉山', explanation: '玉山是台灣本島的最高峰，海拔3952公尺，也是東北亞第一高峰。' },
      { id: 41, text: '台北市是台灣的什麼？', difficulty: 1, expanded: false, answer: '首都', explanation: '台北市是中華民國的首都，也是台灣最大的城市，是政治、經濟、文化的中心。' },
      { id: 42, text: '台灣四面環海是什麼地形？', difficulty: 1, expanded: false, answer: '島嶼', explanation: '台灣四面環海，是一個島嶼。位於太平洋西岸，東臨太平洋，西隔台灣海峽與中國大陸相望。' },
      { id: 43, text: '農業、工業、服務業屬於什麼？', difficulty: 1, expanded: false, answer: '產業', explanation: '農業、工業、服務業統稱為產業，分別屬於第一級產業、第二級產業、第三級產業。' },
      { id: 44, text: '人口密集的地區通常在？', difficulty: 1, expanded: false, answer: '平原', explanation: '人口密集的地區通常在平原地帶，因為平原地形平坦、交通便利、適合發展農業和都市。' },
    ]
  }
]
