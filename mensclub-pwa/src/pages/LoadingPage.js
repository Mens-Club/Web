import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoadingPage.css';
import api from '../api/axios'; // axios 인스턴스 import만 유지
import Modal from '../components/Modal';
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
  const [userName, setUserName] = useState('예<sup>**</sup>');
  const location = useLocation();
  const navigate = useNavigate();

  const [retryCount, setRetryCount] = useState(0);
  const [retryMessage, setRetryMessage] = useState('');

  // 수정: URL 쿼리 파라미터와 state를 함께 사용하여 안정성 향상
  const searchParams = new URLSearchParams(location.search);
  const queryReturnPath = searchParams.get('returnPath');

  // state가 있으면 state 사용, 없으면 URL 파라미터 사용, 둘 다 없으면 기본값 '/'
  const isFromCamera = location.state?.fromCamera || false;
  const returnPath = location.state?.returnPath || queryReturnPath || null; // '/' 대신 null로 수정

  const loadingMessage = location.state?.message || null;

  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
    navigate('/camera');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIcons(shuffle(iconPaths));
    }, 400);

    return () => clearInterval(interval);
  }, []);

//   useEffect(() => {
//   if (isEmbedded) return;

//   if (isFromCamera) {
//     analyzeImage();
//   } else {
//     // 🔥 문제 원인: returnPath가 무조건 '/' 또는 '/camera'가 될 수 있음
//     if (location.state?.dataToPass) {
//       sessionStorage.setItem('tempDataToPass', JSON.stringify(location.state.dataToPass));
//     }

//     // ✅ 해결: returnPath가 명확히 지정되어 있는 경우에만 타이머 작동
//     if (returnPath && returnPath !== '/camera') {
//       const timer = setTimeout(() => {
//         const dataToPass = sessionStorage.getItem('tempDataToPass')
//           ? JSON.parse(sessionStorage.getItem('tempDataToPass'))
//           : {};

//         sessionStorage.removeItem('tempDataToPass');

//         navigate(returnPath, {
//           state: dataToPass,
//           replace: true,
//         });
//       }, 1200); // 또는 loadingTime

//       return () => clearTimeout(timer);
//     }
//   }
// }, [navigate, isFromCamera, returnPath, location.state, location.search, isEmbedded]);


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

  // useEffect(() => {
  //   if (isEmbedded) return;
  //   // 카메라 페이지에서 넘어온 경우 이미지 분석 실행
  //   if (isFromCamera) {
  //     analyzeImage();
  //   } else {
  //     // 다른 페이지에서 넘어온 경우: 지정된 시간 후 returnPath로 이동

  //     // 수정: 데이터를 세션 스토리지에 임시 저장
  //     if (location.state?.dataToPass) {
  //       sessionStorage.setItem('tempDataToPass', JSON.stringify(location.state.dataToPass));
  //     }

  //     const timer = setTimeout(() => {
  //       // 수정: 세션 스토리지에서 데이터를 가져와 state로 전달
  //       const dataToPass = sessionStorage.getItem('tempDataToPass')
  //         ? JSON.parse(sessionStorage.getItem('tempDataToPass'))
  //         : {};

  //       // 데이터 전달 후 세션 스토리지에서 제거
  //       sessionStorage.removeItem('tempDataToPass');

  //       // 수정: replace 옵션 추가하여 불필요한 히스토리 스택 방지
  //       navigate(returnPath, {
  //         state: dataToPass,
  //         replace: true,
  //       });
  //     }, );

  //     return () => clearTimeout(timer);
  //   }
  // }, [navigate, isFromCamera, returnPath, , location.state, location.search, isEmbedded]);

  useEffect(() => {
  if (isEmbedded) return;

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
    const token = sessionStorage.getItem('accessToken');
    const imgSrc = sessionStorage.getItem('imgSrc');

    // 문제 원인 4: 이미지가 없을 때 처리 미흡
    if (!imgSrc) {
      // 수정: 사용자에게 알림 후 리다이렉트
      alert('이미지를 찾을 수 없습니다. 카메라 페이지로 이동합니다.');
      navigate('/camera', { replace: true }); // replace: true로 설정
      return;
    }

    // 재시도 관련 변수
    let currentRetryCount = 0;
    const maxRetries = 3;
    let success = false;

    // 문제 원인 5: 에러 처리 미흡
    // 수정: try-catch 블록을 while 루프 밖으로 이동하여 전체 프로세스 보호
    try {
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

          const uploadRes = await fetch('http://localhost:8000/api/account/v1/upload-image/', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
            signal: uploadController.signal,
          });

          clearTimeout(uploadTimeoutId);

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.detail || '이미지 업로드 실패');

          const imageUrl = uploadData.image_url;
          sessionStorage.setItem('capturedImageUrl', imageUrl);

          // 3. 분석 요청 - 타임아웃 설정 추가
          const recommendController = new AbortController();
          const recommendTimeoutId = setTimeout(() => recommendController.abort(), 20000); // 20초 타임아웃

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

          const recommendData = await recommendRes.json();
          if (!recommendRes.ok) throw new Error(recommendData.detail || '추천 요청 실패');

          // 4. 분석 결과 저장
          sessionStorage.setItem('recommendResult', JSON.stringify(recommendData));
          success = true; // 성공 플래그 설정

          // 5. 이동 경로 조건부 처리
          setRetryCount(0);
          setRetryMessage('');
          if (returnPath === '/camera' || !returnPath) {
            navigate('/camera', { replace: true });
          } else {
            navigate(returnPath, { replace: true });
          }

        } catch (err) {
          console.error(`시도 ${currentRetryCount + 1}/${maxRetries + 1} 실패:`, err);

          // AbortError(타임아웃) 처리
          if (err.name === 'AbortError') {
            console.error('요청 타임아웃 발생');
          }

          if (currentRetryCount === maxRetries) {
            setRetryCount(0);
            setRetryMessage('');
            setModalMessage('상품 인식에 실패했습니다. 다시한번 시도해주세요.🙏');
            setModalOpen(true);
            return;
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
    }
  };

 return (
  <div className="loading-container">
    <div className="loading-content">
      <div
        className={`loading-title ${
          !loadingMessage && !isFromCamera ? 'only-loading' : ''
        }`}
      >
        {loadingMessage ? (
          loadingMessage
        ) : isFromCamera ? (
          <>
            <span dangerouslySetInnerHTML={{ __html: userName }}></span>님의 <br />
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

    {/* 모달 컴포넌트 */}
    <ConfirmModal
      isOpen={modalOpen}
      onCancel={() => setModalOpen(false)}
      onConfirm={() => {
        setModalOpen(false);
        navigate('/camera');
      }}
      title="추천 실패"
      message={modalMessage}
    />
  </div>
);
};

export default LoadingPage;