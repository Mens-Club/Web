import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam'; //웹캠 구현을 위한 라이브러리 설치
import '../styles/CameraPage.css';
import '../styles/Layout.css';
import { Link, useParams } from 'react-router-dom';

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
  const [recommendation, setRecommendation] = useState(null); // ← 이 줄 추가

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
  };

  // 사진을 서버에 전송 및 분석 결과 받기
  const sendToServer = async () => {
    if (!imgSrc) {
      setStatusText('이미지가 저장되지 않았어요. 재 촬영 부탁드려요');
      return;
    }
    setLoading(true);
    setStatusText('');

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('http://localhost:8000/api/account/v1/upload-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ image: imgSrc }),
      });

      const responseData = await response.json(); // 💡 JSON 파싱

      if (response.ok) {
        setAnalyzeResult(responseData.answer);
        console.log(responseData);
        setStatusText(`분석결과 : ${responseData.answer}입니다. \n 결과가 맞다면 추천 시작하기 버튼을 눌러주세요`);
        setStep('analyzed');
      } else {
        console.error('❌ 서버 오류 응답:', responseData);
        setStatusText(`업로드 실패: ${responseData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('❌ 네트워크 오류:', error);
      setStatusText('서버 통신 오류');
    }

    setLoading(false);
  };

  // 추천 결과 받기
  const getRecommendation = async (clothType) => {
    setLoading(true);
    setStatusText('');
    setRecommendResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/account/v1/recommend/', {
        // 추천 API 엔드포인트 예시
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloth_type: clothType }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setRecommendResult(responseData.recommendation); // 예: '흰색 셔츠와 잘 어울리는 청바지'
        setStatusText('추천 결과를 확인하세요!');
        setStep('recommend');
      } else {
        setStatusText(`추천 실패: ${responseData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      setStatusText('추천 서버 통신 오류');
    }
    setLoading(false);
  };

  // 카메라 전환
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // 분석(예시)
  const analyzeImage = () => {
    setLoading(true);
    setStatusText('');
    setTimeout(() => {
      setLoading(false);
      setStatusText('사진이 성공적으로 촬영되었습니다.');
      setStep('analyzed');
    }, 1500);
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
      <div className="main-content">
        <div className="title-wrapper">
          <h1>오늘 입을 옷을 촬영해주세요!</h1>
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
              <button className="upload-text-btn" onClick={capture}>
                사진 촬영
              </button>
              <button className="upload-text-btn" onClick={switchCamera}>
                카메라 전환
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button className="upload-text-btn" onClick={retake}>
                다시 찍기
              </button>
              <button className="upload-text-btn" onClick={sendToServer} disabled={!imgSrc}>
                추천 시작하기
              </button>
              {/* <button className="upload-text-btn" onClick={analyzeImage}>
                추천 결과 보기
              </button> */}
            </>
          )}
          {step === 'analyzed' && (
            <>
              <button className="upload-text-btn" onClick={retake}>
                다시 찍기
              </button>
              <Link to="/fashion">
                <button className="upload-text-btn recommend-btn">오늘의 추천 코디 보기</button>
              </Link>
              {/* <button className="upload-text-btn" onClick={goInit}>
                처음으로
              </button> */}
            </>
          )}
        </div>

        {/* 상태/로딩 메시지 */}
        {step !== 'init' && (
          <div className="upload-status" style={{ display: 'block' }}>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>이미지 분석 중...</p>
              </div>
            ) : (
              <p id="status-text" style={{ whiteSpace: 'pre-line' }}>
                {statusText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraPage;
