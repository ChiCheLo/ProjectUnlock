#!/usr/bin/env python3
"""測試已完成域的查詢邏輯"""
import requests
import json

print("=" * 60)
print("測試已完成域查詢")
print("=" * 60)

# 測試不同的 group_id
test_groups = ["1", "2", "3"]

for group_id in test_groups:
    print(f"\n【測試 group_id = {group_id}】")
    try:
        response = requests.get(f"http://127.0.0.1:8000/api/completed-domains/?group_id={group_id}")
        
        if response.status_code == 200:
            data = response.json()
            completed = data.get('completed_domains', [])
            print(f"  ✅ 成功")
            print(f"  已完成域數量: {len(completed)}")
            if completed:
                print(f"  已完成域列表: {', '.join(completed)}")
            else:
                print(f"  尚無完成的域")
        else:
            print(f"  ❌ 失敗 (狀態碼: {response.status_code})")
            print(f"  回應: {response.text}")
    except Exception as e:
        print(f"  ❌ 錯誤: {e}")

print("\n" + "=" * 60)

# 測試查詢詳細資料
print("\n【檢查資料庫關聯】")
print("測試 SQL 查詢邏輯...")

import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

try:
    # 連接資料庫
    db_config = {
        'host': 'localhost',
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'projectunlock')
    }
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # 查詢 group_id = 1 的詳細資料
    query = """
        SELECT gp.group_id, p.policy_id, p.policy_title, s.soup_id, s.soup_title
        FROM groupPolicy_table gp
        INNER JOIN policy_table p ON gp.policy_id = p.policy_id
        INNER JOIN soup_table s ON p.soup_id = s.soup_id
        WHERE gp.group_id = 1
        ORDER BY s.soup_title
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    print(f"\n找到 {len(rows)} 筆資料：")
    print("-" * 80)
    print(f"{'組別ID':<8} {'政策ID':<8} {'政策名稱':<30} {'湯ID':<8} {'湯標題（域）':<15}")
    print("-" * 80)
    
    for row in rows:
        print(f"{row[0]:<8} {row[1]:<8} {row[2]:<30} {row[3]:<8} {row[4]:<15}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"資料庫連接失敗: {e}")

print("\n" + "=" * 60)
