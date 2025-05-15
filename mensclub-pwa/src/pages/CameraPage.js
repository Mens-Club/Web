import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam'; //웹캠 구현을 위한 라이브러리 설치
import '../styles/CameraPage.css';
import '../styles/Layout.css';
import { Link, useParams, useNavigate } from 'react-router-dom';

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user', // 기본 전면
};

function CameraPage() {
  // 상태 변수 추가 (컴포넌트 최상단)
  const [cameraReady, setCameraReady] = useState(false);
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [step, setStep] = useState('init');
  const navigate = useNavigate();

  const [recommendResult, setRecommendResult] = useState(null); // 추천 결과

  // 카메라가 준비되면 호출하는 콜백 함수
  const handleUserMedia = useCallback(() => {
    setCameraReady(true);
    setStatusText(''); // 카메라가 준비되면 상태 메시지 지우기
  }, []);

  // 사진 촬영
  const capture = useCallback(() => {
    if (!webcamRef.current || !cameraReady) {
      setStatusText('카메라가 로딩중입니다. 잠시만 기다려주세요 🙏');
      return;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setStatusText('카메라가 로딩중입니다. 잠시만 기다려주세요 🙏');
        return;
      }
      setImgSrc(imageSrc);
      setStep('preview');
      setStatusText('');
    } catch (error) {
      console.error('스크린샷 캡처 오류:', error);
      setStatusText('카메라 사용 중 오류가 발생했습니다.');
    }
  }, [cameraReady]);

  // 재촬영
  const retake = () => {
    setImgSrc(null);
    setStep('capture');
    setStatusText('');
    setRecommendResult(null);
  };

  // 사진을 서버에 전송 및 분석 결과 받기
  // 이미지 업로드 → 추천 요청 흐름
  const sendToServer = async () => {
    if (!imgSrc) {
      setStatusText('이미지가 저장되지 않았어요. 재 촬영 부탁드려요');
      return;
    }
    setLoading(true);
    setStatusText('');
    const token = sessionStorage.getItem('accessToken');

    // 재시도 관련 변수
    let retryCount = 0;
    const maxRetries = 3;
    let success = false;
    console.log('재시도 로직 시작: 최대 시도 횟수 =', maxRetries);

    while (retryCount <= maxRetries && !success) {
      try {
        // 재시도 중인 경우 메시지 표시
        if (retryCount > 0) {
          console.log(`재시도 ${retryCount} 진행 중... (백오프 지연: ${1000 * Math.pow(2, retryCount - 1)}ms)`);
          setStatusText(`재시도 중... (${retryCount}/${maxRetries})`);
          // 지수 백오프 적용 (1초, 2초, 4초...)
          const delay = 1000 * Math.pow(2, retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        // 1. 이미지 blob으로 변환
        const res = await fetch(imgSrc);
        const blob = await res.blob();

        // 2. 이미지 업로드 요청
        const formData = new FormData();
        formData.append('image', blob, 'photo.jpg');

        const uploadRes = await fetch('http://localhost:8000/api/account/v1/upload-image/', {
          method: 'POST',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData?.detail || '이미지 업로드 실패');
        }

        const imageUrl = uploadData.image_url;
        // 이미지 URL을 세션스토리지에 저장
        sessionStorage.setItem('capturedImageUrl', imageUrl);

        // 3. 업로드된 이미지 기반 추천 요청
        const recommendRes = await fetch('http://localhost:8000/api/recommend/v1/generator/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            image_url: imageUrl,
          }),
        });

        // 응답 상태 코드 확인
        if (recommendRes.status >= 500) {
          throw new Error(`서버 오류 (${recommendRes.status})`);
        }

        const recommendData = await recommendRes.json();

        if (!recommendRes.ok) {
          throw new Error(recommendData?.detail || '추천 요청 실패');
        }

        // 4. 추천 결과 출력
        console.log('추천 결과:', recommendData);
        setRecommendResult(recommendData);
        setStep('analyzed');
        success = true; // 성공 플래그 설정
      } catch (error) {
        console.error(`시도 ${retryCount + 1}/${maxRetries + 1} 실패:`, error);

        // 마지막 시도였다면 오류 메시지 표시
        if (retryCount === maxRetries) {
          setStatusText('상품 인식에 실패했습니다. 다른 이미지로 다시 시도해주세요.');
          break;
        }

        retryCount++;
      }
    }

    setLoading(false);
  };

  // 패션 추천 페이지로 이동 (전체 데이터 전달)
  const goToFashionPage = () => {
    // 상태를 통해 데이터를 전달하거나, 로컬 스토리지 사용
    sessionStorage.setItem('recommendationData', JSON.stringify(recommendResult));
    navigate('/fashion');
  };

  // 카메라 전환
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // 초기화 버튼
  const goInit = () => {
    setImgSrc(null);
    setStep('init');
    setStatusText('');
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="camera-content">
        <div className="title-wrapper">
          <h1>오늘 입을 옷을 촬영해주세요 📸</h1>
        </div>
        <div className="upload-box">
          {/* 초기 상태: SVG 카메라 버튼 */}
          {step === 'init' && (
            <button className="camera-button" onClick={() => setStep('capture')}>
              {/* SVG 아이콘 그대로 유지 */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="13" r="3" />
                <path d="M5 7h2l2-2h6l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2" />
              </svg>
            </button>
          )}

          {/* 촬영/미리보기/분석 결과 화면 */}
          {step === 'capture' && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="camera-stream"
              videoConstraints={{ ...videoConstraints, facingMode }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
              onUserMedia={handleUserMedia}
            />
          )}
          {step !== 'capture' && imgSrc && (
            <img
              src={imgSrc}
              alt="preview"
              className="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          )}
        </div>
        {/* 버튼은 항상 upload-box 아래에 분리해서 배치 */}
        <div className="button-container">
          {step === 'capture' && (
            <>
              <button className="camera-upload-text-btn" onClick={capture}>
                사진 촬영
              </button>
              <button className="camera-upload-text-btn" onClick={switchCamera}>
                카메라 전환
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button className="camera-upload-text-btn" onClick={retake}>
                다시 찍기
              </button>
              <button className="camera-upload-text-btn" onClick={sendToServer} disabled={!imgSrc}>
                추천 시작하기
              </button>
            </>
          )}
          {step === 'analyzed' && (
            <>
              <button className="camera-upload-text-btn" onClick={retake}>
                다시 찍기
              </button>
              <button className="camera-upload-text-btn" onClick={goToFashionPage}>
                추천 코디보기
              </button>
            </>
          )}
        </div>
        {/* 상태/로딩 메시지 */}
        {step !== 'init' && (
          <div className="camera-upload-status ">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>이미지 분석 중...</p>
                <br />
                {statusText && <p className="status-message">{statusText}</p>}
              </div>
            ) : (
              <>
                {/* 상태 메시지 표시 - 이 부분이 누락되어 있었음 */}
                {statusText && (
                  <div className="status-message">
                    <p>{statusText}</p>
                  </div>
                )}

                {/* 초기 분석 결과만 표시 */}
                {recommendResult && (
                  <div className="initial-recommendResult">
                    <p id="status-text" style={{ whiteSpace: 'pre-line' }}>
                      {(() => {
                        const productList = [
                          '데님 팬츠',
                          '슈트 팬츠&슬랙스',
                          '니트&스웨터 - 긴소매',
                          '겨울 더블 코트',
                          '피케&카라 티셔츠 - 반소매',
                          '긴소매 티셔츠',
                          '로퍼',
                          '패딩 베스트',
                          '환절기 코트',
                          '나일론&코치 재킷',
                          '셔츠&블라우스 - 반소매',
                          '플리스&뽀글이',
                          '더비 슈즈',
                          '슈트&블레이저 재킷',
                          '사파리&헌팅 재킷',
                          '패션스니커즈화',
                          '겨울 기타 코트',
                          '블루종&MA-1',
                          '앵클/숏 부츠',
                          '후드 티셔츠',
                          '스트레이트 팁',
                          '니트&스웨터 - 반소매',
                          '워커',
                          '롱패딩&헤비 아우터',
                          '트레이닝 재킷',
                          '반소매 티셔츠',
                          '셔츠&블라우스 - 긴소매',
                          '스포츠/캐주얼 샌들',
                          '모카신',
                          '트레이닝&조거 팬츠',
                          '쪼리/플립플랍',
                          '트러커 재킷',
                          '피케&카라 티셔츠 - 긴소매',
                          '코튼 팬츠',
                          '무스탕&퍼',
                          '후드 집업',
                          '스타디움 재킷',
                          '미들/하프 부츠',
                          '겨울 싱글 코트',
                          '캔버스/단화',
                          '맨투맨&스웨트',
                          '숏패딩&헤비 아우터',
                          '카디건',
                          '아노락 재킷',
                          '숏팬츠',
                        ];

                        const answer = recommendResult.initial_recommendation.answer;

                        // 상품 리스트에서 답변에 포함된 상품 찾기
                        const foundProduct = productList.find((product) =>
                          answer.toLowerCase().includes(product.toLowerCase())
                        );

                        // 상품을 찾았으면 간결한 형식으로 표시
                        if (foundProduct) {
                          return (
                            <>
                              촬영하신 제품은{' '}
                              <strong style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{foundProduct}</strong> 입니다.
                            </>
                          );
                        }

                        // 상품을 찾지 못했으면 원본 텍스트에서 불필요한 부분 제거
                        // "이 상품은" 또는 "상품은" 다음부터 첫 번째 문장 끝까지만 추출
                        const simplifiedMatch = answer.match(
                          /(?:이 상품은|상품은|촬영하신 제품은)\s*(.*?)(?:입니다|보입니다|보며)/
                        );
                        if (simplifiedMatch && simplifiedMatch[1]) {
                          return (
                            <>
                              촬영하신 제품은{' '}
                              <strong style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                                {simplifiedMatch[1].trim()}
                              </strong>{' '}
                              입니다.
                            </>
                          );
                        }

                        // 위 방법으로도 추출 실패 시 원본 텍스트 반환
                        return answer;
                      })()}
                    </p>
                    <br />
                    <p>결과가 맞다면 추천 코디 보기를 눌러주세요</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraPage;
