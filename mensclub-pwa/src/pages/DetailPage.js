import React from 'react';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기
import '../styles/DetailPage.css';

const slider = document.querySelector('.product-slider');
let isRight = false;
let startX;
let scrollLeft;

// slider.addEventListener('moustLeft', (e) => {
//   {
//     isRight = true;
//     startX = e.pageX - slider.of;
//   }
// });

function DetailPage(params) {
  return (
    <div className="container">
      <div className="content">
        {/* 메인이미지 */}
        <div className="main-image-wrapper">
          <img className="main-image" src="./images/outfit1.jpg" alt="제품 이미지" />
        </div>

        {/* 상품 카드 슬라이더 */}
        <div className="slider-wrapper">
          <div className="product-slider" id="productSlider">
            {/* 상품 카드 1 */}
            <div className="product-card">
              <div className="product-card-inner">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Product 1"
                  className="product-thumb"
                />
                <div>
                  <p className="brand">NIKE</p>
                  <p className="product-name">Air Max 270</p>
                  <p className="product-price">$150.00</p>
                  <a href="#" className="product-link">
                    상품 페이지로 이동
                  </a>
                </div>
              </div>
            </div>
            {/* 상품 카드 2 */}
            <div className="product-card">
              <div className="product-card-inner">
                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Product 2"
                  className="product-thumb"
                />
                <div>
                  <p className="brand">APPLE</p>
                  <p className="product-name">iPhone 13 Pro</p>
                  <p className="product-price">$999.00</p>
                  <a href="#" className="product-link">
                    상품 페이지로 이동
                  </a>
                </div>
              </div>
            </div>
            {/* 상품 카드 3 */}
            <div className="product-card">
              <div className="product-card-inner">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Product 3"
                  className="product-thumb"
                />
                <div>
                  <p className="brand">SONY</p>
                  <p className="product-name">WH-1000XM4</p>
                  <p className="product-price">$349.00</p>
                  <a href="#" className="product-link">
                    상품 페이지로 이동
                  </a>
                </div>
              </div>
            </div>
            {/* 상품 카드 4 */}
            <div className="product-card">
              <div className="product-card-inner">
                <img
                  src="https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Product 4"
                  className="product-thumb"
                />
                <div>
                  <p className="brand">SAMSUNG</p>
                  <p className="product-name">Galaxy Watch 5</p>
                  <p className="product-price">$279.00</p>
                  <a href="#" className="product-link">
                    상품 페이지로 이동
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 설명 박스 */}
          <div className="info-boxes">
            <div className="info-box">
              <h3>
                <span className="info-icon">ℹ️</span>
                Product Details
              </h3>
              <p>
                Our premium product features high-quality materials and craftsmanship. Designed for durability and
                style, it offers exceptional performance in various conditions. The ergonomic design ensures comfort
                during extended use, while the innovative technology provides cutting-edge functionality.
              </p>
            </div>
            <div className="info-box">
              <h3>
                <span className="info-icon">🚚</span>
                Shipping & Returns
              </h3>
              <p>
                Free standard shipping on all orders. Express delivery options available at checkout. We offer a 30-day
                return policy - if you're not completely satisfied, return your item for a full refund. All returns must
                be in original condition with tags attached.
              </p>
            </div>
          </div>
        </div>
        {/* 추가 정보 박스 */}
        <div className="info-box">
          <h3>
            <span className="info-icon">⭐</span>
            Why Choose Us?
          </h3>
          <ul className="info-list">
            <li>Premium quality materials sourced responsibly</li>
            <li>Industry-leading 2-year warranty</li>
            <li>24/7 customer support</li>
            <li>Eco-friendly packaging</li>
            <li>100% satisfaction guarantee</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
