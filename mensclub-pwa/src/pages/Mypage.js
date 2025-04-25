import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import "../styles/Layout.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link } from 'react-router-dom';  
import api from '../api/axios';

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    nickname: "사용자",
    height: null,
    weight: null,
  });

  const [savedOutfits, setSavedOutfits] = useState([]);

  // 찜 취소 (하트 다시 누르면 제거)
  const handleUnlike = (id) => {
    setSavedOutfits(savedOutfits.filter((outfit) => outfit.id !== id));
  };

  // 6개씩 묶어서 슬라이드 단위로 나누는 함수
  const groupIntoSlides = (data, size = 6) => {
    const result = [];
    for (let i = 0; i < data.length; i += size) {
      result.push(data.slice(i, i + size));
    }
    return result;
  };

  useEffect(() => {
    // ✨ 사용자 정보
    async function fetchUserInfo() {
      try {
        const response = await api.get('/api/account/v1/profile/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const { username, height, weight } = response.data;
        setUserInfo({ nickname: username, height, weight });
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
      }
    }

    // ✨ 저장된 아웃핏 (임시)
    async function fetchSavedOutfits() {
      const mockOutfits = [
        {
          id: 1,
          image: "./images/outfit1.jpg",
          alt: "casual fall navy set",
          items: ["라운드넥 스웨터", "와이드 팬츠", "토트백"],
        },
        {
          id: 2,
          image: "./images/outfit3.jpg",
          alt: "high density cotton set",
          items: ["화이트 셔츠", "블랙 팬츠", "크로스백"],
        },
        {
          id: 3,
          image: "./images/outfit4.jpg",
          alt: "soft casual set",
          items: ["핑크 셔츠", "베이지 팬츠", "숄더백"],
        },
        {
          id: 4,
          image: "./images/outfit2.jpg",
          alt: "cool street look",
          items: ["블랙 티셔츠", "청바지", "운동화"],
        },
        {
          id: 5,
          image: "./images/outfit1.jpg",
          alt: "autumn tone",
          items: ["베이지 코트", "슬랙스", "부츠"],
        },
        {
          id: 6,
          image: "./images/outfit3.jpg",
          alt: "basic fit",
          items: ["셔츠", "진청바지", "흰색 스니커즈"],
        },
        {
          id: 7,
          image: "./images/outfit4.jpg",
          alt: "weekend chill",
          items: ["맨투맨", "조거 팬츠", "크로스백"],
        },
      ];

      setSavedOutfits(mockOutfits);
    }

    fetchUserInfo();
    fetchSavedOutfits();
  }, []);

  return (
    <div className="container">
      <div className="content">
        {/* ✅ 프로필 */}
        <div className="profile-section">
          <div className="profile-header">
            <h2>
              {userInfo.nickname}{" "}
              {userInfo.height && userInfo.weight
                ? `${userInfo.height}cm ${userInfo.weight}kg`
                : ""}
            </h2>
            <Link to="/setting" className="settings-btn">
              <i className="fas fa-gear"></i>
            </Link>
          </div>
        </div>

        {/* ✅ 저장된 아웃핏 */}
        <div className="saved-outfits">
          <h2>
            Saved Outfits <i className="fas fa-heart"></i>
          </h2>

          {savedOutfits.length > 0 ? (
            <Swiper spaceBetween={20} slidesPerView={1}>
              {groupIntoSlides(savedOutfits, 4).map((slideGroup, idx) => (
                <SwiperSlide key={idx}>
                  <div className="outfit-slide">
                    <div className="outfit-row">
                      {slideGroup.map((outfit) => (
                        <div key={outfit.id} className="outfit-card">
                          <img src={outfit.image} alt={outfit.alt} />
                          <div className="outfit-info">
                            <div className="outfit-items">
                              {outfit.items.map((item, i) => (
                                <span key={i}>{item}</span>
                              ))}
                            </div>
                            <button
                              className="like-btn liked"
                              onClick={() => handleUnlike(outfit.id)}
                            >
                              ♥
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p style={{ color: "#666", padding: "1rem" }}>
              아직 저장된 아웃핏이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
