import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BodyInfoPage.css'; // 기존 2.css를 리네이밍해서 사용


// 이미 정보가 있는 경우, 정보 를 올린후 수정

function BodyInfoPage() {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    // api 수정 해야함 있는걸로
    try {
      const response = await fetch('api/account/v1/body_info/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ height, weight })
      });

      if (response.ok) {
        alert('체형 정보가 저장되었습니다.');
        navigate('/my');
      } else {
        const error = await response.json();
        alert('저장 실패: ' + (error.detail || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('서버 오류:', err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bodyinfo-container">
      <div className="bodyinfo-header">
        <button className="bodyinfo-close" onClick={() => navigate(-1)}>×</button>
        <h2>맞춤 정보</h2>
      </div>

      <div className="bodyinfo-info-text">
        <span className="bodyinfo-info-highlight">정보를 한 번만 등록하면</span><br />
        나와 비슷한 리뷰를 쉽게 찾고,<br />
        다양한 상품 추천을 받아볼 수 있어요
      </div>

      <div className="bodyinfo-tab-menu">
        <span className="active">체형정보</span>
      </div>

      <form className="bodyinfo-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          키
          <select value={height} onChange={(e) => setHeight(Number(e.target.value))} required>
            <option value="">선택</option>
            {Array.from({ length: 81 }, (_, i) => 120 + i).map((cm) => (
              <option key={cm} value={cm}>{cm}cm</option>
            ))}
          </select>
        </label>
        <label>
          몸무게
          <select value={weight} onChange={(e) => setWeight(Number(e.target.value))} required>
            <option value="">선택</option>
            {Array.from({ length: 91 }, (_, i) => 40 + i).map((kg) => (
              <option key={kg} value={kg}>{kg}kg</option>
            ))}
          </select>
        </label>
      </form>

      <div className="button-row">
        <button className="bodyinfo-next-btn" onClick={() => navigate('/my')}>다음에 등록</button>
        <button
          className="bodyinfo-save-btn"
          disabled={!height || !weight}
          onClick={handleSubmit}
        >
          동의 후 저장
        </button>
      </div>
    </div>
  );
}

export default BodyInfoPage;
