// src/pages/CameraPage.js
import React, { useRef, useState, useEffect} from 'react';
import '../styles/CameraPage.css';
import '../styles/Layout.css';
import { useNavigate, Link } from 'react-router-dom';

function CameraPage() {
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('init');

  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    }
  }, [step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      alert('카메라를 사용할 수 없습니다. 로컬 환경에서 https 또는 localhost로 실행 중인지 확인하세요.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const data = canvas.toDataURL('image/jpeg');
    setImageData(data);
    setStep('preview');

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    analyzeImage(data);
  };

  const retakePhoto = () => {
    setStep('capture');
    setImageData(null);
    setStatusText('');
  };

  const analyzeImage = async (data) => {
    setLoading(true);
    setStatusText('');
    setTimeout(() => {
      setLoading(false);
      setStatusText('사진이 성공적으로 촬영되었습니다.');
      setStep('analyzed');
    }, 1500);
  };

  return (
    <div className="container">
      <div className="content">
        <div className="title-wrapper">
          <h1>오늘 입을 옷을 촬영해주세요!</h1>
        </div>
        <div className="upload-box">
          {step === 'capture' && (
            <video
              id="camera-stream"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
            />
          )}

          {imageData && (
            <img
              id="preview"
              ref={previewRef}
              src={imageData}
              alt="preview"
              style={{ display: step !== 'init' ? 'block' : 'none', width: '100%', borderRadius: '12px' }}
            />
          )}

          {step === 'init' && (
            <button id="camera-button" className="camera-button" onClick={() => setStep('capture')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="13" r="3" />
                <path d="M5 7h2l2-2h6l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2" />
              </svg>
            </button>
          )}
        </div>

        <div className="button-container">
          {step === 'capture' && (
            <button id="capture-btn" className="upload-text-btn" onClick={capturePhoto}>
              사진 촬영
            </button>
          )}
          {step === 'preview' && (
            <button id="retake-btn" className="upload-text-btn" onClick={retakePhoto}>
              다시 찍기
            </button>
          )}
        </div>

        {step !== 'init' && (
          <div className="upload-status" style={{ display: 'block' }}>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>이미지 분석 중...</p>
              </div>
            ) : (
              <>
                <p id="status-text">{statusText}</p>
                {step === 'analyzed' && (
                  <>
                    <Link to="/fashion">
                      <button
                        id="recommend-btn"
                        className="upload-text-btn recommend-btn"
                      >
                        오늘의 추천 코디 보기
                      </button>
                    </Link>

                  </>
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