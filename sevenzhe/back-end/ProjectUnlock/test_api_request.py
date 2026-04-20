#!/usr/bin/env python3
"""測試前端到後端的 OpenAI API 請求"""
import requests
import json

print("=" * 60)
print("測試 /api/openai/ 端點")
print("=" * 60)

# 後端 API 地址
API_URL = "http://127.0.0.1:8000/api/openai/"

# 測試請求數據
test_data = {
    "message": "這個國家有使用火力發電嗎？",
    "story_question": "太平洋上的一國家，過去電力充沛，居民生活品質良好。可在近幾年，沿海地區常常淹水停電，居民們深受其困擾，導致移民人數增加。為什麼？",
    "story_answer": "由於國家決定轉型為無核家園，將核能發電廠全數停止運作，改為於近海工業區的岸邊新建大量的火力發電廠。火力發電廠分為燃煤與燃氣，為求效率與經濟，建設多為燃煤火力發電廠。廠區短期內提供了大量電力與就業機會，刺激了區域經濟，但同時也增加了大量溫室氣體的排放。這些火力發電廠所排放的溫室氣體成了壓垮駱駝的最後一根稻草，大型冰山崩塌、北極凍土融化，封存的有機物因溫暖環境而被分解，釋放了大量甲烷，全球海平面上升速率於過去幾年成跳躍式增加，數十年間導致海平面上升2公尺，國家低海拔區域逐漸被淹沒，導致居民們逐漸撤離近海區。"
}

print("\n📤 發送請求到:", API_URL)
print("\n請求數據:")
print(f"  - message: {test_data['message']}")
print(f"  - story_question: {test_data['story_question'][:50]}...")
print(f"  - story_answer: {test_data['story_answer'][:50]}...")

try:
    response = requests.post(
        API_URL,
        json=test_data,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"\n📥 回應狀態碼: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ 請求成功！")
        data = response.json()
        print("\n回應數據:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(f"❌ 請求失敗！")
        print(f"\n錯誤回應:")
        try:
            error_data = response.json()
            print(json.dumps(error_data, ensure_ascii=False, indent=2))
        except:
            print(response.text)
            
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ 連接錯誤: 無法連接到後端伺服器")
    print(f"   請確認後端伺服器是否在 http://127.0.0.1:8000 運行")
    print(f"   錯誤詳情: {e}")
except requests.exceptions.Timeout:
    print(f"\n❌ 請求超時")
except Exception as e:
    print(f"\n❌ 發生錯誤: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
