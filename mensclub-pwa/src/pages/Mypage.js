import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import "../styles/Layout.css";
import { Link } from "react-router-dom";
import api from "../api/axios";

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    username: "",
    height: null,
    weight: null,
  });

  const [savedOutfits, setSavedOutfits] = useState([]);
  const [page, setPage] = useState(0);

  const ITEMS_PER_PAGE = 6;

  const handlePageClick = (pageIndex) => {
    setPage(pageIndex);
  };

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await api.get("/api/account/v1/user_info/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { username, height, weight } = response.data;
        setUserInfo({ username, height, weight });
      } catch (error) {
        console.error("❌ 사용자 정보 불러오기 실패:", error);
      }
    }

    async function fetchSavedOutfits() {
      const mockOutfits = [
        { id: 1, image: "./images/outfit1.jpg", alt: "casual fall navy set" },
        { id: 2, image: "./images/outfit3.jpg", alt: "high density cotton set" },
        { id: 3, image: "./images/outfit4.jpg", alt: "soft casual set" },
        { id: 4, image: "./images/outfit2.jpg", alt: "cool street look" },
        { id: 5, image: "./images/outfit5.jpg", alt: "dandy casual set" },
        { id: 6, image: "./images/outfit6.jpg", alt: "light spring look" },
        { id: 7, image: "./images/outfit7.jpg", alt: "street hoodie set" },
      ];
      setSavedOutfits(mockOutfits);
    }

    fetchUserInfo();
    fetchSavedOutfits();
  }, []);

  const totalPages = Math.ceil(savedOutfits.length / ITEMS_PER_PAGE);
  const currentOutfits = savedOutfits.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="container">
      <div className="content">
        
        <div className="profile-section">

          <div className="profile-header">
            <div className="profile-info">
              <h2>{userInfo.username} 님 안녕하세요😄 </h2>
              {(userInfo.height && userInfo.weight) && (
                <p className="sub-info">
                  {userInfo.height}cm / {userInfo.weight}kg
                </p>
              )}
            </div>

            <Link to="/setting" className="settings-btn">
              <i className="fas fa-gear"></i>
            </Link>
          </div>

        </div>

        {/* ✅ saved-outfits - 스와이퍼 살아 있음 */}
        <div className="saved-outfits">
          <h2>Saved Outfits <i className="fas fa-heart"></i></h2>
          {savedOutfits.length > 0 ? (
            <>
              <div className="outfit-slide">
                <div className="outfit-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {currentOutfits.map((outfit) => (
                    <div key={outfit.id} className="outfit-card">
                      <img src={outfit.image} alt={outfit.alt} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ dot 페이지네이션 */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                {Array.from({ length: totalPages }, (_, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePageClick(idx)}
                    style={{
                      width: page === idx ? '14px' : '10px',
                      height: page === idx ? '14px' : '10px',
                      borderRadius: '50%',
                      backgroundColor: page === idx ? '#007bff' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: page === idx ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </>
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
