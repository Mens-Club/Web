import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoadingPage.css';
import api from '../api/axios'; // axios 인스턴스 import만 유지

const iconPaths = [
  'icons/1.png',
  'icons/2.png',
  'icons/3.png',
  'icons/4.png',
  'icons/5.png',
  'icons/6.png'
];

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const LoadingPage = () => {
  const navigate = useNavigate();
  const [icons, setIcons] = useState(shuffle(iconPaths));
  const [userName, setUserName] = useState('예<sup>**</sup>');

  useEffect(() => {
    const interval = setInterval(() => {
      setIcons(shuffle(iconPaths));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    async function fetchUserInfo() {
      try {
        const res = await api.get('/api/account/v1/user_info/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { username } = res.data;
        if (username) {
          setUserName(username);
        }
      } catch (error) {
        console.error('❌ 사용자 정보 불러오기 실패:', error);
      }
    }

    fetchUserInfo();
  }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate('/fashion');
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, [navigate]);

  useEffect(() => {
  const analyzeImage = async () => {
    const token = sessionStorage.getItem('accessToken');
    const imgSrc = sessionStorage.getItem('imgSrc');
    if (!imgSrc) {
      navigate('/camera'); // 이미지 없으면 되돌아감
      return;
    }

    try {
      // 1. Blob 변환
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');

      // 2. 업로드
      const uploadRes = await fetch('http://localhost:8000/api/account/v1/upload-image/', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.detail || '이미지 업로드 실패');

      const imageUrl = uploadData.image_url;
      sessionStorage.setItem('capturedImageUrl', imageUrl);

      // 3. 분석 요청
      const recommendRes = await fetch('http://localhost:8000/api/recommend/v1/generator/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      const recommendData = await recommendRes.json();
      if (!recommendRes.ok) throw new Error(recommendData.detail || '추천 요청 실패');

      // 4. 분석 결과 저장
      sessionStorage.setItem('recommendResult', JSON.stringify(recommendData));

      // 5. 다시 카메라 페이지로 이동
      navigate('/camera', { replace: true });
    } catch (err) {
      console.error('분석 실패:', err);
      navigate('/camera', { state: { error: err.message } });
    }
  };

  analyzeImage();
}, [navigate]);


  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-title">
          <span dangerouslySetInnerHTML={{ __html: userName }}></span>의<br />코디는…
        </div>
        <div className="icon-grid" id="iconGrid">
          {icons.map((src, idx) => (
            <div className="icon-cell" key={idx}>
              <img src={src} alt={`아이콘 ${idx + 1}`} width="38" height="38" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
