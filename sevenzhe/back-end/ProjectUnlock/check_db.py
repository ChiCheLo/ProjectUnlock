#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ProjectUnlock.settings')
sys.path.insert(0, '/Users/luoqizhe/假裝是D槽/論文/破解安洛克/ProjectUnlock/sevenzhe/back-end/ProjectUnlock')

django.setup()

from django.db import connection
from django.db.utils import OperationalError

def check_database_connection():
    """檢查資料庫連接狀態"""
    try:
        # 嘗試獲取資料庫連接
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        print("✅ 資料庫連接成功!")
        print(f"資料庫引擎: {connection.settings_dict['ENGINE']}")
        print(f"資料庫名稱: {connection.settings_dict['NAME']}")
        print(f"資料庫主機: {connection.settings_dict['HOST']}")
        print(f"資料庫埠號: {connection.settings_dict['PORT']}")
        return True
        
    except OperationalError as e:
        print(f"❌ 資料庫連接失敗!")
        print(f"錯誤信息: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ 未知錯誤: {str(e)}")
        return False

if __name__ == '__main__':
    check_database_connection()
