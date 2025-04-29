// import React, { useRef, useState, useEffect } from 'react';
// import '../styles/CameraPage.css';
// import '../styles/Layout.css';
// import { Link } from 'react-router-dom';

// function CameraPage() {
//   const videoRef = useRef(null);
//   const previewRef = useRef(null);
//   const [stream, setStream] = useState(null);
//   const [imageData, setImageData] = useState(null);
//   const [statusText, setStatusText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState('init');
//   const [canSwitch, setCanSwitch] = useState(false);
//   const [facingMode, setFacingMode] = useState('user');

//   // 카메라 장치 개수 확인
//   useEffect(() => {
//     async function checkCameraSwitchable() {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const videoInputs = devices.filter((device) => device.kind === 'videoinput');
//         setCanSwitch(videoInputs.length > 1);
//       } catch (e) {
//         setCanSwitch(false);
//       }
//     }
//     checkCameraSwitchable();
//   }, []);

//   // 카메라 시작/중지 관리
//   useEffect(() => {
//     let localStream = null;

//     async function startCamera() {
//       try {
//         // 기존 스트림 정리
//         if (videoRef.current && videoRef.current.srcObject) {
//           videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//           videoRef.current.srcObject = null;
//         }
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode },
//           audio: false,
//         });
//         setStream(mediaStream);
//         if (videoRef.current) {
//           videoRef.current.srcObject = mediaStream;
//         }
//         localStream = mediaStream;
//       } catch (err) {
//         console.log('카메라 접근 오류: ', err);
//         setStatusText('카메라를 사용할 수 없습니다.');
//       }
//     }

//     if (step === 'capture') {
//       startCamera();
//     }

//     // 언마운트 시 스트림 정리
//     return () => {
//       if (localStream) {
//         localStream.getTracks().forEach((track) => track.stop());
//       }
//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//       }
//     };
//   }, [step, facingMode]);

//   // 사진 촬영
//   const capturePhoto = () => {
//     if (!videoRef.current) return;
//     const canvas = document.createElement('canvas');
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
//     const data = canvas.toDataURL('image/jpeg');
//     setImageData(data);
//     setStep('preview');
//     // 스트림 중지
//     if (videoRef.current && videoRef.current.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       videoRef.current.srcObject = null;
//     }
//     setStream(null);
//     analyzeImage(data);
//   };

//   // 사진 다시 찍기
//   const retakePhoto = () => {
//     setImageData(null);
//     setStatusText('');
//     setStep('capture'); // 이 한 줄이면 useEffect에서 카메라가 재시작됨
//   };

//   // 이미지 분석(예시)
//   const analyzeImage = async (data) => {
//     setLoading(true);
//     setStatusText('');
//     setTimeout(() => {
//       setLoading(false);
//       setStatusText('사진이 성공적으로 촬영되었습니다.');
//       setStep('analyzed');
//     }, 1500);
//   };

//   // 카메라 전환
//   const toggleFacingMode = () => {
//     setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
//   };

//   // 이미지 저장
//   const saveImageLocally = () => {
//     if (!imageData) return;
//     const link = document.createElement('a');
//     link.href = imageData;
//     link.download = `captured-image-${new Date().getTime()}.jpg`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="container">
//       <div className="content">
//         <div className="title-wrapper">
//           <h1>오늘 입을 옷을 촬영해주세요!</h1>
//         </div>
//         <div className="upload-box">
//           {step === 'capture' && (
//             <video
//               id="camera-stream"
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
//             />
//           )}

//           {imageData && (
//             <img
//               id="preview"
//               ref={previewRef}
//               src={imageData}
//               alt="preview"
//               style={{ display: step !== 'init' ? 'block' : 'none', width: '100%', borderRadius: '12px' }}
//             />
//           )}

//           {step === 'init' && (
//             <button id="camera-button" className="camera-button" onClick={() => setStep('capture')}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="13" r="3" />
//                 <path d="M5 7h2l2-2h6l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2" />
//               </svg>
//             </button>
//           )}
//         </div>

//         <div className="button-container">
//           {step === 'capture' && (
//             <>
//               <button id="capture-btn" className="upload-text-btn" onClick={capturePhoto}>
//                 사진 촬영
//               </button>
//               {canSwitch && (
//                 <button id="switch-btn" className="upload-text-btn" onClick={toggleFacingMode}>
//                   카메라 전환
//                 </button>
//               )}
//             </>
//           )}
//           {step === 'preview' && (
//             <>
//               <button id="retake-btn" className="upload-text-btn" onClick={retakePhoto}>
//                 다시 찍기
//               </button>
//               <button id="save-btn" className="upload-text-btn" onClick={saveImageLocally}>
//                 이미지 저장
//               </button>
//             </>
//           )}
//         </div>

//         {step !== 'init' && (
//           <div className="upload-status" style={{ display: 'block' }}>
//             {loading ? (
//               <div className="loading-spinner">
//                 <div className="spinner"></div>
//                 <p>이미지 분석 중...</p>
//               </div>
//             ) : (
//               <>
//                 <p id="status-text">{statusText}</p>
//                 {step === 'analyzed' && (
//                   <>
//                     <Link to="/fashion">
//                       <button id="recommend-btn" className="upload-text-btn recommend-btn">
//                         오늘의 추천 코디 보기
//                       </button>
//                     </Link>
//                   </>
//                 )}
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CameraPage;

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam'; //웹캠 구현을 위한 라이브러리 설치
import '../styles/CameraPage.css';
import '../styles/Layout.css';
import { Link } from 'react-router-dom';

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

  // 사진 촬영
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
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

  // "사진 보내기" (이때만 서버 전송)
  const sendToServer = async () => {
    setLoading(true);
    setStatusText('');
    localStorage.setItem('testImg', imgSrc);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgSrc }),
      });
      if (response.ok) {
        setStatusText('사진이 성공적으로 업로드되었습니다.');
        setStep('analyzed');
      } else {
        setStatusText('업로드 실패');
      }
    } catch (error) {
      setStatusText('서버 통신 오류');
    }
    setLoading(false);
  };

  // 카메라 전환
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // // 이미지 저장
  // const saveImage = () => {
  //   if (!imgSrc) return;
  //   const link = document.createElement('a');
  //   link.href = imgSrc;
  //   link.download = `webcam-photo-${Date.now()}.jpg`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

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
      <div className="content">
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
              <button className="upload-text-btn" onClick={sendToServer}>
                사진 보내기
              </button>
              <button className="upload-text-btn" onClick={analyzeImage}>
                추천 결과 보기
              </button>
            </>
          )}
          {step === 'analyzed' && (
            <>
              <Link to="/fashion">
                <button className="upload-text-btn recommend-btn">오늘의 추천 코디 보기</button>
              </Link>
              <button className="upload-text-btn" onClick={goInit}>
                처음으로
              </button>
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
              <p id="status-text">{statusText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraPage;
