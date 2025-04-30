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
  const [liked, setLiked] = useState({}); // { outfitId: true/false }

  const toggleLike = async (id) => {
    const token = localStorage.getItem("accessToken");
  
    try {
      await api.delete(`/api/outfits/${id}/unlike`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // ✅ 프론트 상태에서 해당 아웃핏 제거
      setSavedOutfits((prev) => prev.filter((outfit) => outfit.id !== id));
  
      // ✅ liked 상태에서도 제거 (선택사항)
      setLiked((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error("❌ 찜 해제 실패:", error);
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
        // 백엔드에서 [{ id, image, alt }] 형식으로 받는다고 가정
        setSavedOutfits(res.data);

        // 초기 liked 상태 세팅
        const likedMap = {};
        res.data.forEach((item) => {
          likedMap[item.id] = true;
        });
        setLiked(likedMap);
      } catch (error) {
        console.error("❌ 찜한 아웃핏 불러오기 실패:", error);
      }
    }

    fetchUserInfo();
    fetchSavedOutfits();
  }, []);

  return (
    <div className="container">
      <div className="content">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-info">
              <h2>{userInfo.username} 님 안녕하세요 😄 </h2>
              {userInfo.height && userInfo.weight && (
                <p className="sub-info">{userInfo.height}cm / {userInfo.weight}kg</p>
              )}
            </div>
            <Link to="/setting" className="settings-btn">
              <i className="fas fa-gear"></i>
            </Link>
          </div>
        </div>

        <div className="saved-outfits">
  <h2>Saved Outfits 👕 </h2>

  {savedOutfits.length > 0 ? (
    <div className="outfit-grid">
      {savedOutfits.map((outfit) => (
        <div key={outfit.id} className="outfit-card">
          <img src={outfit.image} alt={outfit.alt} className="outfit-img" />
          <button
            className="heart-button"
            onClick={() => toggleLike(outfit.id)}
            aria-label="찜 해제"
          >
            <FontAwesomeIcon
              icon={solidHeart}
              className="heart-icon liked"
            />
          </button>
        </div>
      ))}
    </div>
  ) : (
    <p className="empty-message">찜한 아웃핏이 없습니다 😢</p>
  )}
</div>

      </div>
    </div>
  );
}

export default MyPage;
