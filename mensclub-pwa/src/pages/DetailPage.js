// ✅ 전체 DetailPage.js 코드 (mypage, main, fashion 연동 포함)

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';
import '../styles/DetailPage.css';
import api from '../api/axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faChevronRight, faShare, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

function DetailPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recommendationId = queryParams.get('recommendationId');
  const source = queryParams.get('source') || '';
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const sliderRef = useRef(null);
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);

  useEffect(() => {
    const source = new URLSearchParams(location.search).get('source') || '';

    if (source === 'mypage') {
      setIsLiked(true); // ✅ 마이페이지: 항상 true
    } else if (source === 'fashion' && recommendationId) {
      try {
        const storedLikedMap = sessionStorage.getItem('likedItemsMap');
        if (storedLikedMap) {
          const likedMap = JSON.parse(storedLikedMap);
          setIsLiked(likedMap[recommendationId] || false);
        }
      } catch (error) {
        console.error('찜 상태 로드 오류 (fashion):', error);
      }
    } else if (source === 'main' && recommendationId) {
      try {
        const storedLikedMap = sessionStorage.getItem('likedMap');
        if (storedLikedMap) {
          const likedMap = JSON.parse(storedLikedMap);
          setIsLiked(likedMap[recommendationId] || false);
        }
      } catch (error) {
        console.error('찜 상태 로드 오류 (main):', error);
      }
    }
  }, [recommendationId, location.search]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const source = new URLSearchParams(location.search).get('source') || '';
        const token = sessionStorage.getItem('accessToken');

        // 소스 파라미터를 먼저 확인하여 처리
        if (source === 'mypage') {
          try {
            const tab = queryParams.get('tab');
            let response;
            if (tab === 'ai') {
              response = await api.get(`/api/picked/v1/recommend_picked/${recommendationId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else if (tab === 'club') {
              response = await api.get(`/api/picked/v1/main_picked/${recommendationId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              // 기본값 (이전 코드와의 호환성 유지)
              response = await api.get(`/api/picked/v1/recommend_picked/${recommendationId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }

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
                reasoning_text: productData.reasoning_text,
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
        // 메인에서 온 경우
        else if (source === 'main') {
          try {
            const response = await api.get(`/api/picked/v1/main_picked/${itemId}/`);
            console.log('API 응답 전체 데이터:', response);

            if (response.data) {
              // 전체 상품 정보를 배열로 변환
              const productData = response.data;
              const allItems = [];

              // 각 카테고리별 상품 추가
              if (productData.top) allItems.push({ ...productData.top, category: 'top' });
              if (productData.bottom) allItems.push({ ...productData.bottom, category: 'bottom' });
              if (productData.outer) allItems.push({ ...productData.outer, category: 'outer' });
              if (productData.shoes && productData.shoes.id) allItems.push({ ...productData.shoes, category: 'shoes' });

              // 각 아이템에 필요한 속성 추가
              const itemsWithDetails = allItems.map((item) => ({
                ...item,
                thumbnail_url: item.s3_path,
                price: item.price || 0,
                goods_name: item.goods_name || '상품명 없음',
                total_price: productData.total_price,
                recommendation_code: productData.id,
                created_at: productData.created_at,
                reasoning_text: productData.reasoning_text,
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
                reasoning_text: productData.reasoning_text,
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
                    (combo) => String(combo.recommendation_id) === parseInt(recommendationId)
                  );
                  if (recommendationData) {
                    // 조합에서 모든 상품 추출 (null 제외)
                    const allProducts = Object.entries(recommendationData.combination || {})
                      .filter(([_, item]) => item !== null)
                      .map(([category, item]) => ({ ...item, category }));
                    // 현재 상품 찾기
                    const currentItem = allProducts.find((item) => item.id === parseInt(itemId));
                    if (currentItem) {
                      // 현재 상품을 첫 번째로 하는 전체 상품 배열 생성
                      const sortedProducts = [
                        currentItem,
                        ...allProducts.filter((item) => item.id !== parseInt(itemId)),
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
                const currentItem = allProducts.find((item) => item.id === parseInt(itemId));
                if (currentItem) {
                  // 현재 상품을 첫 번째로 하는 전체 상품 배열 생성
                  const sortedProducts = [currentItem, ...allProducts.filter((item) => item.id !== parseInt(itemId))];
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
  }, [itemId, recommendationId, location.search]);

  const toggleLike = async (e) => {
    e && e.stopPropagation();
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        return;
      }

      await api.post(
        '/api/picked/v1/recommend_picked/toggle',
        { recommendation_id: parseInt(recommendationId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      const likedMap = JSON.parse(sessionStorage.getItem('likedItemsMap') || '{}');
      likedMap[recommendationId] = newIsLiked;
      sessionStorage.setItem('likedItemsMap', JSON.stringify(likedMap));
    } catch (error) {
      console.error('❌ 찜 상태 업데이트 실패:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    }
  };

  const toggleImageZoom = (index) => {
    setIsZoomed(isZoomed && activeImageIndex === index ? false : true);
    setActiveImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (!isZoomed) return;
    let newIndex = activeImageIndex + direction;
    newIndex = (newIndex + products.length) % products.length;
    setActiveImageIndex(newIndex);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: products[0]?.goods_name || '상품 상세',
          text: products[0]?.reasoning_text || '추천 상품을 확인해보세요!',
          url: window.location.href,
        })
        .catch((error) => console.log('공유 실패:', error));
    } else {
      const tempInput = document.createElement('input');
      document.body.appendChild(tempInput);
      tempInput.value = window.location.href;
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert('링크가 복사되었습니다!');
    }
  };

  const getProductByCategory = (category) => products.find((p) => p.category === category);

  const categories = [
    { key: 'top', label: '상의' },
    { key: 'outer', label: '아우터' },
    { key: 'bottom', label: '하의' },
    { key: 'shoes', label: '신발' },
  ];

  const handleCategoryPurchase = (category) => {
    const product = getProductByCategory(category);
    if (product && product.goods_url) {
      window.open(product.goods_url, '_blank');
      setShowPurchaseOptions(false);
    } else {
      alert('해당 상품의 구매 링크가 없습니다.');
    }
  };

  const LoadingSpinner = () => (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>불러오는 중...</p>
    </div>
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="detail-container">
      <div className="content">
        <div className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>

        {isZoomed && (
          <div className="image-zoom-modal" onClick={() => setIsZoomed(false)}>
            <div className="zoom-image-container">
              <img
                src={products[activeImageIndex].thumbnail_url}
                alt={products[activeImageIndex].goods_name}
                className="zoomed-image"
              />
              <div
                className="zoom-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(-1);
                }}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </div>
              <div
                className="zoom-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(1);
                }}>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </div>
          </div>
        )}

        <div className="main-image-grid">
          {products.map((product, id) => (
            <div className="main-image-cell" key={id} onClick={() => toggleImageZoom(id)}>
              <img src={product.thumbnail_url} alt={product.goods_name} className="main-image" draggable="false" />
            </div>
          ))}
          {products.length % 2 !== 0 && <div className="main-image-cell empty"></div>}
        </div>

        <div className="detail-divider"></div>

        <div className="product-info">
          <div className="brand-row">
            <span className="brand">
              {products
                .map((p) => p.brand)
                .filter(Boolean)
                .join(' / ') || '브랜드 없음'}
            </span>
          </div>
          {/* <h1 className="product-name">{products[0]?.goods_name}</h1> */}
          <div className="price-row">
            <span className="product-price">{products[0]?.total_price?.toLocaleString() || 0}원</span>
          </div>
        </div>

        <div className="detail-divider"></div>

        <div className="section-title">함께 코디한 상품</div>
        <div className="slider-wrapper">
          <div className="product-slider" ref={sliderRef}>
            {products.map((product, id) => (
              <div className={id === 0 ? 'product-card main-product' : 'product-card'} key={id}>
                <div className="product-card-inner">
                  <img
                    src={product.thumbnail_url}
                    alt={product.goods_name}
                    className="product-thumb"
                    draggable="false"
                  />
                  <div>
                    <p className="brand">{product.brand || '브랜드'}</p>
                    <p className="product-name">{product.goods_name}</p>
                    <p className="product-price">{product.price?.toLocaleString()}원</p>
                    <a
                      href={product.goods_url || '#'}
                      className="product-link"
                      target="_blank"
                      rel="noopener noreferrer">
                      상품 구매하기
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-divider"></div>

        <div className="detail-section">
          <h3 className="detail-section-title">상품 설명</h3>
          <div className="info-box">
            <p className="product-describe">{products[0]?.reasoning_text || '아직 상세 설명이 등록되지 않았습니다.'}</p>
          </div>
        </div>

        <div className="bottom-actions">
          <button className="bottom-btn btn-outline" onClick={toggleLike}>
            <FontAwesomeIcon
              icon={isLiked ? solidHeart : regularHeart}
              className={`btn-icon ${isLiked ? 'liked' : ''}`}
            />{' '}
            찜하기
          </button>
          <button className="bottom-btn btn-outline" onClick={handleShare}>
            <FontAwesomeIcon icon={faShare} className="btn-icon" /> 공유
          </button>
          <button className="bottom-btn btn-primary" onClick={() => setShowPurchaseOptions((v) => !v)}>
            <FontAwesomeIcon icon={faShoppingBag} className="btn-icon" /> 구매하기
          </button>
          {showPurchaseOptions && (
            <div className="purchase-options-modal">
              {categories.map((cat) => {
                const product = getProductByCategory(cat.key);
                if (!product) return null;
                return (
                  <button key={cat.key} className="purchase-option-btn" onClick={() => handleCategoryPurchase(cat.key)}>
                    {cat.label}
                  </button>
                );
              })}
              <button className="purchase-option-cancel" onClick={() => setShowPurchaseOptions(false)}>
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
