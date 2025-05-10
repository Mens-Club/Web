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

  // 카드 전체 클릭 시 대표 아이템으로 이동
  const handleCardClick = (items, recommendationCode) => {
    if (items && items.length > 0) {
      navigate(`/product-detail/${items[0].idx}?recommendation=${recommendationCode}`);
    }
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

  //
  // 찜 기능 구현 부분
  //
  const toggleLike = async (e, index) => {
    // 이벤트 버블링 방지
    e.stopPropagation();

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        return;
      }

      const recommendation = recommendations[index];
      const recommendationCode = recommendation.recommendation_code;

      // 현재 찜 상태 변경
      const newLiked = [...liked];
      newLiked[index] = !newLiked[index];

      // 서버에 찜 상태 업데이트
      if (newLiked[index]) {
        // 찜 추가
        await api.post(
          '/api/picked/v1/like/',
          { recommendation_code: recommendationCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ 찜 추가 성공:', recommendationCode);
      } else {
        // 찜 삭제
        await api.delete('/api/picked/v1/like_cancel/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { recommendation_code: recommendationCode },
        });
        console.log('✅ 찜 삭제 성공:', recommendationCode);
      }

      // 상태 업데이트 (서버 요청 성공 후)
      setLiked(newLiked);
    } catch (error) {
      console.error('❌ 찜 상태 업데이트 실패:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    }
  };

  //
  // 이미 찜 한 코디인지 확인을 위한 찜 목록 가지고 오기
  //

  // 찜 목록 가져오기
  const fetchLikedItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await api.get('/api/clothes/v1/picked_clothes/list/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 서버에서 받아온 찜 목록 (recommendation_code 배열)
      const likedCodes = response.data.map((item) => item.recommendation_code);

      // 현재 recommendations 배열과 비교하여 liked 상태 업데이트
      const newLiked = recommendations.map((recommendation) => likedCodes.includes(recommendation.recommendation_code));

      setLiked(newLiked);
      console.log('✅ 찜 목록 로드 성공');
    } catch (error) {
      console.error('❌ 찜 목록 로드 실패:', error);
    }
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
                <div
                  key={index}
                  className="recommend-card"
                  onClick={() => handleCardClick(items, recommendation.recommendation_code)}
                  style={{ cursor: 'pointer' }}>
                  <h3>추천 코디 #{index + 1}</h3>
                  <div className="total-price">총 가격: {recommendation.total_price.toLocaleString()}원</div>

                  <div className={`image-grid images-${items.length}`}>
                    {items.map((item, idx) => (
                      <div key={idx} className="item-image-group">
                        {item.thumbnail_url && (
                          <img src={item.thumbnail_url} alt={item.goods_name} className="thumbnail-img" />
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
                    onClick={(e) => toggleLike(e, index)}
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
