import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BodyInfoPage.css';
import api from '../api/axios'; // ✅ axios 인스턴스

function BodyInfoPage() {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // ✅ 기존 체형 정보 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/account/v1/update/');
        const { height, weight } = res.data;
        if (height) setHeight(height);
        if (weight) setWeight(weight);
      } catch (err) {
        console.error('❌ 사용자 정보 요청 실패:', err);
      }
    };

    fetchData();
  }, []);

  // ✅ 정보 저장
  const handleSubmit = async () => {
    if (!height || !weight) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    try {
      await api.patch('/api/account/v1/update/', {
        height: String(height),
        weight: String(weight),
      });

      alert('체형 정보가 저장되었습니다.');
      navigate('/my');
    } catch (err) {
      const error = err.response?.data;
      const message =
        error?.detail || error?.height?.[0] || error?.weight?.[0] || '알 수 없는 오류';
      alert('저장 실패: ' + message);
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
            onChange={(e) => setHeight(e.target.value)}
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
            onChange={(e) => setWeight(e.target.value)}
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
