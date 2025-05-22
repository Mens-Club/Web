import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam'; //웹캠 구현을 위한 라이브러리 설치
import '../styles/CameraPage.css';
import '../styles/Layout.css';
import { useNavigate, useLocation } from 'react-router-dom';
import CameraGuideModal from '../pages/CameraGuideModal'; // 경로는 상황에 맞게 수정
import api from '../api/axios';

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
  const location = useLocation();

  const [recommendResult, setRecommendResult] = useState(null); // 추천 결과
  const guideDismissedRef = useRef(false);
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    const hasSeenGuide = sessionStorage.getItem('hasSeenCameraGuide');
    return !hasSeenGuide;
  });

  useEffect(() => {
    const hasSeenGuide = sessionStorage.getItem('hasSeenCameraGuide');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
      sessionStorage.setItem('hasSeenCameraGuide', 'true'); // ❗ 1회 기록
    }
  }, []);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    sessionStorage.setItem('hasSeenCameraGuide', 'true'); // 로그인 세션에서 한 번만
  };

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

      // 캡처 성공 플래그 추가
      sessionStorage.setItem('captureSuccess', 'true'); // 추가: 캡처 성공 플래그
    } catch (error) {
      console.error('카메라 캡처 오류:', error);
      setStatusText('카메라 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }, [cameraReady]);

  // 초기화 함수 수정
  const goInit = () => {
    // 상태 초기화
    setImgSrc(null);
    setStep('init');
    setStatusText('');
    setLoading(false);

    // 세션 스토리지 정리 - 더 철저하게
    sessionStorage.removeItem('imgSrc');
    sessionStorage.removeItem('cameraStep');
    sessionStorage.removeItem('recommendResult');
    sessionStorage.removeItem('capturedImageUrl');
    sessionStorage.removeItem('captureSuccess'); // 추가: 캡처 성공 플래그 제거
    sessionStorage.removeItem('analysisCompleted'); // 추가: 분석 완료 플래그 제거
  };

  // 재촬영
  const retake = () => {
    setImgSrc(null);
    setStep('capture');
    setStatusText('');
    setRecommendResult(null);
  };

  // 사진을 서버에 전송 및 분석 결과 받기
  // 서버 전송 함수 수정
  const sendToServer = () => {
    // 캡처 성공 여부 확인
    const captureSuccess = sessionStorage.getItem('captureSuccess') === 'true';

    if (!imgSrc || !captureSuccess) {
      // 추가: 캡처 성공 플래그 확인
      setStatusText('이미지가 저장되지 않았어요. 재 촬영 부탁드려요');
      return;
    }

    // 이미지 임시 저장
    sessionStorage.setItem('imgSrc', imgSrc);
    sessionStorage.setItem('cameraStep', 'analyzing');

    // 분석 완료 플래그 초기화 (새로운 분석 시작)
    sessionStorage.removeItem('analysisCompleted'); // 추가: 이전 분석 완료 상태 제거

    // 로딩 페이지로 이동
    navigate('/loading', {
      state: { fromCamera: true },
      replace: true,
    });
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('recommendResult');
    if (saved) {
      setRecommendResult(JSON.parse(saved));
      setStep('analyzed');
      sessionStorage.removeItem('recommendResult');
    }

    // 이미지 확인 - 이 부분 추가
    const savedImgSrc = sessionStorage.getItem('imgSrc');
    if (savedImgSrc) {
      setImgSrc(savedImgSrc);
      setStep('analyzed'); // 또는 'analyzed' 상태에 따라 설정
    }

    if (location.state?.error) {
      setStatusText(location.state.error);
    }
  }, [location.state]);

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

  return (
    <div className="container">
      <div className="camera-content">
        {/* 모달 */}
        {isGuideOpen && <CameraGuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} />}
        <div className="title-wrapper">
          <h1>AI 스타일링 코디 추천 받기</h1>
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
          <button
            className="camera-upload-text-btn start-recommend-btn" // ✅ 새 클래스
            onClick={sendToServer}
            disabled={!imgSrc}
          >
            추천 시작하기
          </button>
        </>
      )}
      {step === 'analyzed' && (
        <>
          <button className="camera-upload-text-btn" onClick={retake}>
            다시 찍기
          </button>
          <button
            className="camera-upload-text-btn show-recommend-btn" // ✅ 새 클래스
            onClick={goToFashionPage}
          >
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
