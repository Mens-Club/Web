from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

User = get_user_model() 

class Recommendation(models.Model):
    """추천 정보를 저장하는 기본 테이블"""
    id = models.AutoField(primary_key=True)
    
    # 추천 고유 코드 - 자동 생성
    recommendation_code = models.CharField(
        max_length=50, 
        unique=True, 
        editable=False,
        default=''
    )
    
    # 사용자 정보
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    
    top_id = models.IntegerField(null=True, blank=True)
    bottom_id = models.IntegerField(null=True, blank=True)
    outer_id = models.IntegerField(null=True, blank=True)
    shoes_id = models.IntegerField(null=True, blank=True)
        
    # AI 응답 정보
    answer = models.TextField(help_text="AI가 제공한 분석 응답")
    
    # 생성 시간
    created_at = models.DateTimeField(default=timezone.now)
    style = models.CharField(max_length=50, null=True, blank=True, help_text="선택된 스타일 (미니멀, 캐주얼 2개 택)")
    
    
    total_price = models.IntegerField(null=True, blank=True)
    
    
    
    class Meta:
        db_table = 'recommend_recommendation'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.recommendation_code:
            self.recommendation_code = str(uuid.uuid4())
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"추천 {self.id} - 사용자: {self.user.username}"


class RecommendationBookmark(models.Model):
    
    id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name="recommendation_bookmarks"
    )
    
    recommendation = models.ForeignKey(
        Recommendation,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )

    # 북마크 생성 시간
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'recommend_bookmark'
        # 사용자와 추천의 조합이 유일하도록 제약 설정
        unique_together = ('user', 'recommendation')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}의 추천 {self.recommendation.id} 북마크"