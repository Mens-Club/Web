  import React, { useEffect, useState } from "react";
  import "../styles/MyPage.css";
  import { Link } from "react-router-dom";
  import api from "../api/axios";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
  import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

  function MyPage() {
    const [userInfo, setUserInfo] = useState({ email: "", height: null, weight: null });
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [liked, setLiked] = useState({});
    const [page, setPage] = useState(0);

    const outfitsPerPage = 4;
    const pageCount = Math.ceil(savedOutfits.length / outfitsPerPage);
    const displayedOutfits = savedOutfits.slice(page * outfitsPerPage, (page + 1) * outfitsPerPage);

    const toggleLike = async (outfit) => {
      const token = localStorage.getItem("accessToken");
      const isLiked = liked[outfit.uuid];

      try {
        if (isLiked) {
          await api.delete(`/clothes/v1/picked_clothes/delete/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { uuid: outfit.uuid },
          });
          setSavedOutfits((prev) => prev.filter((o) => o.uuid !== outfit.uuid));
          setLiked((prev) => ({ ...prev, [outfit.uuid]: false }));
        } else {
          const payload = {
            email: userInfo.email,
            top: outfit.top,
            outerwear: outfit.outerwear,
            bottom: outfit.bottom,
            shoes: outfit.shoes,
            summary_picture: outfit.thumbnail_url || outfit.image || "",
          };
          const res = await api.post("/clothes/v1/picked_clothes/add/", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const newOutfit = res.data;
          setSavedOutfits((prev) => [...prev, newOutfit]);
          setLiked((prev) => ({ ...prev, [newOutfit.uuid]: true }));
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
          setUserInfo({ email: username, height, weight });
        } catch (error) {
          console.error("❌ 사용자 정보 불러오기 실패:", error);
        }
      }

      async function fetchSavedOutfits(email) {
        try {
          const res = await api.get("/clothes/v1/picked_clothes/mypage/", {
            headers: { Authorization: `Bearer ${token}` },
            params: { email },
          });
          setSavedOutfits(res.data);
          const likedMap = {};
          res.data.forEach((item) => {
            likedMap[item.uuid] = true;
          });
          setLiked(likedMap);
        } catch (error) {
          console.error("❌ 찜한 아웃핏 불러오기 실패:", error);
        }
      }

      fetchUserInfo().then(() => {
        if (userInfo.email) fetchSavedOutfits(userInfo.email);
      });
    }, [userInfo.email]);

    return (
      <div className="container">
        <div className="main-content">
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-info">
                <h2>{userInfo.email} 님 안녕하세요 😄</h2>
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
            <h2>Saved Outfits 👕</h2>
            {savedOutfits.length > 0 ? (
              <>
                <div className="outfit-grid">
                  {displayedOutfits.map((outfit) => (
                    <div key={outfit.uuid} className="outfit-card">
                      <div className="image-container">
                        <img
                          src={outfit.thumbnail_url || "https://via.placeholder.com/200x250.png?text=No+Image"}
                          alt={outfit.goods_name || "Outfit"}
                          className="outfit-img"
                        />
                        <button
                          className="heart-button"
                          onClick={() => toggleLike(outfit)}
                          aria-label={liked[outfit.uuid] ? "찜 해제" : "찜 추가"}
                        >
                          <FontAwesomeIcon
                            icon={liked[outfit.uuid] ? solidHeart : regularHeart}
                            className={`heart-icon ${liked[outfit.uuid] ? "liked" : ""}`}
                          />
                        </button>
                      </div>
                      <div className="outfit-info">
                        <div className="brand">{outfit.style || "스타일 미정"}</div>
                        <div className="name">{outfit.goods_name}</div>
                        <div className="price">{outfit.price ? `${outfit.price}원` : "가격 미정"}</div>
                      </div>
                    </div>
                  ))}
                </div>
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