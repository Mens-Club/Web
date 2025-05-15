import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoadingPage.css';
import api from '../api/axios'; // axios 인스턴스 import만 유지

const iconPaths = ['icons/1.png', 'icons/2.png', 'icons/3.png', 'icons/4.png', 'icons/5.png', 'icons/6.png'];

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const LoadingPage = () => {
  const [icons, setIcons] = useState(shuffle(iconPaths));
  const [userName, setUserName] = useState('예<sup>**</sup>');
  const location = useLocation();
  const navigate = useNavigate();

  const [retryCount, setRetryCount] = useState(0);
  const [retryMessage, setRetryMessage] = useState('');

  // location.state에서 필요한 정보 추출
  const isFromCamera = location.state?.fromCamera || false;
  const returnPath = location.state?.returnPath || '/'; // 돌아갈 경로
  const loadingMessage = location.state?.message || null; // 커스텀 로딩 메시지
  const loadingTime = location.state?.loadingTime || 1200; // 기본 로딩 시간 (ms)

  useEffect(() => {
    const interval = setInterval(() => {
      setIcons(shuffle(iconPaths));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    async function fetchUserInfo() {
      try {
        const res = await api.get('/api/account/v1/user_info/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { username } = res.data;
        if (username) {
          setUserName(username);
        }
      } catch (error) {
        console.error('❌ 사용자 정보 불러오기 실패:', error);
      }
    }

    fetchUserInfo();
  }, []);

  useEffect(() => {
    // 카메라 페이지에서 넘어온 경우 이미지 분석 실행
    if (isFromCamera) {
      analyzeImage();
    } else {
      // 다른 페이지에서 넘어온 경우: 지정된 시간 후 returnPath로 이동
      const timer = setTimeout(() => {
        navigate(returnPath, {
          state: location.state?.dataToPass || {}, // 다음 페이지로 데이터 전달
        });
      }, loadingTime);

      return () => clearTimeout(timer);
    }
  }, [navigate, isFromCamera, returnPath, loadingTime, location.state]);

  // 이미지 분석 함수 (기존 코드 유지)
  const analyzeImage = async () => {
    const token = sessionStorage.getItem('accessToken');
    const imgSrc = sessionStorage.getItem('imgSrc');

    if (!imgSrc) {
      navigate('/camera'); // 이미지 없으면 되돌아감
      return;
    }

    // 재시도 관련 변수
    let currentRetryCount = 0;
    const maxRetries = 3;
    let success = false;

    while (currentRetryCount <= maxRetries && !success) {
      try {
        // 재시도 중인 경우 지수 백오프 적용
        if (currentRetryCount > 0) {
          console.log(
            `재시도 ${currentRetryCount} 진행 중... (백오프 지연: ${1000 * Math.pow(2, currentRetryCount - 1)}ms)`
          );
          // 상태 업데이트하여 UI에 재시도 메시지 표시
          setRetryCount(currentRetryCount);
          setRetryMessage(`재시도 중... (${currentRetryCount}/${maxRetries})`);

          // 지수 백오프 적용 (1초, 2초, 4초...)
          const delay = 1000 * Math.pow(2, currentRetryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // 1. Blob 변환
        const res = await fetch(imgSrc);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('image', blob, 'photo.jpg');

        // 2. 업로드
        const uploadRes = await fetch('http://localhost:8000/api/account/v1/upload-image/', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.detail || '이미지 업로드 실패');

        const imageUrl = uploadData.image_url;
        sessionStorage.setItem('capturedImageUrl', imageUrl);

        // 3. 분석 요청
        const recommendRes = await fetch('http://localhost:8000/api/recommend/v1/generator/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ image_url: imageUrl }),
        });

        // 서버 오류 확인
        if (recommendRes.status >= 500) {
          throw new Error(`서버 오류 (${recommendRes.status})`);
        }

        const recommendData = await recommendRes.json();
        if (!recommendRes.ok) throw new Error(recommendData.detail || '추천 요청 실패');

        // 4. 분석 결과 저장
        sessionStorage.setItem('recommendResult', JSON.stringify(recommendData));
        success = true; // 성공 플래그 설정

        // 5. 다시 카메라 페이지로 이동
        // 성공 시 재시도 메시지 초기화
        setRetryCount(0);
        setRetryMessage('');
        navigate('/camera', { replace: true });
      } catch (err) {
        console.error(`시도 ${currentRetryCount + 1}/${maxRetries + 1} 실패:`, err);

        if (currentRetryCount === maxRetries) {
          setRetryCount(0);
          setRetryMessage('');
          navigate('/camera', {
            state: { error: '상품 인식에 실패했습니다. 다른 이미지로 다시 시도해주세요.' },
          });
          return;
        }
        currentRetryCount++;
      }
    }
  };

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-title">
          {loadingMessage ? (
            loadingMessage
          ) : isFromCamera ? (
            <>
              <span dangerouslySetInnerHTML={{ __html: userName }}></span>의<br />
              코디는…
            </>
          ) : (
            '로딩중...'
          )}
        </div>
        <div className="icon-grid" id="iconGrid">
          {icons.map((src, idx) => (
            <div className="icon-cell" key={idx}>
              <img src={src} alt={`아이콘 ${idx + 1}`} width="38" height="38" />
            </div>
          ))}
        </div>
        {retryCount > 0 && <div className="retry-message">{retryMessage}</div>}
      </div>
    </div>
  );
};

export default LoadingPage;
