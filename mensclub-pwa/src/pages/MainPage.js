// MainPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import api from '../api/axios';
import AutoSwiper from './AutoSwiper';

// mainpage 개요 - 추천코디 & 찜 목록

function MainPage() {
  // 전체 추천 코디 데이터 저장 & 어떤 추천이 찜 되었는지 ID 기준으로 저장
  const [recommends, setRecommends] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [styleFilter, setStyleFilter] = useState('미니멀');
  const [priceFilter, setPriceFilter] = useState('10만원대');
  const location = useLocation(); // 현재 URL 정보를 가져오기 위한 hook 추가

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  // 소셜 로그인 후 URL에서 토큰 추출하여 저장하는 로직 추가
  // 소셜 로그인 후 URL에서 토큰 추출하여 저장하는 로직
  useEffect(() => {
    // URL에서 토큰 추출
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refresh = urlParams.get('refresh');

    if (token) {
      // 토큰 저장
      localStorage.setItem('accessToken', token);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }

      console.log('URL 전체:', window.location.href);
      console.log('URL 파라미터:', window.location.search);
      console.log('토큰:', token);
      console.log('리프레시:', refresh);

      // URL에서 쿼리 파라미터 제거 (깔끔한 URL 유지)
      window.history.replaceState({}, document.title, '/main');

      // 토큰이 저장되었는지 확인
      console.log('저장된 토큰:', localStorage.getItem('accessToken'));
    }
  }, []); // 컴포넌트가 마운트될 때만 실행

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      try {
        // 추천 코디 전체 목록 가져옴
        // 현재 사용자가 찜한 항목 목록 가져옴
        const recommendRes = await api.get('/clothes/v1/recommends/');
        const picksRes = await api.get('/clothes/v1/picks/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRecommends(recommendRes.data.results);
        const map = {};
        picksRes.data.results.forEach((p) => {
          map[p.recommend] = p.id;
        });
        setLikedMap(map);
      } catch (err) {
        console.error('데이터 불러오기 오류:', err);
      }
    };
    fetchData();
  }, []);

  // 찜 추가 & 삭제 함수
  //찜한 상태일 경우 → DELETE /picks/{id}/
  //찜하지 않은 경우 → POST /picks/ 로 추가
  const toggleLike = async (recommendId) => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    if (likedMap[recommendId]) {
      try {
        await api.delete(`/clothes/v1/picks/${likedMap[recommendId]}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedMap((prev) => {
          const updated = { ...prev };
          delete updated[recommendId];
          return updated;
        });
      } catch (err) {
        console.error('찜 삭제 오류:', err);
      }
    } else {
      try {
        const res = await api.post(
          '/clothes/v1/picks/',
          {
            user: Number(userId),
            recommend: recommendId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLikedMap((prev) => ({ ...prev, [recommendId]: res.data.id }));
      } catch (err) {
        console.error('찜 추가 오류:', err);
      }
    }
  };

  const renderCard = (recommend) => (
    <div className="card" key={recommend.id}>
      <div className="image-container">
        <img src={recommend.image_url || './images/placeholder.jpg'} alt={recommend.style} />
        <button
          className="heart-button"
          onClick={() => toggleLike(recommend.id)}
          aria-label={likedMap[recommend.id] ? '찜 해제' : '찜 추가'}>
          <FontAwesomeIcon
            icon={likedMap[recommend.id] ? solidHeart : regularHeart}
            className={`heart-icon ${likedMap[recommend.id] ? 'liked' : ''}`}
          />
        </button>
      </div>
      <div className="card-info">
        <h3>{recommend.style}</h3>
        <p className="price">{recommend.season}</p>
      </div>
    </div>
  );

  const filterAndRender = (category, filter) => {
    const filtered = recommends.filter((r) => r.category === category && (!filter || r.tag === filter));
    const placeholders = Array.from({ length: 4 - filtered.length }, (_, i) => (
      <div key={`placeholder-${category}-${i}`} className="card placeholder" />
    ));
    return [...filtered.slice(0, 4).map(renderCard), ...placeholders];
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
          <div className="coordination-slider">
            <div className="coordination-cards">{filterAndRender('random')}</div>
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
          <div className="coordination-slider">
            <div className="coordination-cards">{filterAndRender('price', priceFilter)}</div>
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
          <div className="coordination-slider">
            <div className="coordination-cards">{filterAndRender('style', styleFilter)}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
