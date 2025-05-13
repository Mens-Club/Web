import '../styles/FashoinPage.css';
import React, { useRef, useState, useEffect } from 'react';
import '../styles/Layout.css';
import api from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

function FashionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [liked, setLiked] = useState([]);
  const [userInfo, setUserInfo] = useState({ username: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 재추천 요청시 로딩 창 표현
  const imageGridRefs = useRef([]); // 아이템 스와이프
  const isDraggingRef = useRef(false);

  // 이미지 그리드 참조 설정
  const setImageGridRef = (index, element) => {
    imageGridRefs.current[index] = element;
  };

  // 이미지 그리드 드래그 이벤트 등록
  useEffect(() => {
    imageGridRefs.current.forEach((grid) => {
      if (!grid) return;

      let isDown = false;
      let startX;
      let scrollLeft;

      const handleMouseDown = (e) => {
        isDown = true;
        grid.style.cursor = 'grabbing';
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
        // 마우스 다운 시 드래깅 상태 초기화
        isDraggingRef.current = false;
      };

      const handleMouseLeave = () => {
        if (isDown) {
          grid.classList.remove('dragging');
          grid.style.cursor = 'grab';
        }
        isDown = false;
        // 마우스가 떠나면 약간의 지연 후 드래깅 상태 해제
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      };

      const handleMouseUp = (e) => {
        if (isDraggingRef.current) {
          // 드래그 중이었다면 클릭 이벤트 방지
          e.preventDefault();
          e.stopPropagation();

          // 약간의 지연 후 dragging 클래스 제거
          setTimeout(() => {
            grid.classList.remove('dragging');
            isDraggingRef.current = false;
          }, 100);
        }

        isDown = false;
        grid.style.cursor = 'grab';
      };

      const handleMouseMove = (e) => {
        if (!isDown) return;

        // 마우스가 조금이라도 움직였다면 드래그 중으로 표시
        isDraggingRef.current = true;
        grid.classList.add('dragging');

        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 2;
        grid.scrollLeft = scrollLeft - walk;
      };

      grid.addEventListener('mousedown', handleMouseDown);
      grid.addEventListener('mouseleave', handleMouseLeave);
      grid.addEventListener('mouseup', handleMouseUp);
      grid.addEventListener('mousemove', handleMouseMove);

      // 클린업 함수
      return () => {
        grid.removeEventListener('mousedown', handleMouseDown);
        grid.removeEventListener('mouseleave', handleMouseLeave);
        grid.removeEventListener('mouseup', handleMouseUp);
        grid.removeEventListener('mousemove', handleMouseMove);
      };
    });
  }, [location.key, recommendations]);

  // 카드 전체 클릭 시 대표 아이템으로 이동
  const handleCardClick = (items, recommendationId) => {
    // 드래깅 중이면 클릭 이벤트 무시
    if (isDraggingRef.current) {
      return;
    }

    // 클릭 처리 (상세 페이지로 이동)
    if (items && items.length > 0) {
      navigate(`/product-detail/${items[0].idx}?recommendation=${recommendationId}`, {
        state: {
          likedItems: liked,
          recommendations: recommendations,
        },
      });
    }
  };

  // 다른 코디 추천받기 (재요청)
  const handleRetryRecommendation = async () => {
    if (!window.confirm('다른 코디 추천을 진행하시겠습니까?')) {
      return; // 사용자가 취소를 누르면 함수 종료
    }
    try {
      setIsLoading(true); // 로딩 시작
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        return;
      }

      // 로딩 상태 표시
      setIsLoading(true);

      // 세션스토리지에서 이미지 URL 가져오기
      const imageUrl = sessionStorage.getItem('capturedImageUrl');

      if (!imageUrl) {
        alert('이미지 정보가 없습니다. 처음부터 다시 시작해주세요.');
        return;
      }

      // 새로운 추천 요청 보내기
      const recommendRes = await api.post(
        '/api/recommend/v1/recommned/',
        { image_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 결과 유효성 검사
      if (!isValidRecommendationResult(recommendRes.data)) {
        // 유효하지 않은 결과면 자동 재시도 (최대 3번)
        let retryCount = 0;
        const maxRetries = 3;
        let validResult = null;

        while (retryCount < maxRetries) {
          console.log(`❌ 유효하지 않은 추천 결과, 자동 재시도 중... (${retryCount + 1}/${maxRetries})`);

          // 지수 백오프 적용 (1초, 2초, 4초...)
          const delay = 1000 * Math.pow(2, retryCount);
          await new Promise((resolve) => setTimeout(resolve, delay));

          try {
            const retryRes = await api.post(
              '/api/recommend/v1/recommned/',
              { image_url: imageUrl },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (isValidRecommendationResult(retryRes.data)) {
              validResult = retryRes;
              console.log(`✅ 유효한 추천 결과를 받았습니다. (시도: ${retryCount + 1}/${maxRetries})`);
              break;
            }
          } catch (error) {
            console.error(`❌ 재시도 요청 실패 (${retryCount + 1}/${maxRetries}):`, error);
          }

          retryCount++;
        }

        if (validResult) {
          // 유효한 결과를 찾았으면 그것을 사용
          sessionStorage.setItem('recommendationData', JSON.stringify(validResult.data));
          setRecommendations(validResult.data.product_combinations);
          setLiked(new Array(validResult.data.product_combinations.length).fill(false));
        } else {
          // 모든 재시도 실패 시 알림
          alert('유효한 추천을 생성하지 못했습니다. 다른 이미지로 시도해보세요.');
        }
      } else {
        // 유효한 결과면 바로 사용
        sessionStorage.setItem('recommendationData', JSON.stringify(recommendRes.data));
        setRecommendations(recommendRes.data.product_combinations);
        setLiked(new Array(recommendRes.data.product_combinations.length).fill(false));
      }
    } catch (error) {
      console.error('재추천 요청 실패:', error);
      alert('추천을 다시 받는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 처음부터 다시하기 (카메라 페이지로 이동)
  const handleResetAndGoCamera = () => {
    if (!window.confirm('새로운 상품을 촬영하시겠습니까?')) {
      return; // 사용자가 취소를 누르면 함수 종료
    }
    navigate('/camera');
  };

  // 메인으로 돌아가기
  const handleGoHome = () => {
    if (!window.confirm('메인 화면으로 돌아가시겠 습니까?')) {
      return; // 사용자가 취소를 누르면 함수 종료
    }
    navigate('/main');
  };

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('recommendationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data && data.product_combinations) {
          // 전체 조합 정보(recommendation_id, total_price 포함) 저장
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
        const token = sessionStorage.getItem('accessToken');
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
  // 찜 토글 함수 수정 (기존 함수 대체)
  const toggleLike = async (e, index) => {
    e.stopPropagation();

    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        return;
      }

      const recommendation = recommendations[index];
      const recommendationId = recommendation.recommendation_id;

      // 현재 찜 상태 확인
      const isCurrentlyLiked = liked[index];

      // 찜이 되어 있는 경우에만 확인 창 표시
      if (isCurrentlyLiked) {
        const confirmUnlike = window.confirm('찜을 해제하시겠습니까?');
        if (!confirmUnlike) {
          return; // 사용자가 취소한 경우 함수 종료
        }
      }

      // 상태 먼저 업데이트 (낙관적 UI 업데이트)
      const newLiked = [...liked];
      newLiked[index] = !isCurrentlyLiked;
      setLiked(newLiked);

      // 세션스토리지에 찜 상태 저장
      sessionStorage.setItem('likedItems', JSON.stringify(newLiked));

      // 서버에 찜 상태 업데이트 (토글 API 사용)
      const response = await api.post(
        '/api/picked/v1/recommend_picked/toggle',
        { recommendation_id: recommendationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 응답 상태에 따라 로그 출력
      if (response.data && response.data.status === 'added') {
        console.log('✅ 찜 추가 성공:', recommendationId);
      } else if (response.data && response.data.status === 'removed') {
        console.log('✅ 찜 삭제 성공:', recommendationId);
      } else {
        console.log('⚠️ 찜 상태 변경 결과:', response.data);
      }
    } catch (error) {
      console.error('❌ 찜 상태 업데이트 실패:', error);

      // 에러 발생 시 상태 롤백
      fetchLikedItems();

      if (error.response?.data?.error === 'You have already bookmarked this recommendation.') {
        alert('이미 찜한 상품입니다.');
      } else {
        alert('찜 기능 처리 중 오류가 발생했습니다.');
      }
    }
  };

  //
  // 이미 찜 한 코디인지 확인을 위한 찜 목록 가지고 오기
  //

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('recommendationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data && data.product_combinations) {
          // 전체 조합 정보 저장
          setRecommendations(data.product_combinations);

          // 세션스토리지에서 찜 상태 불러오기
          const storedLiked = sessionStorage.getItem('likedItems');
          if (storedLiked) {
            setLiked(JSON.parse(storedLiked));
          } else {
            setLiked(new Array(data.product_combinations.length).fill(false));
          }
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  }, []);
  // 찜 목록 가져오기
  const fetchLikedItems = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;

      const response = await api.get('/api/picked/v1/bookmark/by-time/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 서버에서 받아온 찜 목록
      const likedIds = response.data.map((item) => item.recommendation_id);
      console.log('서버에서 받은 찜 목록 ID:', likedIds);

      // 현재 recommendations 배열과 비교하여 liked 상태 업데이트
      const newLiked = recommendations.map((recommendation) => {
        return likedIds.includes(Number(recommendation.recommendation_id));
      });

      console.log('업데이트된 liked 상태:', newLiked);
      setLiked(newLiked);

      // 세션스토리지에 찜 상태 저장
      sessionStorage.setItem('likedItems', JSON.stringify(newLiked));
    } catch (error) {
      console.error('❌ 찜 목록 로드 실패:', error);
    }
  };

  //추천 결과 유효성 검증
  const isValidRecommendationResult = (data) => {
    if (!data || !data.product_combinations || data.product_combinations.length === 0) {
      return false;
    }
    // 하나 이상의 조합에 null이 아닌 아이템이 있는지 확인
    return data.product_combinations.some((combo) => {
      if (!combo.combination) return false;
      return Object.values(combo.combination).some((item) => item !== null);
    });
  };

  return (
    <div className="container">
      <div className="content">
        <div className="recommendation-container">
          <h2>🧷 {userInfo.username}님의 추천 코디 👔</h2>
          {recommendations.length > 0 ? (
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
                    onClick={() => handleCardClick(items, recommendation.recommendation_id)}
                    style={{ cursor: 'pointer' }}>
                    <h3>추천 코디 #{index + 1}</h3>
                    <div className="total-price">총 가격: {recommendation.total_price.toLocaleString()}원</div>

                    <div
                      className={`image-grid images-${items.length}`}
                      ref={(el) => setImageGridRef(index, el)}
                      style={{ cursor: 'grab' }}>
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
          ) : (
            <div className="loading-message">추천 코디를 불러오는 중입니다...</div>
          )}
          {/* 버튼 컨테이너 추가 */}
          <div className="action-container">
            <button className="action-button" onClick={handleRetryRecommendation} disabled={isLoading}>
              다른 코디 추천받기
            </button>
            <button className="action-button" onClick={handleResetAndGoCamera} disabled={isLoading}>
              처음부터 다시하기
            </button>
            <button className="action-button" onClick={handleGoHome} disabled={isLoading}>
              메인으로 돌아가기
            </button>
            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>새로운 코디를 찾고 있어요...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FashionPage;
