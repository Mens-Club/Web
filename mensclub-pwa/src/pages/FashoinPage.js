import '../styles/FashoinPage.css';
import React, { useRef, useState, useEffect } from 'react';
import '../styles/Layout.css';
import api from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

function FashionPage() {
  const navigate = useNavigate(); // ✅ 추가
  const [liked, setLiked] = useState([]);
  const [userInfo, setUserInfo] = useState({ username: '' });

  const data = JSON.parse(localStorage.getItem('recommendationData'));
  const combinations = data.product_combinations;
  // null이 아닌 값만 남긴 새 배열 생성
  const filtered_combinations = combinations.map((comb) =>
    // comb: {상의: null, 하의: {...}, 신발: null ...}
    Object.fromEntries(Object.entries(comb).filter(([_, v]) => v !== null))
  );
  console.log(filtered_combinations);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('❌ 토큰이 없습니다. 로그인 필요.');
          alert('로그인이 필요한 서비스 입니다.');
          navigate('/login');
          return;
        }
        const response = await api.get('/api/account/v1/user_info/', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const { username } = response.data;
        setUserInfo({ username });
      } catch (error) {
        alert('로그인 정보가 유효하지 않습니다. 재 로그인해주세요.');
        navigate('/login');
        console.error('❌ 사용자 정보 불러오기 실패:', error);
      }
    }
    fetchUserInfo();
  }, [navigate]);

  const toggleLike = (index) => {
    const newLiked = [...liked];
    newLiked[index] = !newLiked[index];
    setLiked(newLiked);

    // ✅ TODO: 서버에 찜 상태 업데이트
    /*
    const outfitId = outfits[index].id;
    const isLiked = newLiked[index];
    const token = localStorage.getItem('accessToken');
    if (isLiked) {
      await api.post('/clothes/v1/picked_clothes/add/', { outfitId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await api.delete('/clothes/v1/picked_clothes/delete/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { outfitId },
      });
    }
    */
  };

  // ✅ 이미지 클릭 시 상세페이지 이동
  const handleImageClick = (item) => {
    navigate(`/product-detail/${item.idx}`);
  };

  return (
    <div className="container">
      <div className="content">
        <div className="recommendation-container">
          <h2>🧷 {userInfo.username}님의 추천 코디 👔</h2>
          <div className="recommend-grid">
            {filtered_combinations.map((combination, index) => {
              const items = Object.values(combination).filter(Boolean);
              return (
                <div key={index} className={`recommend-card image-grid images-${items.length}`}>
                  {items.map((item, idx) => {
                    // 각 아이템의 이미지 배열 만들기
                    const images = [];
                    if (item.thumbnail_url) images.push(item.thumbnail_url);
                    return (
                      <div key={idx} className="item-image-group">
                        {images.map((imgUrl, imgIdx) => (
                          <img
                            onClick={() => handleImageClick(item)}
                            key={imgIdx}
                            src={imgUrl}
                            alt={item.goods_name}
                            className="thumbnail-img"
                            style={{
                              width: images.length === 1 ? '100%' : images.length === 2 ? '48%' : '31%',
                              marginRight: imgIdx < images.length - 1 ? '2%' : '0',
                            }}
                          />
                        ))}
                        <div className="sub-category-label">{item.sub_category}</div>
                      </div>
                    );
                  })}
                  <button
                    className="heart-button"
                    onClick={() => toggleLike(index)}
                    aria-label={liked[index] ? '찜 해제' : '찜 추가'}>
                    <FontAwesomeIcon
                      icon={liked[index] ? solidHeart : regularHeart}
                      className={`heart-icon ${liked[index] ? 'liked' : ''}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FashionPage;
