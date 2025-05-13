import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기
import '../styles/DetailPage.css';
import api from '../api/axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

function DetailPage() {
  const { itemId } = useParams(); // URL에서 itemId 가져오기
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recommendationCode = queryParams.get('recommendation'); // URL 쿼리에서 recommendation 코드 가져오기

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (recommendationCode) {
      try {
        // 세션스토리지에서 찜 상태와 추천 정보 불러오기
        const storedLiked = sessionStorage.getItem('likedItems');
        const storedData = sessionStorage.getItem('recommendationData');

        if (storedLiked && storedData) {
          const likedArray = JSON.parse(storedLiked);
          const data = JSON.parse(storedData);

          // 현재 추천 코드에 해당하는 인덱스 찾기
          const index = data.product_combinations.findIndex(
            (combo) => combo.recommendation_id === parseInt(recommendationCode)
          );

          if (index !== -1 && index < likedArray.length) {
            setIsLiked(likedArray[index]);
          }
        }
      } catch (error) {
        console.error('찜 상태 로드 오류:', error);
      }
    }
  }, [recommendationCode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (recommendationCode) {
          // 로컬 스토리지에서 데이터 확인
          const storedData = sessionStorage.getItem('recommendationData');

          if (storedData) {
            const data = JSON.parse(storedData);

            // 해당 추천 코드에 맞는 조합 찾기
            const recommendationData = data.product_combinations.find(
              (combo) => combo.recommendation_id === parseInt(recommendationCode)
            );

            if (recommendationData) {
              // 조합에서 모든 상품 추출 (null 제외)
              const allProducts = Object.entries(recommendationData.combination || {})
                .filter(([_, item]) => item !== null)
                .map(([category, item]) => ({ ...item, category }));

              // 현재 상품 찾기
              const currentItem = allProducts.find((item) => item.idx === parseInt(itemId));

              if (currentItem) {
                // 현재 상품을 첫 번째로 하는 전체 상품 배열 생성
                const sortedProducts = [currentItem, ...allProducts.filter((item) => item.idx !== parseInt(itemId))];

                setProducts(sortedProducts);
              } else {
                setError('현재 상품을 찾을 수 없습니다.');
              }
            } else {
              setError('해당 추천 코드에 맞는 데이터를 찾을 수 없습니다.');
            }
          } else {
            // API에서 데이터 가져오기
            const response = await api.get(`/api/clothes/v1/recommendation/${recommendationCode}`);

            if (response.data && response.data.combination) {
              const allProducts = Object.entries(response.data.combination || {})
                .filter(([_, item]) => item !== null)
                .map(([category, item]) => ({ ...item, category }));

              const currentItem = allProducts.find((item) => item.idx === parseInt(itemId));

              if (currentItem) {
                setProducts([currentItem, ...allProducts.filter((item) => item.idx !== parseInt(itemId))]);
              } else {
                setError('현재 상품을 찾을 수 없습니다.');
              }
            } else {
              setError('추천 데이터를 가져오는데 실패했습니다.');
            }
          }
        } else {
          // 단일 상품만 가져오기
          const response = await api.get(`/api/clothes/v1/product/${itemId}`);
          setProducts([response.data]);
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchData();
    }
  }, [itemId, recommendationCode]);

  // 슬라이더 드래그 이벤트 등록
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let isDown = false;
    let isDragging = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      if (isDown) {
        slider.classList.remove('dragging');
        slider.style.cursor = 'grab';
      }
      isDown = false;
      isDragging = false;
    };

    const handleMouseUp = (e) => {
      if (isDragging) {
        // 드래그 중이었다면 클릭 이벤트 방지
        e.preventDefault();
        e.stopPropagation();

        // 약간의 지연 후 dragging 클래스 제거
        setTimeout(() => {
          slider.classList.remove('dragging');
          isDragging = false;
        }, 50);
      }

      isDown = false;
      slider.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;

      // 마우스가 조금이라도 움직였다면 드래그 중으로 표시
      isDragging = true;
      slider.classList.add('dragging');

      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    // a 태그 클릭 이벤트 처리
    const clickHandlers = new Map();
    const links = slider.querySelectorAll('a');
    links.forEach((link) => {
      const clickHandler = (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      clickHandlers.set(link, clickHandler);
      link.addEventListener('click', clickHandler);
    });

    // cleanup
    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);

      links.forEach((link) => {
        const handler = clickHandlers.get(link);
        if (handler) {
          link.removeEventListener('click', handler);
        }
      });
    };
  }, [[location.key]]);

  const toggleLike = async (e) => {
    e.stopPropagation();

    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        return;
      }

      // 현재 찜 상태 확인
      const newIsLiked = !isLiked;

      // 서버에 찜 상태 업데이트
      if (!isLiked) {
        // 찜 추가
        await api.post(
          '/api/picked/v1/like_add/',
          { recommendation_id: parseInt(recommendationCode) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ 찜 추가 성공:', recommendationCode);
      } else {
        // 찜 삭제
        await api.delete('/api/picked/v1/like_delete/', {
          headers: { Authorization: `Bearer ${token}` },
          data: { recommendation_id: parseInt(recommendationCode) },
        });
        console.log('✅ 찜 삭제 성공:', recommendationCode);
      }

      // UI 상태 업데이트
      setIsLiked(newIsLiked);

      // 세션스토리지의 찜 상태도 업데이트
      try {
        const storedLiked = sessionStorage.getItem('likedItems');
        const storedData = sessionStorage.getItem('recommendationData');

        if (storedLiked && storedData) {
          const likedArray = JSON.parse(storedLiked);
          const data = JSON.parse(storedData);

          // 현재 추천 코드에 해당하는 인덱스 찾기
          const index = data.product_combinations.findIndex(
            (combo) => combo.recommendation_id === parseInt(recommendationCode)
          );

          if (index !== -1 && index < likedArray.length) {
            likedArray[index] = newIsLiked;
            sessionStorage.setItem('likedItems', JSON.stringify(likedArray));
          }
        }
      } catch (error) {
        console.error('찜 상태 저장 오류:', error);
      }
    } catch (error) {
      console.error('❌ 찜 상태 업데이트 실패:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중이거나 에러 발생 시 처리
  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!products) return <div className="not-found">상품을 찾을 수 없습니다.</div>;

  // 관련 상품이 짝수가 되도록 조정
  const evenCount = products.length % 2 === 0 ? products.length : products.length + 1;
  const productsEven = [...products, ...Array(evenCount - products.length).fill(null)];

  return (
    <div className="container">
      <div className="content">
        {/* 메인 이미지 그리드 */}
        <div className="main-image-grid">
          {products.map((product, id) => (
            <div className="main-image-cell" key={id}>
              <img src={product.thumbnail_url} alt={product.goods_name} className="main-image" />
            </div>
          ))}
          {/* 빈 셀 추가 (짝수 맞추기) */}
          {products.length % 2 !== 0 && <div className="main-image-cell empty"></div>}
          {recommendationCode && (
            <button className="heart-button" onClick={toggleLike} aria-label={isLiked ? '찜 해제' : '찜 추가'}>
              <FontAwesomeIcon
                icon={isLiked ? solidHeart : regularHeart}
                className={`heart-icon ${isLiked ? 'liked' : ''}`}
              />
            </button>
          )}
        </div>

        {/* 상품 카드 슬라이더 */}
        <div className="slider-wrapper">
          <div className="product-slider" ref={sliderRef}>
            {products.map((product, id) => (
              <div className={id === 0 ? 'product-card main-product' : 'product-card'} key={id}>
                <div className="product-card-inner">
                  <img src={product.thumbnail_url} alt={product.goods_name} className="product-thumb" />
                  <div>
                    <p className="brand">{product.brand || '브랜드 정보 없음'}</p>
                    <p className="product-name">{product.goods_name}</p>
                    <p className="product-price">{product.price?.toLocaleString()}원</p>
                    <a
                      href={product.goods_url || '#'}
                      className="product-link"
                      target="_blank"
                      rel="noopener noreferrer">
                      상품 페이지로 이동
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 설명 박스 */}
          <div className="info-boxes">
            <div className="info-box">
              <h3>
                <span className="info-icon">ℹ️</span>
                제품 설명
              </h3>
              <p className="product-describe">{products[0]?.description || '상세 설명이 없습니다.'}</p>
            </div>
            {/* 추가 정보 박스 */}
            <div className="info-box">
              <h3>
                <span className="info-icon">⭐</span>
                요약 설명
              </h3>
              <ul className="product-brif-describe">
                {products[0]?.brief_info ? (
                  products[0].brief_info.map((info, idx) => <li key={idx}>{info}</li>)
                ) : (
                  <li>요약 정보가 없습니다.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
