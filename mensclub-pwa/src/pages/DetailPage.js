import React, { useEffect, useState, useRef } from 'react';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기
import '../styles/DetailPage.css';

function DetailPage() {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetch('/api/products') // 실제 API 주소로 변경
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        // 에러 처리
        setProducts([]);
      });
  }, []);

  // 슬라이더 드래그 이벤트 등록
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const handleMouseLeave = () => {
      isDown = false;
    };
    const handleMouseUp = () => {
      isDown = false;
    };
    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    // cleanup
    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  // products가 undefined이거나 null이면 빈 배열로 대체
  const safeProducts = Array.isArray(products) ? products : [];

  // 짝수 그리드 맞추기
  const evenCount = safeProducts.length % 2 === 0 ? safeProducts.length : safeProducts.length + 1;
  const productsEven = [...safeProducts, ...Array(evenCount - safeProducts.length).fill(null)];

  return (
    <div className="container">
      <div className="content">
        {/* 메인 이미지 그리드 */}
        <div className="main-image-grid">
          {productsEven.map((product, id) =>
            product ? (
              <div className="main-image-cell" key={id}>
                <img src={product.image} alt={`product-${id}`} className="main-image" />
              </div>
            ) : (
              <div className="main-image-cell empty" key={id}></div>
            )
          )}
        </div>

        {/* 상품 카드 슬라이더 */}
        <div className="slider-wrapper">
          <div className="product-slider">
            {productsEven.map((product, id) =>
              product ? (
                <div className="product-card" key={id}>
                  <div className="product-card-inner">
                    <img src={product.image} alt={`product-thumb-${id}`} className="product-thumb" />
                    <div>
                      <p className="brand">{product.brand}</p>
                      <p className="product-name">{product.name}</p>
                      <p className="product-price">{product.price}</p>
                      <a href={product.url} className="product-link" target="_blank" rel="noopener noreferrer">
                        상품 페이지로 이동
                      </a>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
      {/* 설명 박스 */}
      <div className="info-boxes">
        <div className="info-box">
          <h3>
            <span className="info-icon">ℹ️</span>
            제품 설명
          </h3>
          <p className="product-describe">{products.describe}</p>
        </div>
        {/* 추가 정보 박스 */}
        <div className="info-box">
          <h3>
            <span className="info-icon">⭐</span>
            요약 설명
          </h3>
          <ul className="product-brif-describe">{products.brif_describe}</ul>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
