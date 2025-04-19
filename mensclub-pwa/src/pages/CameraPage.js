  import React, { useRef, useState } from 'react';
  import '../styles/CameraPage.css';


  // 나중에 코드 전체 변경 - 먀옹먀옹
  function CameraPage() {
    const videoRef = useRef(null);
    const previewRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [statusText, setStatusText] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('init'); // init, preview, analyzed

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        setStream(mediaStream);
        videoRef.current.srcObject = mediaStream;
        setStep('capture');
      } catch (err) {
        console.error('카메라 접근 오류:', err);
        alert('카메라 접근 권한을 확인해주세요.');
      }
    };

    const capturePhoto = () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setImageData(data);
      setStep('preview');

      // 스트림 중지
      stream.getTracks().forEach(track => track.stop());

      // 분석 시작
      analyzeImage(data);
    };

    const retakePhoto = () => {
      setStep('init');
      setImageData(null);
      setStatusText('');
      startCamera();
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
          <h1>오늘 입을 옷을 촬영해주세요!</h1>

          <div className="upload-box">
            {step === 'capture' && (
              <video id="camera-stream" ref={videoRef} autoPlay playsInline />
            )}

            {imageData && (
              <img
                id="preview"
                ref={previewRef}
                src={imageData}
                alt="preview"
                style={{ display: step !== 'init' ? 'block' : 'none' }}
              />
            )}

            {step === 'init' && (
              <button id="camera-button" className="camera-button" onClick={startCamera}>
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
                    <button
                      id="recommend-btn"
                      className="upload-text-btn recommend-btn"
                      onClick={() => alert('추천 코디 기능은 준비 중입니다.')}
                    >
                      오늘의 추천 코디
                    </button>
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
