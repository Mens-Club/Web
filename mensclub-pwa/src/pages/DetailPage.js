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
  const recommendationCode = queryParams.get('recommendationCode'); // URL 쿼리에서 recommendation 코드 가져오기

  // URL에서 쿼리 파라미터 추출
  const recommendationId = queryParams.get('recommendationCode');
  const apiPath = queryParams.get('apiPath');

  // 이전 상태 복원 (뒤로가기 시)
  const previousState = location.state || window.history.state;

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const source = new URLSearchParams(location.search).get('source') || '';
    if (source === 'fashion' && recommendationCode) {
      try {
        // 세션스토리지에서 찜 맵 불러오기
        const storedLikedMap = sessionStorage.getItem('likedItemsMap');
        if (storedLikedMap) {
          const likedMap = JSON.parse(storedLikedMap);
          setIsLiked(likedMap[recommendationCode] || false);
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
        const source = new URLSearchParams(location.search).get('source') || '';
        const token = sessionStorage.getItem('accessToken');
        // recommendationId 파라미터 추가 - URL에서 가져옴
        const recommendationId = new URLSearchParams(location.search).get('recommendationId') || recommendationCode;

        console.log('소스:', source);
        console.log('아이템 ID:', itemId);
        console.log('추천 ID:', recommendationId);

        // 소스 파라미터를 먼저 확인하여 처리
        if (source === 'mypage') {
          try {
            const response = await api.get(`/api/picked/v1/recommend_picked/${itemId}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log('마이페이지 상품 응답:', response.data);

            if (response.data) {
              // 응답 구조에 따라 적절히 처리
              const productData = response.data;
              const allItems = [];

              // 관련 상품이 있는 경우 추가
              if (productData.top) allItems.push({ ...productData.top, category: 'top' });
              if (productData.bottom) allItems.push({ ...productData.bottom, category: 'bottom' });
              if (productData.outer) allItems.push({ ...productData.outer, category: 'outer' });
              if (productData.shoes) allItems.push({ ...productData.shoes, category: 'shoes' });

              // 각 아이템에 필요한 속성 추가
              const itemsWithDetails = allItems.map((item) => ({
                ...item,
                thumbnail_url: item.s3_path,
                price: item.price || 0,
                goods_name: item.goods_name || '상품명 없음',
                total_price: productData.total_price,
                recommendation_code: productData.recommendation_code,
                created_at: productData.created_at,
              }));

              if (itemsWithDetails.length > 0) {
                setProducts(itemsWithDetails);
              } else {
                setError('상품 정보를 찾을 수 없습니다.');
              }
            } else {
              setError('상품 정보를 찾을 수 없습니다.');
            }
          } catch (error) {
            console.error('마이페이지 상품 로드 오류:', error);
            setError('마이페이지 상품을 불러오는데 실패했습니다.');
          }
        }
        // 홈에서 온 경우
        else if (source === 'home') {
          try {
            const response = await api.get(`/api/main_picked/${itemId}/`);
            console.log('홈 상품 응답:', response.data);

            if (response.data) {
              setProducts([response.data]);
            } else {
              setError('상품 정보를 찾을 수 없습니다.');
            }
          } catch (error) {
            console.error('홈 상품 로드 오류:', error);
            setError('홈 상품을 불러오는데 실패했습니다.');
          }
        }
        // 패션 페이지에서 온 경우 (recommendationId가 있음)
        else if (source === 'fashion' && recommendationId) {
          try {
            // 요청한 API를 사용하여 데이터 가져오기
            const response = await api.get(`/api/picked/v1/recommend_picked/${recommendationId}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            console.log('패션 페이지 API 응답 데이터:', response.data);

            if (response.data) {
              const productData = response.data;
              const allItems = [];

              // 관련 상품이 있는 경우 추가
              if (productData.top) allItems.push({ ...productData.top, category: 'top' });
              if (productData.bottom) allItems.push({ ...productData.bottom, category: 'bottom' });
              if (productData.outer) allItems.push({ ...productData.outer, category: 'outer' });
              if (productData.shoes) allItems.push({ ...productData.shoes, category: 'shoes' });

              // 각 아이템에 필요한 속성 추가
              const itemsWithDetails = allItems.map((item) => ({
                ...item,
                thumbnail_url: item.s3_path,
                price: item.price || 0,
                goods_name: item.goods_name || '상품명 없음',
                total_price: productData.total_price,
                recommendation_code: productData.recommendation_code,
                created_at: productData.created_at,
              }));

              if (itemsWithDetails.length > 0) {
                setProducts(itemsWithDetails);
              } else {
                // 세션스토리지에서 데이터 확인 (뒤로가기 시)
                const storedData = sessionStorage.getItem('recommendationData');
                if (storedData) {
                  const data = JSON.parse(storedData);
                  // 해당 추천 코드에 맞는 조합 찾기
                  const recommendationData = data.product_combinations.find(
                    (combo) => combo.recommendation_id === parseInt(recommendationId)
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
                      const sortedProducts = [
                        currentItem,
                        ...allProducts.filter((item) => item.idx !== parseInt(itemId)),
                      ];
                      setProducts(sortedProducts);
                    } else {
                      setError('현재 상품을 찾을 수 없습니다.');
                    }
                  } else {
                    setError('해당 추천 코드에 맞는 데이터를 찾을 수 없습니다.');
                  }
                } else {
                  setError('상품 정보를 찾을 수 없습니다.');
                }
              }
            } else {
              setError('상품 정보를 찾을 수 없습니다.');
            }
          } catch (error) {
            console.error('패션 페이지 API 데이터 로드 오류:', error);

            // API 호출 실패 시 세션스토리지에서 데이터 확인 (뒤로가기 시)
            const storedData = sessionStorage.getItem('recommendationData');
            if (storedData) {
              const data = JSON.parse(storedData);
              // 해당 추천 코드에 맞는 조합 찾기
              const recommendationData = data.product_combinations.find(
                (combo) => combo.recommendation_id === parseInt(recommendationId)
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
              setError('API에서 데이터를 불러오는데 실패했습니다.');
            }
          }
        }
        // 기본 케이스 (단일 상품)
        else {
          try {
            const response = await api.get(`/api/clothes/v1/product/${itemId}/`);
            setProducts([response.data]);
          } catch (error) {
            console.error('상품 로드 오류:', error);
            setError('상품을 불러오는데 실패했습니다.');
          }
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
  }, [itemId, recommendationCode, location.search]);

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
  }, [location.key, products]);

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
      const response = await api.post(
        '/api/picked/v1/recommend_picked/toggle',
        { recommendation_id: parseInt(recommendationCode) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // UI 상태 업데이트
      setIsLiked(newIsLiked);

      // 세션스토리지의 찜 상태도 업데이트
      try {
        const storedLikedMap = sessionStorage.getItem('likedItemsMap');
        const likedMap = storedLikedMap ? JSON.parse(storedLikedMap) : {};
        likedMap[recommendationCode] = newIsLiked;
        sessionStorage.setItem('likedItemsMap', JSON.stringify(likedMap));
      } catch (error) {
        console.error('찜 상태 저장 오류:', error);
      }
    } catch (error) {
      console.error('❌ 찜 상태 업데이트 실패:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중이거나 에러 발생 시 처리
  if (isLoading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!products) return <div className="not-found">상품을 찾을 수 없습니다.</div>;

  // 관련 상품이 짝수가 되도록 조정
  const evenCount = products.length % 2 === 0 ? products.length : products.length + 1;
  const productsEven = [...products, ...Array(evenCount - products.length).fill(null)];

  // 로딩 컴포넌트
  const LoadingSpinner = () => (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>로딩 중...</p>
    </div>
  );

  return (
    <div className="container">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
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
            <div className="info-box">
              <h3>
                <span className="info-icon">ℹ️</span>
                제품 설명
              </h3>
              <p className="product-describe">
                {products[0]?.reasoning_text || '아직 상세 설명이 등록되지 않았습니다.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailPage;
