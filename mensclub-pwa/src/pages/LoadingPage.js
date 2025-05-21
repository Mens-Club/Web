import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoadingPage.css';
import api from '../api/axios'; // axios 인스턴스 import만 유지
import ConfirmModal from '../components/ConfirmModal';

const iconPaths = ['icons/1.png', 'icons/2.png', 'icons/3.png', 'icons/4.png', 'icons/5.png', 'icons/6.png'];

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const LoadingPage = ({ isEmbedded = false }) => {
  const [icons, setIcons] = useState(shuffle(iconPaths));
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isAnalyzingRef = useRef(false);

  const [retryCount, setRetryCount] = useState(0);
  const [retryMessage, setRetryMessage] = useState('');

  // 수정: URL 쿼리 파라미터와 state를 함께 사용하여 안정성 향상
  const searchParams = new URLSearchParams(location.search);
  const queryReturnPath = searchParams.get('returnPath');

  // state가 있으면 state 사용, 없으면 URL 파라미터 사용, 둘 다 없으면 기본값 '/'
  const isFromCamera = location.state?.fromCamera || false;
  const returnPath = location.state?.returnPath || queryReturnPath || null; // '/' 대신 null로 수정

  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
    // 세션 스토리지 정리 (추가)
    sessionStorage.removeItem('imgSrc');
    sessionStorage.removeItem('cameraStep');
    sessionStorage.removeItem('captureSuccess');
    sessionStorage.removeItem('analysisCompleted');
    // 카메라 페이지로 이동
    navigate('/camera', { replace: true });
  };

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
    if (isEmbedded || !isFromCamera) return;

    if (isFromCamera) {
      analyzeImage(); // ❗여기만 남기고 아래쪽 useEffect 제거
    } else {
      if (location.state?.dataToPass) {
        sessionStorage.setItem('tempDataToPass', JSON.stringify(location.state.dataToPass));
      }

      if (returnPath && returnPath !== '/camera') {
        const timer = setTimeout(() => {
          const dataToPass = sessionStorage.getItem('tempDataToPass')
            ? JSON.parse(sessionStorage.getItem('tempDataToPass'))
            : {};

          sessionStorage.removeItem('tempDataToPass');

          navigate(returnPath, {
            state: dataToPass,
            replace: true,
          });
        }, 1200); // ⏳ 설정된 타이머 시간

        return () => clearTimeout(timer);
      }
    }
  }, [navigate, isFromCamera, returnPath, location.state, location.search, isEmbedded]);

  // 이미지 분석 함수 수정
  const analyzeImage = async () => {
    if (isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;

    try {
      const token = sessionStorage.getItem('accessToken');
      const imgSrc = sessionStorage.getItem('imgSrc');

      // 이미지 유효성 검사 강화
      if (!imgSrc || imgSrc === 'null' || imgSrc === 'undefined') {
        alert('이미지를 찾을 수 없습니다. 카메라 페이지로 이동합니다.');
        // 세션 스토리지 정리 (잘못된 이미지 데이터 삭제)
        sessionStorage.removeItem('imgSrc');
        sessionStorage.removeItem('cameraStep');
        sessionStorage.removeItem('captureSuccess');

        navigate('/camera', { replace: true });
        isAnalyzingRef.current = false; // 분석 플래그 해제
        return;
      }

      // 이미 분석이 완료되었는지 확인
      const analysisCompleted = sessionStorage.getItem('analysisCompleted') === 'true';
      if (analysisCompleted) {
        const recommendData = JSON.parse(sessionStorage.getItem('recommendResult'));
        if (recommendData) {
          // 이미 분석이 완료된 경우 패션 페이지로 이동
          navigate('/camera', { replace: true });
          isAnalyzingRef.current = false; // 분석 플래그 해제
          return;
        }
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

          // 2. 업로드 - 타임아웃 설정 추가
          const uploadController = new AbortController();
          const uploadTimeoutId = setTimeout(() => uploadController.abort(), 15000); // 15초 타임아웃

          // const uploadRes = await fetch('https://mensclub-backend.store/api/account/v1/upload-image/', {
          const uploadRes = await fetch('http://localhost:8000/api/account/v1/upload-image/', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
            signal: uploadController.signal,
          });

          clearTimeout(uploadTimeoutId);

          if (!uploadRes.ok) {
            const uploadData = await uploadRes.json();
            throw new Error(uploadData.detail || '이미지 업로드 실패');
          }

          const uploadData = await uploadRes.json();
          const imageUrl = uploadData.image_url;
          sessionStorage.setItem('capturedImageUrl', imageUrl);

          // 3. 분석 요청 - 타임아웃 설정 추가
          const recommendController = new AbortController();
          const recommendTimeoutId = setTimeout(() => recommendController.abort(), 20000); // 20초 타임아웃

          // const recommendRes = await fetch('https://mensclub-backend.store/api/recommend/v1/generator/', {
          const recommendRes = await fetch('http://localhost:8000/api/recommend/v1/generator/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ image_url: imageUrl }),
            signal: recommendController.signal,
          });

          clearTimeout(recommendTimeoutId);

          // 서버 오류 확인
          if (recommendRes.status >= 500) {
            throw new Error(`서버 오류 (${recommendRes.status})`);
          }

          if (!recommendRes.ok) {
            const recommendData = await recommendRes.json();
            throw new Error(recommendData.detail || '추천 요청 실패');
          }

          const recommendData = await recommendRes.json();

          // 결과 유효성 검사 (빈 결과인지 확인)
          if (
            !recommendData ||
            !recommendData.product_combinations ||
            recommendData.product_combinations.length === 0
          ) {
            throw new Error('유효하지 않은 추천 결과');
          }

          // 4. 분석 결과 저장
          sessionStorage.setItem('analysisCompleted', 'true');
          sessionStorage.setItem('recommendResult', JSON.stringify(recommendData));
          sessionStorage.setItem('recommendationData', JSON.stringify(recommendData));

          // 불필요한 세션 데이터 정리
          sessionStorage.removeItem('cameraStep');

          success = true; // 성공 플래그 설정
          setRetryCount(0);
          setRetryMessage('');

          // 5. 이동 경로 조건부 처리
          navigate('/camera', { replace: true }); // 항상 패션 페이지로 이동하도록 수정
          break; // 성공했으므로 반복문 종료
        } catch (err) {
          console.error(`시도 ${currentRetryCount + 1}/${maxRetries + 1} 실패:`, err);

          // AbortError(타임아웃) 처리
          if (err.name === 'AbortError') {
            console.error('요청 타임아웃 발생');
          }

          // 마지막 시도인 경우
          if (currentRetryCount === maxRetries) {
            // 모든 재시도 실패 시 처리
            setRetryCount(0);
            setRetryMessage('');
            setModalMessage('상품 인식에 실패했습니다. \n\n다시한번 시도해주세요.🙏');
            setModalOpen(true);

            // 실패 시 세션 스토리지 정리 (추가)
            sessionStorage.removeItem('imgSrc');
            sessionStorage.removeItem('cameraStep');
            sessionStorage.removeItem('captureSuccess');
            sessionStorage.removeItem('analysisCompleted');

            break; // 최대 재시도 횟수 도달, 반복문 종료
          }

          currentRetryCount++;
        }
      }
    } catch (finalError) {
      // 전체 프로세스 실패 시 처리
      console.error('이미지 분석 프로세스 전체 실패:', finalError);
      setRetryCount(0);
      setRetryMessage('');
      setModalMessage('예기치 않은 오류가 발생했습니다. 다시 시도해주세요.');
      setModalOpen(true);

      // 실패 시 세션 스토리지 정리 (추가)
      sessionStorage.removeItem('imgSrc');
      sessionStorage.removeItem('cameraStep');
      sessionStorage.removeItem('captureSuccess');
      sessionStorage.removeItem('analysisCompleted');
    } finally {
      // 분석 완료 후 플래그 해제
      isAnalyzingRef.current = false;
    }
  };

  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* 🔻 여기서부터 문구 + 아이콘을 감싸는 컨테이너 분기 */}
        {isFromCamera ? (
          <div className="camera-loading-box">
            <div className="camera-title">
              <span dangerouslySetInnerHTML={{ __html: userName }}></span>님의 <br />
              코디는…
            </div>
            <div className="icon-grid icon-grid-camera">
              {icons.map((src, id) => (
                <div className="icon-cell" key={id}>
                  <img src={src} alt={`아이콘 ${id + 1}`} width="38" height="38" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mypage-loading-box">
            <div className="basic-loading-title">로딩중...</div>
            <div className="icon-grid icon-grid-basic">
              {icons.map((src, id) => (
                <div className="icon-cell" key={id}>
                  <img src={src} alt={`아이콘 ${id + 1}`} width="38" height="38" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 재시도 메시지 */}
        {retryCount > 0 && <div className="retry-message">{retryMessage}</div>}
      </div>

      {/* 모달 */}
      <ConfirmModal
        isOpen={modalOpen}
        onCancel={handleCloseModal}
        onConfirm={handleCloseModal}
        title="추천 실패"
        message={modalMessage}
      />
    </div>
  );
};
export default LoadingPage;
