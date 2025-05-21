// MainPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import api from '../api/axios';
import AutoSwiper from './AutoSwiper';
import ConfirmModal from '../components/ConfirmModal';

function MainPage() {
  const [randomRecommends, setRandomRecommends] = useState([]);
  const [priceRecommends, setPriceRecommends] = useState([]);
  const [styleRecommends, setStyleRecommends] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [styleFilter, setStyleFilter] = useState('미니멀');
  const [priceFilter, setPriceFilter] = useState('10만원대');
  const [currentImageIndexMap, setCurrentImageIndexMap] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

    const storedLiked = sessionStorage.getItem('likedMap');
    if (storedLiked) {
      setLikedMap(JSON.parse(storedLiked));
    }
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
          const images = [item.top?.s3_path, item.outer?.s3_path, item.bottom?.s3_path, item.shoes?.s3_path].filter(
            Boolean
          );
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
      const res = await api.get('/api/picked/v1/main/by-style/', {
        params: { style, count: 4 },
      });
      setStyleRecommends(res.data);
    } catch (err) {
      console.error('스타일 추천 오류:', err);
    }
  };

  const toggleLike = async (recommendId) => {
    try {
      const isCurrentlyLiked = likedMap[recommendId];

      // 1. 찜 되어 있는 상태라면 삭제 확인
      if (isCurrentlyLiked) {
        setItemToDelete(recommendId);
        setModalOpen(true);
        return;
      }

      // 2. 서버에 토글 요청
      const response = await api.post('/api/picked/v1/main_picked/toggle', {
        main_recommendation_id: recommendId,
      });

      const status = response.status;

      // 3. 상태 업데이트 (sessionStorage 동기화 포함)
      setLikedMap((prev) => {
        const updated = { ...prev, [recommendId]: !prev[recommendId] };
        sessionStorage.setItem('likedMap', JSON.stringify(updated));
        return updated;
      });

      if (status === 201) {
        console.log(`✅ 찜 추가 성공: ${recommendId}`);
      } else if (status === 200) {
        console.log(`✅ 찜 해제 성공: ${recommendId}`);
      }
    } catch (err) {
      console.error('❌ 찜 토글 오류:', err.response?.data || err.message);
    }
  };

  // 모달 확인 버튼 클릭 시 실행될 함수
  const handleConfirmDelete = async () => {
    try {
      const response = await api.post('/api/picked/v1/main_picked/toggle', {
        main_recommendation_id: itemToDelete,
      });

      // 상태 업데이트
      setLikedMap((prev) => {
        const updated = { ...prev, [itemToDelete]: false };
        sessionStorage.setItem('likedMap', JSON.stringify(updated));
        return updated;
      });

      // 모달 닫기
      setModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('❌ 찜 토글 오류:', err.response?.data || err.message);
      setModalOpen(false);
      setItemToDelete(null);
    }
  };

  // 모달 취소 버튼 클릭 시 실행될 함수
  const handleCancelDelete = () => {
    setModalOpen(false);
    setItemToDelete(null);
  };

  // 메인 카드들 드래그 기능
  const randomCardsRef = useRef(null);
  const priceCardsRef = useRef(null);
  const styleCardsRef = useRef(null);

  useEffect(() => {
    const sliders = [randomCardsRef.current, priceCardsRef.current, styleCardsRef.current];

    // 각 슬라이더에 대한 이벤트 핸들러 함수들을 저장할 객체
    const handlers = {};

    sliders.forEach((slider, index) => {
      // index 매개변수 추가
      if (!slider) return;

      let isDown = false;
      let startX;
      let scrollLeft;

      // 각 슬라이더별로 고유한 핸들러 함수 생성
      handlers[index] = {
        mouseDown: (e) => {
          isDown = true;
          slider.style.cursor = 'grabbing';
          startX = e.pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
          e.preventDefault();
        },

        mouseLeave: () => {
          isDown = false;
          slider.style.cursor = 'grab';
        },

        mouseUp: () => {
          isDown = false;
          slider.style.cursor = 'grab';
        },

        mouseMove: (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - slider.offsetLeft;
          const walk = (x - startX) * 2;
          slider.scrollLeft = scrollLeft - walk;
        },
      };

      // 이벤트 리스너에 handlers 객체의 함수 사용
      slider.addEventListener('mousedown', handlers[index].mouseDown);
      slider.addEventListener('mouseleave', handlers[index].mouseLeave);
      slider.addEventListener('mouseup', handlers[index].mouseUp);
      slider.addEventListener('mousemove', handlers[index].mouseMove);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      sliders.forEach((slider, index) => {
        if (!slider || !handlers[index]) return;

        slider.removeEventListener('mousedown', handlers[index].mouseDown);
        slider.removeEventListener('mouseleave', handlers[index].mouseLeave);
        slider.removeEventListener('mouseup', handlers[index].mouseUp);
        slider.removeEventListener('mousemove', handlers[index].mouseMove);
      });
    };
  }, []);

  const renderCard = (item) => {
    const images = [item.top?.s3_path, item.outer?.s3_path, item.bottom?.s3_path, item.shoes?.s3_path]
      .filter(Boolean)
      .slice(0, 4);

    // 카드 클릭 핸들러 추가
    const handleCardClick = () => {
      // 디테일 페이지로 이동
      navigate(`/product-detail/${item.id}?source=main&recommendationId=${item.id}`);
    };

    return (
      <div
        className="card"
        key={item.id}
        onClick={handleCardClick} // 클릭 이벤트 추가
        style={{ cursor: 'pointer' }} // 커서 스타일 변경
      >
        <div className="image-grid-2x2">
          {['top', 'outer', 'bottom', 'shoes'].map((key, id) => {
            const src = item[key]?.s3_path;
            return src ? (
              <img
                key={id}
                src={src}
                alt={`${key}`}
                className="thumbnail-grid-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = './images/placeholder.jpg';
                }}
                draggable="false" // 드래그 방지 속성 추가
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
            onClick={(e) => {
              e.stopPropagation(); // 버블링 방지 (카드 클릭 이벤트 방지)
              toggleLike(item.id);
            }}
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
              '/images/banner1.png',
              // '/images/banner2.png',
              // '/images/banner3.png',
              // '/images/banner4.png',
              '/images/banner5.png',
              '/images/banner6.png',
              '/images/banner7.png',
              // '/images/banner8.png',
              '/images/banner9.png',
              '/images/banner10.png',
            ]}
          />
          <div className="service-box desktop-only">
            <h2>남성 맞춤 패션 스타일링 서비스 테스트2</h2>
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

        <div className="coordination-section">
          <div className="section-header">
            <h2>오늘의 랜덤 추천 테스트2</h2>
          </div>
          <div className="coordination-cards" ref={randomCardsRef}>
            {randomRecommends.map(renderCard)}
          </div>
        </div>

        <div className="coordination-section">
          <ConfirmModal
            isOpen={modalOpen}
            onCancel={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="찜 해제"
            message="찜을 해제하시겠습니까?"
          />
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
          <div className="coordination-cards" ref={priceCardsRef}>
            {priceRecommends.map(renderCard)}
          </div>
        </div>

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
          <div className="coordination-cards" ref={styleCardsRef}>
            {styleRecommends.map(renderCard)}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
