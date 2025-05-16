import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyPage.css';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: '', height: null, weight: null });
  const [tab, setTab] = useState('ai');
  const [filter, setFilter] = useState({ order: 'newest', style: '' });
  const [aiOutfits, setAiOutfits] = useState([]);
  const [clubOutfits, setClubOutfits] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const moveThresholdRef = useRef(5); // 드래그로 인식할 최소 이동 거리
  const outfitGridRef = useRef(null); // outfitGridRef 추가

  const handleCardClick = (item) => {
    if (isDraggingRef.current) {
      return; // 드래깅 중이면 클릭 무시
    }
    if (tab === 'ai') {
      // AI 탭의 경우
      const recommendationId = item.recommendation?.id;
      console.log('클릭한 아이템:', item);
      console.log('추천 ID:', recommendationId);

      if (recommendationId) {
        navigate(`/product-detail/${recommendationId}?recommendationId=${recommendationId}&source=mypage&tab=ai`);
      } else {
        alert('상품 정보를 찾을 수 없습니다.');
      }
    } else {
      // CLUB 탭의 경우
      const mainRecommendationId = item.main_recommendation?.id || item.id;

      if (mainRecommendationId) {
        navigate(
          `/product-detail/${mainRecommendationId}?recommendationId=${mainRecommendationId}&source=mypage&tab=club`
        );
      } else {
        alert('상품 정보를 찾을 수 없습니다.');
      }
    }
  };

  const outfitsPerPage = 4;
  const displayedOutfits = (tab === 'ai' ? aiOutfits : clubOutfits).slice(
    page * outfitsPerPage,
    (page + 1) * outfitsPerPage
  );
  const pageCount = Math.ceil((tab === 'ai' ? aiOutfits.length : clubOutfits.length) / outfitsPerPage);

  const getOutfits = async () => {
    const { order, style } = filter;
    const name = userInfo.name;
    const token = sessionStorage.getItem('accessToken');

    if (!name) return;

    try {
      // 먼저 현재 사용자 정보를 가져옴
      const userResponse = await api.get('/api/account/v1/user_info/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user_id = userResponse.data.user_id; // 백엔드에서 반환한 사용자 ID
      let res;
      const headers = { Authorization: `Bearer ${token}` };

      if (tab === 'ai') {
        // AI 탭의 경우

        if (order === 'newest' || order === 'oldest') {
          res = await api.get('/api/picked/v1/recommend_picked/by-time/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, order },
          });
        } else if (order === 'high' || order === 'low') {
          res = await api.get('/api/picked/v1/recommend_picked/by-price/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, sort: order },
          });
        } else if (style === '미니멀' || style === '캐주얼') {
          res = await api.get('/api/picked/v1/recommend_picked/by-style/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, style },
          });
        } else {
          res = await api.get('/api/picked/v1/recommend_picked/by-time/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, order: 'newest' },
          });
        }
        console.log('AI 찜 목록 응답:', res.data);
        setAiOutfits(res.data);
      } else {
        // CLUB 탭의 경우

        if (order === 'newest' || order === 'oldest') {
          res = await api.get('/api/picked/v1/main_picked/by-time/', {
            headers,
            params: { user_id, order },
          });
        } else if (order === 'high' || order === 'low') {
          res = await api.get('/api/picked/v1/main_picked/by-price/', {
            headers,
            params: { user_id, sort: order },
          });
        } else if (style === '미니멀' || style === '캐주얼') {
          res = await api.get('/api/picked/v1/main_picked/by-style/', {
            headers,
            params: { user_id, style },
          });
        } else {
          res = await api.get('/api/picked/v1/main_picked/by-time/', {
            headers,
            params: { user_id, order: 'newest' },
          });

          console.log('📦 clubOutfits 응답 구조:', res.data); // 👈 여기 추가
          setClubOutfits(res.data);
        }

        setClubOutfits(res.data);
      }

      const newLikedMap = {};
      res.data.forEach((item) => {
        newLikedMap[item.uuid || item.id || item.recommendation?.id || item.main_recommendation?.id] = true;
      });
      setLikedMap(newLikedMap);
    } catch (error) {
      console.error('❌ 아웃핏 불러오기 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
    }
    setIsLoading(false); // 로딩 종료
  };

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    async function fetchUserInfo() {
      try {
        if (!token) {
          console.error('❌ 토큰이 없습니다.');
          setIsLoading(false);
          navigate('/');
          return;
        }

        const res = await api.get('/api/account/v1/user_info/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { username, height, weight, user_id } = res.data;
        setUserInfo({ name: username, height, weight, user_id });
        setIsLoading(false);
      } catch (e) {
        console.error('❌ 사용자 정보 불러오기 실패', e);
        setIsLoading(false); // 중요: 에러 발생 시 로딩 상태 해제

        if (e.response && e.response.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/');
        }
      }
    }

    fetchUserInfo();
  }, [navigate]);

  // 로딩 컴포넌트
  const LoadingSpinner = () => (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>로딩 중...</p>
    </div>
  );

  useEffect(() => {
    getOutfits();
    setPage(0);
  }, [userInfo.name, tab, filter]);

  const toggleLike = async (item) => {
    const token = sessionStorage.getItem('accessToken');
    const id = item.uuid || item.id;

    try {
      // 찜 해제 전 사용자 확인
      const confirmUnlike = window.confirm('찜을 해제하시겠습니까?');
      if (!confirmUnlike) {
        return; // 사용자가 취소한 경우 함수 종료
      }

      if (tab === 'ai') {
        // AI 추천 아웃핏인 경우 토글 API 사용
        await api.post(
          '/api/picked/v1/recommend_picked/toggle',
          { recommendation_id: item.recommendation?.id || item.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // UI에서 제거
        setAiOutfits((prev) => prev.filter((o) => o.uuid !== item.uuid));
      } else {
        // CLUB 아웃핏인 경우 토글 API 사용
        await api.post(
          '/api/picked/v1/main_picked/toggle',
          { main_recommendation_id: item.main_recommendation?.id || item.id }, // ✅ 수정됨
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // UI에서 제거
        setClubOutfits((prev) => prev.filter((o) => o.id !== item.id));
      }

      // 찜 상태 업데이트
      setLikedMap((prev) => ({ ...prev, [id]: false }));

      // 중요: 목록 새로고침
      setIsLoading(true);
      getOutfits();
    } catch (err) {
      console.error('❌ 찜 삭제 실패:', err);
      alert('찜 해제 중 오류가 발생했습니다.');
    }
  };

  // 제품 총 가격 구하는 부분
  const calculateTotalPrice = (recommendation) => {
    if (!recommendation) return 0;
    let total = 0;
    if (recommendation.top) total += recommendation.top.price || 0;
    if (recommendation.bottom) total += recommendation.bottom.price || 0;
    if (recommendation.outer) total += recommendation.outer.price || 0;
    if (recommendation.shoes) total += recommendation.shoes.price || 0;
    return total.toLocaleString();
  };

  // 아이템 개수를 계산하는 함수
  const getItemCount = (recommendation) => {
    if (!recommendation) return 0;
    let count = 0;
    if (recommendation.top?.s3_path) count++;
    if (recommendation.bottom?.s3_path) count++;
    if (recommendation.outer?.s3_path) count++;
    if (recommendation.shoes?.s3_path) count++;
    return count;
  };

  /// 2. 이벤트 핸들러 통합 및 개선
  const handleDragStart = (clientX) => {
    if (!outfitGridRef.current) return;

    isDraggingRef.current = true;
    startXRef.current = clientX - outfitGridRef.current.offsetLeft;
    scrollLeftRef.current = outfitGridRef.current.scrollLeft;
    outfitGridRef.current.style.cursor = 'grabbing';
  };

  const handleDragMove = (clientX) => {
    if (!isDraggingRef.current || !outfitGridRef.current) return false;

    const x = clientX - outfitGridRef.current.offsetLeft;
    const moved = Math.abs(x - startXRef.current);

    // 일정 거리 이상 움직였을 때만 스크롤 처리
    if (moved > moveThresholdRef.current) {
      const walk = (x - startXRef.current) * 2;
      outfitGridRef.current.scrollLeft = scrollLeftRef.current - walk;
      return true;
    }
    return false;
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current || !outfitGridRef.current) return;

    isDraggingRef.current = false;
    outfitGridRef.current.style.cursor = 'grab';

    // 스크롤 위치에 따라 페이지 변경
    const containerWidth = outfitGridRef.current.clientWidth;
    const scrollPosition = outfitGridRef.current.scrollLeft;
    const startPosition = scrollLeftRef.current;
    const scrollDifference = scrollPosition - startPosition;
    const scrollThreshold = containerWidth * 0.15; // 임계값 (15%)

    console.log('스크롤 차이:', scrollDifference, '임계값:', scrollThreshold);

    // 스크롤 방향과 페이지 전환 로직
    if (Math.abs(scrollDifference) > scrollThreshold) {
      if (scrollDifference > 0 && page > 0) {
        // 오른쪽으로 드래그 (이전 페이지)
        console.log('이전 페이지로 이동');
        setPage((prev) => Math.max(0, prev - 1));
      } else if (scrollDifference < 0 && page < pageCount - 1) {
        // 왼쪽으로 드래그 (다음 페이지)
        console.log('다음 페이지로 이동');
        setPage((prev) => Math.min(pageCount - 1, prev + 1));
      }
    }

    // 스크롤 위치 초기화
    setTimeout(() => {
      if (outfitGridRef.current) {
        outfitGridRef.current.scrollLeft = 0;
      }
    }, 50);
  };

  // 3. 마우스 이벤트 핸들러 수정
  const handleMouseDown = (e) => {
    handleDragStart(e.pageX);
  };

  const handleMouseMove = (e) => {
    if (handleDragMove(e.pageX)) {
      e.preventDefault(); // 스크롤이 발생한 경우만 기본 동작 방지
    }
  };

  // 4. 터치 이벤트 핸들러 수정
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].pageX);
  };

  // 터치 이벤트 핸들러 수정
  const handleTouchMove = (e) => {
    // preventDefault 호출 없이 드래그 처리만 수행
    handleDragMove(e.touches[0].pageX);
  };

  return (
    <div className="container">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="main-content">
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-info">
                <h2>{userInfo.name} 님 안녕하세요 😄</h2>
                {userInfo.height && userInfo.weight && (
                  <p>
                    {userInfo.height}cm / {userInfo.weight}kg
                  </p>
                )}
              </div>
              <Link to="/setting" className="settings-btn">
                <i className="fas fa-gear"></i>
              </Link>
            </div>
          </div>

          <div className="saved-outfits">
            <div className="saved-outfits-header">
              <h2>찜한 상품</h2>
              <div className="filters">
                <select
                  onChange={(e) => {
                    const [type, value] = e.target.value.split(':');
                    if (type === 'order') {
                      setFilter({ order: value, style: null });
                    } else if (type === 'style') {
                      setFilter({ style: value, order: null });
                    }
                  }}
                  value={filter.style ? `style:${filter.style}` : `order:${filter.order}`}>
                  <option value="order:newest">최신순</option>
                  <option value="order:oldest">오래된순</option>
                  <option value="order:high">높은가격순</option>
                  <option value="order:low">낮은가격순</option>
                  <option value="style:미니멀">미니멀</option>
                  <option value="style:캐주얼">캐주얼</option>
                </select>
              </div>
            </div>

            <div className="tab-buttons">
              <button
                onClick={() => {
                  setTab('ai');
                  setFilter({ order: 'newest', style: null });
                }}
                className={tab === 'ai' ? 'active' : ''}>
                AI 추천 아웃핏
              </button>
              <button
                onClick={() => {
                  setTab('club');
                  setFilter({ order: 'newest', style: null });
                }}
                className={tab === 'club' ? 'active' : ''}>
                MEN'S CLUB 아웃핏
              </button>
            </div>

            {displayedOutfits.length > 0 ? (
              <>
                <div
                  className="outfit-grid"
                  ref={outfitGridRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove} // 이 부분 추가
                  onTouchEnd={handleDragEnd}
                  style={{
                    cursor: 'grab',
                    overflowX: 'hidden',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    touchAction: 'pan-y', // 수직 스크롤은 허용하고 수평만 제어
                  }}>
                  {displayedOutfits.map((item) => {
                    const data = tab === 'club' ? item.main_recommendation || item.combination || item : item;
                    return (
                      <div
                        key={item.uuid || item.id}
                        className="outfit-card"
                        onClick={() => handleCardClick(item)}
                        style={{ cursor: 'pointer' }}>
                        <div className="image-container">
                          {tab === 'ai' ? (
                            <div className="outfit-items-grid items-4">
                              {['top', 'bottom', 'outer', 'shoes'].map((part, i) => {
                                const s3 = item.recommendation?.[part]?.s3_path;
                                return (
                                  <div className="grid-item" key={i}>
                                    {s3 ? (
                                      <img
                                        src={s3}
                                        alt={part}
                                        className="item-thumbnail"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '';
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="outfit-items-grid" onClick={(e) => e.stopPropagation()}>
                              {['top', 'bottom', 'outer', 'shoes'].map((part, i) => {
                                const s3 = item.main_recommendation?.[part]?.s3_path;
                                return (
                                  <div className="grid-item" key={i}>
                                    {s3 ? <img src={s3} alt={part} className="item-thumbnail" /> : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {/* <button
                            className="heart-button"
                            onClick={(e) => {
                              e.stopPropagation(); // 이벤트 전파 방지
                              toggleLike(item);
                            }}>
                            <FontAwesomeIcon
                              icon={likedMap[item.uuid || item.id] ? solidHeart : regularHeart}
                              className={`heart-icon ${likedMap[item.uuid || item.id] ? 'liked' : ''}`}
                            />
                          </button> */}
                        </div>
                        <div className="outfit-info">
                          <div className="brand">
                            {tab === 'ai'
                              ? `${item.recommendation?.top?.category || ''} / ${
                                  item.recommendation?.bottom?.category || ''
                                }`
                              : data.style || '스타일 미정'}
                          </div>
                          <div className="name">
                            {tab === 'ai'
                              ? (item.recommendation?.top?.goods_name || '') +
                                (item.recommendation?.bottom ? ' 외' : '')
                              : data.goods_name || ''}
                          </div>
                          <div className="price-with-heart">
                            <span className="price-text">
                              {tab === 'ai'
                                ? `${calculateTotalPrice(item.recommendation)}원`
                                : data.total_price
                                ? `${data.total_price.toLocaleString()}원`
                                : '가격 미정'}
                            </span>
                            <button
                              className="heart-button-inline"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(item);
                              }}>
                              <FontAwesomeIcon
                                icon={likedMap[item.uuid || item.id] ? solidHeart : regularHeart}
                                className={`heart-icon ${likedMap[item.uuid || item.id] ? 'liked' : ''}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pagination-dots">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <span key={i} className={`dot ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}></span>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-message">
                {tab === 'ai'
                  ? 'AI가 추천한 아웃핏이 없습니다. 새로운 스타일을 찾아보세요! 😊'
                  : 'mens club에서 찜한 아웃핏이 없습니다. 새로운 스타일을 찾아보세요! 😊'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
