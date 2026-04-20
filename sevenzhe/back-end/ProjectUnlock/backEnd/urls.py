from django.urls import path
from . import views

app_name = 'backEnd'

urlpatterns = [
    # 狀態檢查 API
    path('status/', views.status, name='status'),
    
    # 登入 API
    path('login/', views.student_login, name='student_login'),
    
    # OpenAI Chat API
    path('openai/', views.openai_chat, name='openai_chat'),
    
    # Game Data APIs
    path('country-status/', views.get_country_status, name='get_country_status'),
    path('leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    
    # 組別 API
    path('group-members/', views.get_group_members, name='get_group_members'),
    path('group-values/', views.get_group_values, name='get_group_values'),
    path('group-policies/', views.get_group_policies, name='get_group_policies'),
    path('student-clues/', views.get_student_clues, name='get_student_clues'),
    
    # 題目 API
    path('quiz-questions/', views.get_quiz_questions, name='get_quiz_questions'),
    
    # 調試 API
    path('debug/clues-table/', views.debug_clues_table, name='debug_clues_table'),
]
