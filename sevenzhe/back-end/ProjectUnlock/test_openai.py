"""
測試 OpenAI API 是否正常工作
"""
import os
import sys
import django

# 設置 Django 環境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ProjectUnlock.settings')
django.setup()

from backEnd.views import get_openai_client

def test_simple_chat():
    """測試簡單的對話功能"""
    print("=" * 60)
    print("測試 1: 簡單對話")
    print("=" * 60)
    
    try:
        client = get_openai_client()
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # 使用較便宜的模型測試
            messages=[
                {
                    "role": "user",
                    "content": "請用一句話回答：1+1等於多少？"
                }
            ],
            max_tokens=50
        )
        
        answer = response.choices[0].message.content
        print(f"✓ API 回應成功！")
        print(f"問題: 1+1等於多少？")
        print(f"回答: {answer}")
        print()
        return True
        
    except Exception as e:
        print(f"✗ API 調用失敗: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_function_calling():
    """測試 Function Calling（海龜湯遊戲使用的功能）"""
    print("=" * 60)
    print("測試 2: Function Calling (海龜湯遊戲模式)")
    print("=" * 60)
    
    try:
        client = get_openai_client()
        
        story_question = "一個男人走進餐廳，點了一碗海龜湯。喝了一口後，他衝出餐廳自殺了。為什麼？"
        story_answer = "男人曾在海上遇難，同伴餵他吃的「海龜肉」其實是他妻子的肉。現在喝到真正的海龜湯，他意識到真相，悲痛欲絕而自殺。"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"""你是海龜湯遊戲的GM。

【核心規則】
1. 只能透過 game_response 函數回應
2. 根據玩家問題與湯底比對，選擇適當的 answer
3. 當玩家的推論已完整描述出湯底的核心真相時，設定 reveal_truth 為 true 並選擇「答對」

湯面：{story_question}
湯底：{story_answer}"""
                },
                {
                    "role": "user",
                    "content": "這個男人是在船上嗎？"
                }
            ],
            tools=[{
                "type": "function",
                "function": {
                    "name": "game_response",
                    "description": "回應玩家的海龜湯問題",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "answer": {
                                "type": "string",
                                "enum": ["是", "否", "與故事無關", "答對"],
                                "description": "對玩家問題的回應"
                            },
                            "reveal_truth": {
                                "type": "boolean",
                                "description": "玩家是否已猜出湯底核心真相"
                            }
                        },
                        "required": ["answer", "reveal_truth"]
                    }
                }
            }],
            tool_choice={"type": "function", "function": {"name": "game_response"}},
            temperature=0,
            max_tokens=100
        )
        
        tool_call = response.choices[0].message.tool_calls[0]
        
        if tool_call and tool_call.function.name == "game_response":
            import json
            result = json.loads(tool_call.function.arguments)
            
            print(f"✓ Function Calling 成功！")
            print(f"問題: 這個男人是在船上嗎？")
            print(f"回答: {result.get('answer')}")
            print(f"是否答對: {result.get('reveal_truth')}")
            print()
            return True
        else:
            print(f"✗ Function Calling 失敗: 沒有返回預期的函數調用")
            return False
            
    except Exception as e:
        print(f"✗ Function Calling 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("\n" + "=" * 60)
    print("OpenAI API 測試程序")
    print("=" * 60)
    print()
    
    # 測試 1: 簡單對話
    test1_pass = test_simple_chat()
    
    # 測試 2: Function Calling
    test2_pass = test_function_calling()
    
    # 總結
    print("=" * 60)
    print("測試總結")
    print("=" * 60)
    print(f"簡單對話測試: {'✓ 通過' if test1_pass else '✗ 失敗'}")
    print(f"Function Calling 測試: {'✓ 通過' if test2_pass else '✗ 失敗'}")
    print()
    
    if test1_pass and test2_pass:
        print("🎉 所有測試通過！OpenAI API 運作正常！")
        return 0
    else:
        print("⚠️  部分測試失敗，請檢查錯誤訊息")
        return 1


if __name__ == "__main__":
    sys.exit(main())
