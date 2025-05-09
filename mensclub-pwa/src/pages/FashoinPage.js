import '../styles/FashoinPage.css';
import React, { useRef, useState, useEffect } from 'react';
import '../styles/Layout.css';
import api from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';

function FashionPage() {
  const navigate = useNavigate();
  const [liked, setLiked] = useState([]);
  const [userInfo, setUserInfo] = useState({ username: '' });
  const [recommendations, setRecommendations] = useState([]);

  // ✅ 이미지 클릭 시 상세페이지 이동
  const handleImageClick = (item, recommendationCode) => {
    navigate(`/product-detail/${item.idx}?recommendation=${recommendationCode}`);
  };

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('recommendationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data && data.product_combinations) {
          // 전체 조합 정보(recommendation_code, total_price 포함) 저장
          setRecommendations(data.product_combinations);
          setLiked(new Array(data.product_combinations.length).fill(false));
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  }, []);

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

  return (
    <div className="container">
      <div className="content">
        <div className="recommendation-container">
          <h2>🧷 {userInfo.username}님의 추천 코디 👔</h2>
          <div className="recommend-grid">
            {recommendations.map((recommendation, index) => {
              // combination 객체에서 아이템들만 추출 (null 제외)
              const items = Object.entries(recommendation.combination || {})
                .filter(([_, item]) => item !== null)
                .map(([category, item]) => ({ ...item, category }));

              return (
                <div key={index} className="recommend-card">
                  <h3>추천 코디 #{index + 1}</h3>
                  <div className="total-price">총 가격: {recommendation.total_price.toLocaleString()}원</div>

                  <div className={`image-grid images-${items.length}`}>
                    {items.map((item, idx) => (
                      <div key={idx} className="item-image-group">
                        {item.thumbnail_url && (
                          <img
                            onClick={() => handleImageClick(item, recommendation.recommendation_code)}
                            src={item.thumbnail_url}
                            alt={item.goods_name}
                            className="thumbnail-img"
                          />
                        )}
                        <div className="item-info">
                          <div className="sub-category-label">{item.sub_category || item.category}</div>
                          <div className="item-price">{item.price?.toLocaleString()}원</div>
                        </div>
                      </div>
                    ))}
                  </div>
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
