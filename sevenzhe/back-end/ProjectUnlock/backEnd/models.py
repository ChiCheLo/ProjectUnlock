from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    """學生表"""
    student_id = models.AutoField(primary_key=True)
    account = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    student_name = models.CharField(max_length=100)
    group_id = models.IntegerField()

    def __str__(self):
        return f"{self.student_name} ({self.account})"

    class Meta:
        db_table = 'student_table'
        managed = False  # 不讓 Django 管理這個表


class GameDomain(models.Model):
    """遊戲領域"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    question = models.TextField()  # 湯面
    answer = models.TextField()    # 湯底
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class GameRecord(models.Model):
    """遊戲紀錄"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    domain = models.ForeignKey(GameDomain, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.domain.name}"

    class Meta:
        ordering = ['-created_at']


class Leaderboard(models.Model):
    """排行榜"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='leaderboard')
    total_points = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.total_points} points"

    class Meta:
        ordering = ['-total_points']


class ChatMessage(models.Model):
    """聊天消息記錄"""
    game_record = models.ForeignKey(GameRecord, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=[('player', 'Player'), ('ai', 'AI')])
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.text[:50]}"

    class Meta:
        ordering = ['created_at']


class Policy(models.Model):
    """政策表"""
    policy_id = models.IntegerField(primary_key=True)
    policy_title = models.TextField()
    economy = models.IntegerField()
    population = models.IntegerField()
    healthy = models.IntegerField()
    food = models.IntegerField()
    electricity = models.IntegerField()
    policycard_id = models.TextField()

    class Meta:
        db_table = 'policy_table'
        managed = False


class GroupPolicy(models.Model):
    """組別政策關聯表"""
    group_id = models.IntegerField()
    policy_id = models.IntegerField()

    class Meta:
        db_table = 'groupPolicy_table'
        managed = False


class Question(models.Model):
    """題目表"""
    question_id = models.IntegerField(primary_key=True)
    question_level = models.IntegerField()
    subject = models.TextField()
    content = models.TextField()
    answer = models.TextField()

    class Meta:
        db_table = 'question_table'
        managed = False