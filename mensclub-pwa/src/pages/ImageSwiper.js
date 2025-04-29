import React, { useState } from 'react';

const images = [
  '/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg',
  '/images/5.jpg', '/images/6.jpg', '/images/7.jpg', '/images/8.jpg',
  '/images/9.jpg', '/images/10.jpg', '/images/11.jpg', '/images/12.jpg',
  '/images/13.jpg', '/images/14.jpg', '/images/15.jpg', '/images/16.jpg',
];

const ITEMS_PER_PAGE = 6;

function ImageSwiper() {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentImages = images.slice(startIndex, endIndex);

  const handlePageClick = (pageIndex) => {
    setPage(pageIndex);
  };


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {currentImages.map((src, index) => (
          <img key={index} src={src} alt={`image-${index}`} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
        ))}
      </div>

      {/* ✅ dot 페이지네이션 (고급 애니메이션 추가) */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>


        {Array.from({ length: totalPages }, (_, idx) => (
          <div
            key={idx}
            onClick={() => handlePageClick(idx)}
            style={{
              width: page === idx ? '14px' : '10px',  // ✅ 선택된 dot은 커진다
              height: page === idx ? '14px' : '10px',
              borderRadius: '50%',
              backgroundColor: page === idx ? '#007bff' : '#ccc',
              cursor: 'pointer',
              transition: 'all 0.3s ease',  // ✅ 부드럽게
              transform: page === idx ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}


      </div>
    </div>
  );
}

export default ImageSwiper;
