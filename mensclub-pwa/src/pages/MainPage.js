// MainPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import api from '../api/axios';
import AutoSwiper from './AutoSwiper';


function MainPage() {
  const [randomRecommends, setRandomRecommends] = useState([]);
  const [priceRecommends, setPriceRecommends] = useState([]);
  const [styleRecommends, setStyleRecommends] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [styleFilter, setStyleFilter] = useState('미니멀');
  const [priceFilter, setPriceFilter] = useState('10만원대');
  const [currentImageIndexMap, setCurrentImageIndexMap] = useState({});

   const navigate = useNavigate();
  
  useEffect(() => {
    const el = document.querySelector('.main-content');
    if (el) {
      el.style.overflowY = 'auto';
      el.style.overflowX = 'hidden';
    }
    return () => {
      if (el) el.style.overflowY = 'hidden';
    };
  }, []);

  useEffect(() => {
    fetchRandom();
    fetchPrice();
    fetchStyle(styleFilter);
  }, []);

  useEffect(() => {
    fetchStyle(styleFilter);
  }, [styleFilter]);

  useEffect(() => {
    fetchPrice();
  }, [priceFilter]);

   useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexMap((prev) => {
        const updated = { ...prev };
        [...randomRecommends, ...priceRecommends, ...styleRecommends].forEach((item) => {
          const images = [item.top?.s3_path, item.outer?.s3_path, item.bottom?.s3_path, item.shoes?.s3_path].filter(Boolean);
          if (images.length > 0) {
            const currentIndex = prev[item.id] || 0;
            updated[item.id] = (currentIndex + 1) % images.length;
          }
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [randomRecommends, priceRecommends, styleRecommends]);

  const fetchRandom = async () => {
    try {
      const res = await api.get('/api/picked/v1/main/random/', { params: { count: 4 } });
      setRandomRecommends(res.data);
    } catch (err) {
      console.error('랜덤 추천 오류:', err);
    }
  };

   const fetchPrice = async () => {
    try {
      const brackets = '100000,200000,300000';
      const res = await api.get('/api/picked/v1/main/by-price/', { params: { brackets, per: 4 } });
      setPriceRecommends(res.data[priceFilter] || []);
    } catch (err) {
      console.error('가격 추천 오류:', err);
    }
  };


 const fetchStyle = async (style) => {
  try {
    // 👇 styleMap 제거 또는 무시
    const res = await api.get('/api/picked/v1/main/by-style/', {
      params: { style, count: 4 },
    });
    setStyleRecommends(res.data);
  } catch (err) {
    console.error('스타일 추천 오류:', err);
  }
};



  // 찜 추가, 삭제
const toggleLike = async (recommendId) => {
  try {
    const response = await api.post('/api/picked/v1/main_picked/toggle', {
      main_recommendation_id: recommendId,
    });

    const status = response.status;

    setLikedMap((prev) => ({
      ...prev,
      [recommendId]: !prev[recommendId], // 상태 토글
    }));

    // 201: 생성됨, 200: 토글됨
    if (status === 201 || status === 200) {
      console.log(`✅ 찜 토글 성공 (${status}): ${recommendId}`);
    }
  } catch (err) {
    console.error('❌ 찜 토글 오류:', err.response?.data || err.message);
  }
};

  
const renderCard = (item) => {
  const images = [
    item.top?.s3_path,
    item.outer?.s3_path,
    item.bottom?.s3_path,
    item.shoes?.s3_path,
  ].filter(Boolean).slice(0, 4);

  return (
    <div className="card" key={item.id}>
      <div className="image-grid-2x2">
        {['top', 'outer', 'bottom', 'shoes'].map((key, idx) => {
          const src = item[key]?.s3_path;
          return src ? (
            <img
              key={idx}
              src={src}
              alt={`${key}`}
              className="thumbnail-grid-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = './images/placeholder.jpg';
              }}
            />
          ) : null;
        })}
      </div>

      <div className="card-info-with-heart">
        <div className="text-info">
          <h3>{item.style}</h3>
          <p className="price">₩{item.total_price?.toLocaleString() || '정보 없음'}</p>
        </div>
        <button
          className="heart-inline-btn"
          onClick={() => toggleLike(item.id)}
          aria-label={likedMap[item.id] ? '찜 해제' : '찜 추가'}>
          <FontAwesomeIcon
            icon={likedMap[item.id] ? solidHeart : regularHeart}
            className={`heart-icon ${likedMap[item.id] ? 'liked' : ''}`}
          />
        </button>
      </div>
    </div>
  );
};

  return (
    <div className="container">
      <main className="main-content">
        <div className="header-section">
          <AutoSwiper
            images={[
              '/images/banner4.png',
              '/images/banner1.png',
              '/images/banner5.png',
              '/images/banner3.png',
              '/images/banner2.png'
            ]}
          />
          <div className="title-area">
            <h1>오늘의 날씨</h1>
            <div className="weather-info">
              <span>서울특별시 • 2025.05.13</span>
              <div className="stats">
                <span>습도 85%</span>
                <span>바람 3m/s</span>
                <span>강수확률 15%</span>
              </div>
            </div>
          </div>
          <div className="service-box desktop-only">
            <h2>남성 맞춤 패션 스타일링 서비스</h2>
            <p>스타일, 서비스 고객 맞춤 특별 구매하세요!</p>
            <Link to="/camera">
              <button>1분만에 쇼핑 추천받기</button>
            </Link>
          </div>
        </div>

        <div className="service-box mobile-only">
          <h2>남성 맞춤 패션 스타일링 서비스</h2>
          <p>스타일, 서비스 고객 맞춤 특별 구매하세요!</p>
          <Link to="/camera">
            <button>1분만에 쇼핑 추천받기</button>
          </Link>
        </div>

        {/* 랜덤 추천 섹션 */}
        <div className="coordination-section">
          <div className="section-header">
            <h2>오늘의 랜덤 추천</h2>
          </div>
          <div className="coordination-cards">
            {randomRecommends.map(renderCard)}
          </div>
        </div>

        {/* 가격대별 추천 섹션 */}
        <div className="coordination-section">
          <div className="section-header">
            <h2>가격대별 추천 💶</h2>
            <div className="filter-buttons">
              {['10만원대', '20만원대', '30만원대'].map((label) => (
                <button
                  key={label}
                  className={`filter-btn ${priceFilter === label ? 'active' : ''}`}
                  onClick={() => setPriceFilter(label)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="coordination-cards">
            {priceRecommends.map(renderCard)}
          </div>
        </div>

        {/* 스타일별 추천 섹션 */}
        <div className="coordination-section">
          <div className="section-header">
            <h2>스타일별 추천 🧢</h2>
            <div className="filter-buttons">
              {['미니멀', '캐주얼'].map((label) => (
                <button
                  key={label}
                  className={`filter-btn ${styleFilter === label ? 'active' : ''}`}
                  onClick={() => setStyleFilter(label)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="coordination-cards">
            {styleRecommends.map(renderCard)}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
