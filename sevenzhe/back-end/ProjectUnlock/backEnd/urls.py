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
    path('domain-story/', views.get_domain_story, name='get_domain_story'),
    
    # Game Data APIs
    path('country-status/', views.get_country_status, name='get_country_status'),
    path('leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    
    # 組別 API
    path('group-members/', views.get_group_members, name='get_group_members'),
    path('group-values/', views.get_group_values, name='get_group_values'),
    path('my-group-coin/', views.get_my_group_coin, name='get_my_group_coin'),
    path('group-policies/', views.get_group_policies, name='get_group_policies'),
    path('group-policy-count/', views.get_group_policy_count, name='get_group_policy_count'),
    path('group-clues-count/', views.get_group_clues_count, name='get_group_clues_count'),
    path('completed-domains/', views.get_completed_domains, name='get_completed_domains'),
    path('student-clues/', views.get_student_clues, name='get_student_clues'),
    
    # 題目 API
    path('quiz-questions/', views.get_quiz_questions, name='get_quiz_questions'),
    path('quiz-answer-check/', views.quiz_answer_check, name='quiz_answer_check'),
    path('answer-record/', views.save_answer_record, name='save_answer_record'),
    path('session-exhausted-questions/', views.get_session_exhausted_questions, name='get_session_exhausted_questions'),
    path('my-correct-questions/', views.get_my_correct_questions, name='get_my_correct_questions'),
    path('session-leaderboard/', views.get_session_leaderboard, name='get_session_leaderboard'),
    path('session-subject-leaderboard/', views.get_session_subject_leaderboard, name='get_session_subject_leaderboard'),
    path('save-group-policy/', views.save_group_policy, name='save_group_policy'),
    path('grant-domain-entry-clues/', views.grant_domain_entry_clues, name='grant_domain_entry_clues'),
    path('save-chat/', views.save_chat, name='save_chat'),
    
    # 遊戲模式控制 API（管理員專用）
    path('mode-status/', views.get_mode_status, name='get_mode_status'),
    path('mode-control/', views.set_mode_control, name='set_mode_control'),

    # 網頁操作 Log
    path('web-log/', views.save_web_log, name='save_web_log'),

    # 管理員用：取得 active sessions 與線索分配
    path('active-sessions/', views.get_active_sessions, name='get_active_sessions'),
    path('assign-clues/', views.assign_clues, name='assign_clues'),

    # 調試 API
    path('debug/clues-table/', views.debug_clues_table, name='debug_clues_table'),
]
