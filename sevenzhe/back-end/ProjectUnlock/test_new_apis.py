#!/usr/bin/env python3
"""測試新增的三個 API 端點"""
import requests
import json

print("=" * 60)
print("測試新增的 API 端點")
print("=" * 60)

# 測試用的 group_id
test_group_id = "1"

# 1. 測試 group-policy-count API
print("\n【測試 1】/api/group-policy-count/")
print(f"  group_id = {test_group_id}")
try:
    response = requests.get(f"http://127.0.0.1:8000/api/group-policy-count/?group_id={test_group_id}")
    print(f"  狀態碼: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ 成功！")
        print(f"  回應: {json.dumps(data, ensure_ascii=False, indent=2)}")
    else:
        print(f"  ❌ 失敗！")
        print(f"  回應: {response.text}")
except Exception as e:
    print(f"  ❌ 錯誤: {e}")

# 2. 測試 group-clues-count API
print("\n【測試 2】/api/group-clues-count/")
print(f"  group_id = {test_group_id}")
try:
    response = requests.get(f"http://127.0.0.1:8000/api/group-clues-count/?group_id={test_group_id}")
    print(f"  狀態碼: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ 成功！")
        print(f"  回應: {json.dumps(data, ensure_ascii=False, indent=2)}")
    else:
        print(f"  ❌ 失敗！")
        print(f"  回應: {response.text}")
except Exception as e:
    print(f"  ❌ 錯誤: {e}")

# 3. 測試 completed-domains API
print("\n【測試 3】/api/completed-domains/")
print(f"  group_id = {test_group_id}")
try:
    response = requests.get(f"http://127.0.0.1:8000/api/completed-domains/?group_id={test_group_id}")
    print(f"  狀態碼: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ 成功！")
        print(f"  回應: {json.dumps(data, ensure_ascii=False, indent=2)}")
    else:
        print(f"  ❌ 失敗！")
        print(f"  回應: {response.text}")
except Exception as e:
    print(f"  ❌ 錯誤: {e}")

print("\n" + "=" * 60)
print("測試完成")
print("=" * 60)
