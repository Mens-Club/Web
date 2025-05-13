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
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [step, setStep] = useState('init');
  const navigate = useNavigate();

  const [analyzeResult, setAnalyzeResult] = useState(null); // 분석 결과(옷 종류)
  const [recommendResult, setRecommendResult] = useState(null); // 추천 결과

  // 사진 촬영
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setStatusText('카메라가 로딩중입니다. 잠시만 기다려주세요 🙏');
      return;
    }
    setImgSrc(imageSrc);
    setStep('preview');
    setStatusText('');
  }, []);

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

    try {
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

      const recommendData = await recommendRes.json();

      if (!recommendRes.ok) {
        throw new Error(recommendData?.detail || '추천 요청 실패');
      }

      // 4. 추천 결과 출력
      console.log('추천 결과:', recommendData);
      setRecommendResult(recommendData);
      setStep('analyzed');
    } catch (error) {
      console.error(error);
      setStatusText(error.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
              </div>
            ) : (
              <>
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
                        // "상품은" 다음부터 "로 보이며" 또는 "입니다" 앞까지의 텍스트 추출
                        // 먼저 기존 정규식으로 시도
                        const match = answer.match(/상품은\s*(.*?)(?:로 보이며|입니다)/);
                        let detectedItem = match && match[1] ? match[1].trim() : '';

                        // 정규식으로 추출한 텍스트가 없거나 짧을 경우, 전체 텍스트에서 상품 리스트와 가장 일치하는 항목 찾기
                        if (!detectedItem || detectedItem.length < 2) {
                          // 전체 텍스트에서 상품 리스트의 각 항목이 포함되어 있는지 확인
                          const foundItems = productList.filter((product) =>
                            answer.toLowerCase().includes(product.toLowerCase())
                          );

                          if (foundItems.length > 0) {
                            // 가장 긴 일치 항목 선택 (더 구체적인 항목일 가능성이 높음)
                            detectedItem = foundItems.reduce(
                              (longest, current) => (current.length > longest.length ? current : longest),
                              ''
                            );
                          }
                        } else {
                          // 정규식으로 추출한 텍스트가 있을 경우, 가장 유사한 상품 찾기
                          const similarItems = productList.filter((product) => {
                            // 추출된 텍스트와 상품명 사이의 유사도 검사
                            // 간단한 포함 관계 체크
                            return (
                              detectedItem.toLowerCase().includes(product.toLowerCase()) ||
                              product.toLowerCase().includes(detectedItem.toLowerCase())
                            );
                          });

                          if (similarItems.length > 0) {
                            // 가장 유사한 항목 선택
                            detectedItem = similarItems.reduce((closest, current) => {
                              // 더 짧은 길이 차이를 가진 항목 선택
                              const currentDiff = Math.abs(current.length - detectedItem.length);
                              const closestDiff = Math.abs(closest.length - detectedItem.length);
                              return currentDiff < closestDiff ? current : closest;
                            }, similarItems[0]);
                          }
                        }
                        if (match && match[1]) {
                          return (
                            <>
                              촬영하신 제품은{' '}
                              <strong style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{match[1]}</strong> 입니다.
                            </>
                          );
                        }
                        // 매칭이 안되면 원본 텍스트 반환
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