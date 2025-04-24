import '../styles/FashoinPage.css';
import React, { useRef, useState, useEffect} from 'react';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기


function FashionPage() {
  // 임시 가짜 데이터
  const dummyData = [
    { id: 1, imageUrl: '/images/outfit1.jpg' },
    { id: 2, imageUrl: '/images/outfit2.jpg' },
    { id: 3, imageUrl: '/images/outfit3.jpg' },
    { id: 4, imageUrl: '/images/outfit4.jpg' },
  ];

  const [outfits, setOutfits] = useState([]);
  const [liked, setLiked] = useState([]);

  useEffect(() => {
    // 가짜 데이터로 세팅
    setOutfits(dummyData);
    setLiked(new Array(dummyData.length).fill(false));
  }, []);

  const toggleLike = (index) => {
    const newLiked = [...liked];
    newLiked[index] = !newLiked[index];
    setLiked(newLiked);

    // 추후 실제 서버로 POST 요청 시 아래 코드 사용
    // axios.post('/api/like', {
    //   outfitId: outfits[index].id,
    //   liked: newLiked[index]
    // });
  };

  return (
    <div className="container">
      <div className="content">
        <div className="recommendation-container">
          <h2>👔 바나나님의 추천 코디</h2>
          <div className="recommend-grid">
            {outfits.map((item, index) => (
              <div key={item.id} className="recommend-card">
                <img src={item.imageUrl} alt={`recommend ${index + 1}`} />
                <button
                  className={`like-btn ${liked[index] ? 'liked' : ''}`}
                  onClick={() => toggleLike(index)}
                >
                  ♥
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FashionPage;
