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
  const [userInfo, setUserInfo] = useState({ username: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 재추천 요청시 로딩 창 표현
  const imageGridRefs = useRef([]); // 아이템 스와이프
  const isDraggingRef = useRef(false);
  const [likedMap, setLikedMap] = useState({});
  const [statusText, setStatusText] = useState('');

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
      // 현재 상태를 history state에 저장
      window.history.replaceState(
        {
          likedItems: likedMap,
          recommendations: recommendations,
        },
        ''
      );

      // 상세 페이지로 이동 (API 경로 포함)
      navigate(
        `/product-detail/${items[0].idx}?recommendationId=${recommendationId}&source=fashion&apiPath=/api/picked/v1/recommend_picked/${recommendationId}`
      );
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

  // 공통 추천 요청 함수 (초기 로드 및 재요청에 모두 사용)
  const fetchRecommendation = async (isRetry = false) => {
    // 재요청인 경우에만 확인 창 표시
    if (isRetry) {
      const userConfirmed = window.confirm('다른 코디 추천을 진행하시겠습니까?');
      if (!userConfirmed) {
        return false;
      }
    }

    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        return false;
      }

      // 재요청인 경우에만 세션 스토리지 및 상태 초기화
      if (isRetry) {
        sessionStorage.removeItem('likedItemsMap');
        setLikedMap({});
      }

      // 세션스토리지에서 이미지 URL 가져오기
      const imageUrl = sessionStorage.getItem('capturedImageUrl');
      if (!imageUrl) {
        alert('이미지 정보가 없습니다. 처음부터 다시 시작해주세요.');
        navigate('/camera');
        return false;
      }

      // 재시도 관련 변수
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      console.log('재시도 로직 시작: 최대 시도 횟수 =', maxRetries);

      while (retryCount <= maxRetries && !success) {
        try {
          // 재시도 중인 경우 메시지 표시
          if (retryCount > 0) {
            console.log(`재시도 ${retryCount} 진행 중... (백오프 지연: ${1000 * Math.pow(2, retryCount - 1)}ms)`);
            setStatusText(`상품 인식 재시도 중... (${retryCount}/${maxRetries})`);
            // 지수 백오프 적용
            const delay = 1000 * Math.pow(2, retryCount - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          // 추천 요청 보내기
          const recommendRes = await api.post(
            '/api/recommend/v1/generator/',
            { image_url: imageUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // 결과 유효성 검사
          if (isValidRecommendationResult(recommendRes.data)) {
            // 유효한 결과면 바로 사용
            sessionStorage.setItem('recommendationData', JSON.stringify(recommendRes.data));
            setRecommendations(recommendRes.data.product_combinations);
            setLikedMap(new Array(recommendRes.data.product_combinations.length).fill(false));
            console.log(`✅ 유효한 추천 결과를 받았습니다. (시도: ${retryCount + 1}/${maxRetries + 1})`);
            // setStatusText('상품 인식 성공!');
            success = true;
            return true;
          } else {
            console.log(`❌ 유효하지 않은 추천 결과, 재시도 필요... (${retryCount + 1}/${maxRetries + 1})`);
            retryCount++;
          }
        } catch (error) {
          console.error(`❌ 시도 ${retryCount + 1}/${maxRetries + 1} 실패:`, error);
          console.log('오류 상태 코드:', error.response?.status);
          console.log('오류 메시지:', error.message);

          // 마지막 시도가 아니면 재시도
          if (retryCount < maxRetries) {
            retryCount++;
          } else {
            break;
          }
        }
      }

      // 모든 재시도 실패 시
      if (!success) {
        setStatusText('상품 인식에 실패했습니다. 다른 이미지로 다시 시도해주세요.');
        alert('유효한 추천을 생성하지 못했습니다. 다른 이미지로 시도해보세요.');
        navigate('/fashion');
        return false;
      }

      return true;
    } catch (error) {
      console.error(`❌ ${isRetry ? '재추천' : '초기 추천'} 요청 실패:`, error);
      alert('상품 인식에 실패했습니다. 다른 이미지로 다시 시도해주세요.');
      navigate('/fashion');
      return false;
    } finally {
      setIsLoading(false);
      console.log(`재시도 로직 종료`);
    }
  };

  // 다른 코디 추천받기 버튼 클릭 핸들러
  const handleRetryRecommendation = async () => {
    await fetchRecommendation(true);
    // 결과 처리는 fetchRecommendation 내부에서 이루어짐
  };

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

      const recommendationId = index;

      // 현재 찜 상태 확인
      const isCurrentlyLiked = likedMap[recommendationId];

      // 찜이 되어 있는 경우에만 확인 창 표시
      if (isCurrentlyLiked) {
        const confirmUnlike = window.confirm('찜을 해제하시겠습니까?');
        if (!confirmUnlike) {
          return;
        }
      }

      /// 상태 먼저 업데이트 (낙관적 UI 업데이트)
      const newLikedMap = { ...likedMap };
      newLikedMap[recommendationId] = !isCurrentlyLiked;
      setLikedMap(newLikedMap);

      // 세션스토리지에 찜 상태 저장
      sessionStorage.setItem('likedItemsMap', JSON.stringify(newLikedMap));

      // 서버에 찜 상태 업데이트
      const response = await api.post(
        '/api/picked/v1/recommend_picked/toggle',
        { recommendation_id: recommendationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 응답 상태 처리
      if (response.data && response.data.status === 'added') {
        console.log('✅ 찜 추가 성공:', recommendationId);
      } else if (response.data && response.data.status === 'removed') {
        console.log('✅ 찜 삭제 성공:', recommendationId);
      }
    } catch (error) {
      console.error('❌ 찜 상태 업데이트 실패:', error);
      fetchLikedItems(); // 에러 시 서버에서 최신 상태 다시 가져오기
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
          const storedLikedMap = sessionStorage.getItem('likedItemsMap');
          if (storedLikedMap) {
            setLikedMap(JSON.parse(storedLikedMap));
          } else {
            setLikedMap({});
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

      const response = await api.get('/api/picked/v1/by-time/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 서버에서 받아온 찜 목록으로 맵 생성
      const newLikedMap = {};
      response.data.forEach((item) => {
        newLikedMap[item.recommendation_id] = true;
      });

      setLikedMap(newLikedMap);
      sessionStorage.setItem('likedItemsMap', JSON.stringify(newLikedMap));
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
    <div className="fashion-container">
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
                      onClick={(e) => toggleLike(e, recommendation.recommendation_id)}
                      aria-label={likedMap[recommendation.recommendation_id] ? '찜 해제' : '찜 추가'}>
                      <FontAwesomeIcon
                        icon={likedMap[recommendation.recommendation_id] ? solidHeart : regularHeart}
                        className={`heart-icon ${likedMap[recommendation.recommendation_id] ? 'liked' : ''}`}
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
                <br />
                {statusText && <p className="status-message">{statusText}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FashionPage;
