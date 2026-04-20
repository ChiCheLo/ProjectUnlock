#!/usr/bin/env python3
"""測試 OpenAI 初始化"""
import os
from dotenv import load_dotenv

# 載入 .env
load_dotenv()

print("=" * 50)
print("測試 OpenAI 初始化")
print("=" * 50)

# 測試 1: 檢查 API Key
api_key = os.getenv('OPENAI_API_KEY')
print(f"\n1. API Key 是否存在: {'是' if api_key else '否'}")
if api_key:
    print(f"   API Key 長度: {len(api_key)}")
    print(f"   API Key 開頭: {api_key[:20]}...")

# 測試 2: 導入 OpenAI
print("\n2. 導入 OpenAI 模組...")
try:
    from openai import OpenAI
    print("   ✓ OpenAI 模組導入成功")
except Exception as e:
    print(f"   ✗ OpenAI 模組導入失敗: {e}")
    exit(1)

# 測試 3: 初始化 OpenAI Client
print("\n3. 初始化 OpenAI Client...")
try:
    client = OpenAI(api_key=api_key)
    print("   ✓ OpenAI Client 初始化成功")
    print(f"   Client 類型: {type(client)}")
except Exception as e:
    print(f"   ✗ OpenAI Client 初始化失敗: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# 測試 4: 簡單的 API 調用
print("\n4. 測試簡單的 API 調用...")
try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "Say 'Hello!'"}
        ],
        max_tokens=10
    )
    print("   ✓ API 調用成功")
    print(f"   回應: {response.choices[0].message.content}")
except Exception as e:
    print(f"   ✗ API 調用失敗: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
print("測試完成")
print("=" * 50)
