import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyPage.css';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import LoadingPage from './LoadingPage';
import ConfirmModal from '../components/ConfirmModal';

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: '', height: null, weight: null });
  const [tab, setTab] = useState('ai');
  const [filter, setFilter] = useState({ order: 'newest', style: '' });

  const [likedMap, setLikedMap] = useState({});
  const outfitsPerPage = 4;
  const [visibleCount, setVisibleCount] = useState(outfitsPerPage);

  const [aiOutfits, setAiOutfits] = useState([]);
  const [clubOutfits, setClubOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태는 true로 설정

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const handleCardClick = (item) => {
    if (tab === 'ai') {
      // AI 탭의 경우
      const recommendationId = item.recommendation?.id;

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

  const allOutfits = tab === 'ai' ? aiOutfits : clubOutfits;
  const displayedOutfits = allOutfits.slice(0, visibleCount);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    async function fetchUserInfo() {
      try {
        if (!token) {
          console.error('❌ 토큰이 없습니다.');
          setIsLoading(false);
          // 수정: 토큰이 없을 때 사용자에게 알림 후 리다이렉트
          alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          navigate('/', { replace: true }); // replace: true로 설정하여 브라우저 히스토리에 남지 않도록 함
          return;
        }

        // 로딩 상태 활성화 (LoadingPage 컴포넌트 표시)
        setIsLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

        const res = await api.get('/api/account/v1/user_info/', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId); // 타임아웃 제거
        setIsLoading(false);

        const { username, height, weight, user_id } = res.data;
        setUserInfo({ name: username, height, weight, user_id });
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

  async function getOutfits(selectedTab = tab) {
    const { order, style } = filter;
    const token = sessionStorage.getItem('accessToken');

    if (!userInfo.name) {
      setIsLoading(false);
      return;
    }

    try {
      // 먼저 현재 사용자 정보를 가져옴
      const userResponse = await api.get('/api/account/v1/user_info/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user_id = userResponse.data.user_id;
      const headers = { Authorization: `Bearer ${token}` };

      setIsLoading(true);

      let aiRes = { data: [] }; // 기본값 설정
      let clubRes = { data: [] }; // 기본값 설정

      if (selectedTab === 'ai') {
        // AI 탭의 경우
        if (order === 'newest' || order === 'oldest') {
          aiRes = await api.get('/api/picked/v1/recommend_picked/by-time/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, order },
          });
        } else if (order === 'high' || order === 'low') {
          aiRes = await api.get('/api/picked/v1/recommend_picked/by-price/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, sort: order },
          });
        } else if (style === '미니멀' || style === '캐주얼') {
          aiRes = await api.get('/api/picked/v1/recommend_picked/by-style/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, style },
          });
        } else {
          aiRes = await api.get('/api/picked/v1/recommend_picked/by-time/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id, order: 'newest' },
          });
        }
        console.log('AI 찜 목록 응답:', aiRes.data);
        setAiOutfits(aiRes.data);
      } else {
        // CLUB 탭의 경우
        if (order === 'newest' || order === 'oldest') {
          clubRes = await api.get('/api/picked/v1/main_picked/by-time/', {
            headers,
            params: { user_id, order },
          });
        } else if (order === 'high' || order === 'low') {
          clubRes = await api.get('/api/picked/v1/main_picked/by-price/', {
            headers,
            params: { user_id, sort: order },
          });
        } else if (style === '미니멀' || style === '캐주얼') {
          clubRes = await api.get('/api/picked/v1/main_picked/by-style/', {
            headers,
            params: { user_id, style },
          });
        } else {
          clubRes = await api.get('/api/picked/v1/main_picked/by-time/', {
            headers,
            params: { user_id, order: 'newest' },
          });
        }
        console.log('Club 찜 목록 응답:', clubRes.data);
        setClubOutfits(clubRes.data);
      }

      // 좋아요 상태 업데이트
      const newLikedMap = {};
      const combinedData = [...(aiRes?.data || []), ...(clubRes?.data || [])];
      combinedData.forEach((item) => {
        if (item) {
          newLikedMap[item.uuid || item.id || item.recommendation?.id || item.main_recommendation?.id] = true;
        }
      });
      setLikedMap(newLikedMap);
      sessionStorage.setItem('likedItemsMap', JSON.stringify(newLikedMap)); // 추가
    } catch (error) {
      console.error('❌ 아웃핏 불러오기 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setAiOutfits([]);
      setClubOutfits([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && userInfo.name) {
      setIsLoading(true);
      getOutfits(tab).finally(() => {
        setIsLoading(false);
        setVisibleCount(outfitsPerPage);
      });
    }
  }, [userInfo.name, tab, filter]);

  const toggleLike = async (item) => {
    // 모달창을 열고 해당 아이템 정보 저장
    setModalItem(item);
    setModalOpen(true);
  };

  // 모달에서 확인 버튼 클릭 시 실행될 함수
  const handleConfirmUnlike = async () => {
    const token = sessionStorage.getItem('accessToken');
    const item = modalItem;
    const id = item.uuid || item.id;

    try {
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
          { main_recommendation_id: item.main_recommendation?.id || item.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // UI에서 제거
        setClubOutfits((prev) => prev.filter((o) => o.id !== item.id));
      }

      // 찜 상태 업데이트
      setLikedMap((prev) => ({ ...prev, [id]: false }));
      // 목록 새로고침
      setIsLoading(true);
      getOutfits();
    } catch (err) {
      console.error('❌ 찜 삭제 실패:', err);
      alert('찜 해제 중 오류가 발생했습니다.');
    } finally {
      // 모달 닫기
      setModalOpen(false);
      setModalItem(null);
    }
  };

  // 모달에서 취소 버튼 클릭 시 실행될 함수
  const handleCancelUnlike = () => {
    setModalOpen(false);
    setModalItem(null);
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
  return (
    <div className="container">
      {isLoading ? (
        <LoadingPage isEmbedded={true} />
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
                <div className="outfit-grid">
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
                            <div className="outfit-items-grid">
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

                {visibleCount < allOutfits.length && (
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <button
                      className="more-button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + outfitsPerPage, allOutfits.length))}>
                      SHOW MORE ({Math.ceil(visibleCount / outfitsPerPage)}/
                      {Math.ceil(allOutfits.length / outfitsPerPage)})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="empty-message">
                  {tab === 'ai'
                    ? 'AI가 추천한 아웃핏이 없습니다. 새로운 스타일을 찾아보세요! 😊'
                    : "men's club에서 찜한 아웃핏이 없습니다. 새로운 스타일을 찾아보세요! 😊"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 찜 해제 확인 모달 */}
      <ConfirmModal
        isOpen={modalOpen}
        onCancel={handleCancelUnlike}
        onConfirm={handleConfirmUnlike}
        title="찜 해제 확인"
        message="정말로 이 아이템을 찜 목록에서 삭제하시겠습니까?"
      />
    </div>
  );
}

export default MyPage;
