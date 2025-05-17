import React, { useState, useRef } from 'react';
import '../styles/CameraGuideModal.css';

const guideSteps = [
  {
    title: '깨끗한 배경에서 사진 촬영',
    imageBad: 'images/1x.png',
    imageGood: 'images/1o.png',
  },
  {
    title: '전체 아이템이 사진에 보이도록 하기',
    imageBad: 'images/2x.jpg',
    imageGood: 'images/2o.jpg',
  },
];

function CameraGuideModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const startX = useRef(null);
  const isDragging = useRef(false);

  const handleStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = x;
    isDragging.current = true;
  };

  const handleMove = (e) => {
    if (!isDragging.current) return;

    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = x - startX.current;

    // 너무 작은 이동은 무시
    if (Math.abs(deltaX) < 30) return;

    if (deltaX > 50 && currentStep > 0) {
      setCurrentStep(currentStep - 1);
      isDragging.current = false;
    } else if (deltaX < -50 && currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      isDragging.current = false;
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const handleDotClick = (index) => {
    setCurrentStep(index);
  };

  const currentGuide = guideSteps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="guide-modal-overlay" onClick={onClose}>
      <div
        className="guide-modal-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
      >
       <button className="guide-close-button" onClick={onClose} type="button">×</button>

        <div className="guide-header">
          <h1>사진 촬영 가이드</h1>
        </div>
        <div className="guide-body">
          <div className="step-number">{currentStep + 1}</div>
          <h2>{currentGuide.title}</h2>
          {/* <p>{currentGuide.description}</p> */}
          <div className="image-examples">
            <div className="example bad">
              <div className="label">X</div>
              <img src={currentGuide.imageBad} alt="Bad Example" />
            </div>
            <div className="example good">
              <div className="label">O</div>
              <img src={currentGuide.imageGood} alt="Good Example" />
            </div>
          </div>
        </div>
        <div className="guide-pagination">
          {guideSteps.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentStep ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CameraGuideModal;
