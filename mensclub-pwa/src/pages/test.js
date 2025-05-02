// MainPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import api from '../api/axios';

function MainPage() {
  const [liked, setLiked] = useState({});

  const toggleLike = async (itemId, payload) => {
    const token = localStorage.getItem('accessToken');
    const isLiked = liked[itemId];

    try {
      if (isLiked) {
        await api.delete(`/clothes/v1/picked_clothes/delete/`, {  
          headers: { Authorization: `Bearer ${token}` },
          params: { uuid: itemId },
        });
        setLiked((prev) => ({ ...prev, [itemId]: false }));
      } else {
        await api.post('/clothes/v1/picked_clothes/add/', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked((prev) => ({ ...prev, [itemId]: true }));
      }
    } catch (err) {
      console.error('찜 오류:', err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  const renderCard = (type, i, title, price, image) => {
    const itemId = `${type}-${i}`;
    const payload = {
      email: 'dummy@email.com',
      top: '',
      outerwear: '',
      bottom: '',
      shoes: '',
      summary_picture: image,
    };

    return (
      <div className="card" key={itemId}>
        <div className="image-container">
          <img src={image} alt={title} />
          <button
            className="heart-button"
            onClick={() => toggleLike(itemId, payload)}
            aria-label={liked[itemId] ? '찜 해제' : '찜 추가'}
          >
            <FontAwesomeIcon
              icon={liked[itemId] ? solidHeart : regularHeart}
              className={`heart-icon ${liked[itemId] ? 'liked' : ''}`}
            />
          </button>
        </div>
        <div className="card-info">
          <h3>{title}</h3>
          <p className="price">{price}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <main className="main-content">
        {/* 날씨 영역 */}
        <div className="header-section">
          <div className="title-area">
            <h1>오늘의 날씨</h1>
            <div className="weather-info">
              <span>서울특별시 • 2023.03.13</span>
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
            <div className="coordination-cards">
              {[1, 2, 3, 4].map(i => renderCard(
                'random',
                i,
                ['데일리 니트', '와이드 데님', '코튼 팬츠', '베이직 셔츠'][i - 1],
                ['39,000원', '59,000원', '45,000원', '49,000원'][i - 1],
                `./images/outfit${i}.jpg`
              ))}
            </div>
          </div>
        </div>

        {/* 가격대별 추천 섹션 */}
        <div className="coordination-section">
          <div className="section-header">
            <h2>가격대별 추천 💶</h2>
            <div className="filter-buttons">
              <button className="filter-btn active">10만원대</button>
              <button className="filter-btn">20만원대</button>
              <button className="filter-btn">30만원대</button>
            </div>
          </div>
          <div className="coordination-slider">
            <div className="coordination-cards">
              {[1, 2, 3, 4].map(i => renderCard(
                'price',
                i,
                ['캐시미어 코트', '울 블레이저', '가죽 자켓', '트렌치 코트'][i - 1],
                ['159,000원', '129,000원', '189,000원', '169,000원'][i - 1],
                `./images/price${i}.jpg`
              ))}
            </div>
          </div>
        </div>

        {/* 스타일별 추천 섹션 */}
        <div className="coordination-section">
          <div className="section-header">
            <h2>스타일별 추천 🧢</h2>
            <div className="filter-buttons">
              <button className="filter-btn active">미니멀</button>
              <button className="filter-btn">캐주얼</button>
            </div>
          </div>
          <div className="coordination-slider">
            <div className="coordination-cards">
              {[1, 2, 3, 4].map(i => renderCard(
                'style',
                i,
                ['슬림핏 셔츠', '스트레이트 팬츠', '니트 베스트', '린넨 셔츠'][i - 1],
                ['79,000원', '89,000원', '69,000원', '85,000원'][i - 1],
                `./images/style${i}.jpg`
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
