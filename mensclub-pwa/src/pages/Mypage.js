import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

function MyPage() {
  const [userInfo, setUserInfo] = useState({ username: "", height: null, weight: null });
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [liked, setLiked] = useState({});
  const [page, setPage] = useState(0); // 🔹 현재 페이지 번호

  const outfitsPerPage = 4;
  const pageCount = Math.ceil(savedOutfits.length / outfitsPerPage);
  const displayedOutfits = savedOutfits.slice(page * outfitsPerPage, (page + 1) * outfitsPerPage);

  const toggleLike = async (id) => {
    const token = localStorage.getItem("accessToken");
    const isLiked = liked[id];

    try {
      if (isLiked) {
        await api.delete(`/api/outfits/${id}/unlike`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedOutfits((prev) => prev.filter((outfit) => outfit.id !== id));
        setLiked((prev) => ({ ...prev, [id]: false }));
      } else {
        const res = await api.post(`/api/outfits/${id}/like`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newOutfit = res.data;
        setSavedOutfits((prev) => [...prev, newOutfit]);
        setLiked((prev) => ({ ...prev, [id]: true }));
      }
    } catch (error) {
      console.error("❌ 찜 토글 실패:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    async function fetchUserInfo() {
      try {
        const response = await api.get("/api/account/v1/user_info/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { username, height, weight } = response.data;
        setUserInfo({ username, height, weight });
      } catch (error) {
        console.error("❌ 사용자 정보 불러오기 실패:", error);
      }
    }

    async function fetchSavedOutfits() {
      try {
        const res = await api.get("/api/account/v1/likes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedOutfits(res.data);
        const likedMap = {};
        res.data.forEach((item) => {
          likedMap[item.id] = true;
        });
        setLiked(likedMap);
      } catch (error) {
        console.error("❌ 찜한 아웃핏 불러오기 실패:", error);

        // 임시 데이터
        const mockOutfits = [
          { id: 1, image: "https://image.msscdn.net/thumbnails/images/goods_img/20220825/2742895/2742895_1_big.jpg?w=1200", alt: "AI Outfit 1" },
          { id: 2, image: "https://image.msscdn.net/thumbnails/images/goods_img/20240422/4072377/4072377_17201682100834_big.jpg?w=1200", alt: "AI Outfit 2" },
          { id: 3, image: "https://image.msscdn.net/thumbnails/images/goods_img/20240422/4072507/4072507_17146392502714_big.jpg?w=1200", alt: "AI Outfit 3" },
          { id: 4, image: "", alt: "AI Outfit 4" },
          { id: 5, image: "", alt: "AI Outfit 5" },
          { id: 6, image: "", alt: "AI Outfit 6" },
        ];
        setSavedOutfits(mockOutfits);
        const likedMap = {};
        mockOutfits.forEach((item) => {
          likedMap[item.id] = true;
        });
        setLiked(likedMap);
      }
    }

    fetchUserInfo();
    fetchSavedOutfits();
  }, []);

  return (
    <div className="container">
      <div className="content">

        {/* 프로필 섹션 */}
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-info">
              <h2>{userInfo.username} 님 안녕하세요 😄</h2>
              {userInfo.height && userInfo.weight && (
                <p className="sub-info">{userInfo.height}cm / {userInfo.weight}kg</p>
              )}
            </div>
            <Link to="/setting" className="settings-btn">
              <i className="fas fa-gear"></i>
            </Link>
          </div>
        </div>

        {/* 찜한 아웃핏 */}
        <div className="saved-outfits">
          <h2>Saved Outfits 👕</h2>
          {savedOutfits.length > 0 ? (
            <>
              <div className="outfit-grid">
                {displayedOutfits.map((outfit) => (
                  <div key={outfit.id} className="outfit-card">
                    <img src={outfit.image || "https://via.placeholder.com/200x250.png?text=No+Image"} alt={outfit.alt} className="outfit-img" />
                    <button
                      className="heart-button"
                      onClick={() => toggleLike(outfit.id)}
                      aria-label={liked[outfit.id] ? "찜 해제" : "찜 추가"}
                    >
                      <FontAwesomeIcon
                        icon={liked[outfit.id] ? solidHeart : regularHeart}
                        className={`heart-icon ${liked[outfit.id] ? "liked" : ""}`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 도트 */}
              <div className="pagination-dots">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === page ? "active" : ""}`}
                    onClick={() => setPage(i)}
                  ></span>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-message">찜한 아웃핏이 없습니다 😢</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
