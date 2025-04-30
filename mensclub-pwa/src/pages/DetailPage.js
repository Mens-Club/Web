import React from 'react';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기
import '../styles/DetailPage.css';

function DetailPage(params) {
  return (
    <div className="container">
      <div className="content">
        {/* 이미지 가운데 정렬 */}
        <div className="image-container">
          <img src="./images/outfit1.jpg" alt="제품 이미지" />
        </div>

        {/* 제품 링크, 제품명, 가격 */}
        <div className="product-slider">
          <div className="product-cards">
            <div className="product-link">
              <img src="../images/2.jpg" alt="제품 이미지" />
              <a href="https://example.com/product-link" target="_blank" rel="noopener noreferrer">
                제품명 예시
              </a>
              <p style={{ fontSize: '16px', color: '#333' }}>가격: 100000원</p>
            </div>
          </div>
        </div>

        {/* 제품 설명 칸 */}
        <div className="product-description">
          <p>제품에 대한 상세 설명이 들어가는 칸입니다.</p>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
