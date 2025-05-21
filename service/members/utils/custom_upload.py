from datetime import datetime


def user_upload_path(instance, filename):
    """
    사용자별 고유 폴더에 파일 저장 경로를 동적으로 생성하는 함수
    예: user_uploads/1/clothes_img.jpg
    """
    # instance.id가 없을 수 있으므로(새 사용자 생성 시) 조건부 처리
    user_id = instance.user.id
    # 파일 확장자 추출
    ext = filename.split(".")[-1]

    # 타임스탬프 추가하여 파일명 충돌 방지
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # 새 파일명 생성
    new_filename = f"{timestamp}.{ext}"

    # 최종 경로 반환
    return f"user_uploads/{user_id}/{new_filename}"
