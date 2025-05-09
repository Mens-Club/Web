import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

function MyPage() {
  const [userInfo, setUserInfo] = useState({ email: "", height: null, weight: null });
  const [tab, setTab] = useState("ai");
  const [filter, setFilter] = useState({ order: "newest", style: "" });
  const [aiOutfits, setAiOutfits] = useState([]);
  const [clubOutfits, setClubOutfits] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [page, setPage] = useState(0);

  const outfitsPerPage = 4;
  const displayedOutfits = (tab === "ai" ? aiOutfits : clubOutfits).slice(
    page * outfitsPerPage,
    (page + 1) * outfitsPerPage
  );
  const pageCount = Math.ceil((tab === "ai" ? aiOutfits.length : clubOutfits.length) / outfitsPerPage);

  const getOutfits = async () => {
    const { order, style } = filter;
    const email = userInfo.email;
    const user_id = localStorage.getItem("userId");
    


    if (!email || !user_id) return;

    try {
      let res;

      if (tab === "ai") {
        res = await api.get("/clothes/v1/picked_clothes/mypage/", {
          params: { email },
        });
        setAiOutfits(res.data);
      } else {
        if (order === "newest" || order === "oldest") {
          res = await api.get("/picked/v1/mypage/by-time/", {
            params: { user_id, order },
          });
        } else if (order === "high" || order === "low") {
          res = await api.get("/picked/v1/mypage/by-price/", {
            params: { user_id, sort: order },
          });
        } else if (style) {
          res = await api.get("/picked/v1/mypage/by-style/", {
            params: { user_id, style },
          });
        } else {
          res = await api.get("/picked/v1/mypage/by-time/", {
            params: { user_id, order: "newest" },
          });
        }
        setClubOutfits(res.data);
      }

      const newLikedMap = {};
      res.data.forEach((item) => {
        newLikedMap[item.uuid || item.id] = true;
      });
      setLikedMap(newLikedMap);
    } catch (error) {
      console.error("❌ 아웃핏 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    async function fetchUserInfo() {
      try {
        const res = await api.get("/api/account/v1/user_info/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { username, height, weight } = res.data;
        setUserInfo({ email: username, height, weight });
      } catch (e) {
        console.error("❌ 사용자 정보 실패", e);
      }
    }
    fetchUserInfo();
  }, []);

  useEffect(() => {
    getOutfits();
    setPage(0);
  }, [userInfo.email, tab, filter]);

  const toggleLike = async (item) => {
    const token = localStorage.getItem("accessToken");
    const id = item.uuid || item.id;
    try {
      if (likedMap[id]) {
        if (tab === "ai") {
          await api.delete("/clothes/v1/picked_clothes/delete/", {
            headers: { Authorization: `Bearer ${token}` },
            params: { uuid: item.uuid },
          });
          setAiOutfits((prev) => prev.filter((o) => o.uuid !== item.uuid));
        } else {
          await api.delete("/api/picked/v1/main_like_cancel/", {
            headers: { Authorization: `Bearer ${token}` },
            params: { recommend_id: item.id },
          });
          setClubOutfits((prev) => prev.filter((o) => o.id !== item.id));
        }
      }
      setLikedMap((prev) => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error("❌ 찜 삭제 실패:", err);
    }
  };

  return (
    <div className="container">
      <div className="main-content">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-info">
              <h2>{userInfo.email} 님 안녕하세요 😄</h2>
              {userInfo.height && userInfo.weight && (
                <p>{userInfo.height}cm / {userInfo.weight}kg</p>
              )}
            </div>
            <Link to="/setting" className="settings-btn">
              <i className="fas fa-gear"></i>
            </Link>
          </div>
        </div>

        <div className="saved-outfits">
          <div className="saved-outfits-header">
            <h2>Saved Outfits 👕</h2>
            <div className="filters">
              <select
                onChange={(e) => {
                  const [type, value] = e.target.value.split(":");
                  if (type === "order") setFilter((prev) => ({ ...prev, order: value }));
                  else if (type === "style") setFilter((prev) => ({ ...prev, style: value }));
                }}
                value={filter.style ? `style:${filter.style}` : `order:${filter.order}`}
              >
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
            <button onClick={() => setTab("ai")} className={tab === "ai" ? "active" : ""}>
              AI 추천 아웃핏
            </button>
            <button onClick={() => setTab("club")} className={tab === "club" ? "active" : ""}>
              MEN'S CLUB 아웃핏
            </button>
          </div>

          {displayedOutfits.length > 0 ? (
            <>
              <div className="outfit-grid">
                {displayedOutfits.map((item) => {
                  const data = tab === "club" ? item.combination || {} : item;
                  return (
                    <div key={item.uuid || item.id} className="outfit-card">
                      <div className="image-container">
                        <img
                          src={data.image || item.thumbnail_url || item.image_url || "https://via.placeholder.com/200x250?text=No+Image"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/200x250?text=No+Image";
                          }}
                          alt={data.goods_name || "Outfit"}
                          className="outfit-img"
                        />
                        <button
                          className="heart-button"
                          onClick={() => toggleLike(item)}
                        >
                          <FontAwesomeIcon
                            icon={likedMap[item.uuid || item.id] ? solidHeart : regularHeart}
                            className={`heart-icon ${likedMap[item.uuid || item.id] ? "liked" : ""}`}
                          />
                        </button>
                      </div>
                      <div className="outfit-info">
                        <div className="brand">{data.style || "스타일 미정"}</div>
                        <div className="name">{data.goods_name || "이름 없음"}</div>
                        <div className="price">{data.total_price ? `${data.total_price.toLocaleString()}원` : "가격 미정"}</div>
                      </div>
                    </div>
                  );
                })}
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
            <p className="empty-message">
              {tab === "ai"
                ? "AI가 추천한 아웃핏이 없습니다. 새로운 스타일을 찾아보세요! 😊"
                : "mens club에서 찜한 아웃핏이 없습니다. 새로운 스타일을 찾아보세요! 😊"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
