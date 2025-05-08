import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BodyInfoPage.css';

function BodyInfoPage() {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

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
          키 (cm)
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="예: 175"
            min={100}
            max={250}
            required
          />
        </label>
        <label>
          몸무게 (kg)
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="예: 65"
            min={30}
            max={200}
            required
          />
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
