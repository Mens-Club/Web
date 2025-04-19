import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    nickname: "사용자",
    height: null,
    weight: null,
  });

  const [savedOutfits, setSavedOutfits] = useState([]);

  useEffect(() => {
    // ✨ 1. 사용자 정보 불러오기
    async function fetchUserInfo() {
      const mockData = {
        nickname: "바나나님",
        height: 185,
        weight: 100,
      };
      setUserInfo(mockData);
    }

    // ✨ 2. 찜한 아웃핏 불러오기
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
      ];

      setSavedOutfits(mockOutfits); // 실제로는 DB에서 가져오기
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
            <button className="settings-btn">
              <i className="fas fa-gear"></i>
            </button>
          </div>
        </div>

        {/* ✅ 저장된 아웃핏 */}
        <div className="saved-outfits">
          <h2>
            Saved Outfits <i className="fas fa-heart"></i>
          </h2>
          <div className="outfit-grid">
            {savedOutfits.length > 0 ? (
              savedOutfits.map((outfit) => (
                <div key={outfit.id} className="outfit-card">
                  <img src={outfit.image} alt={outfit.alt} />
                  <div className="outfit-info">
                    <div className="outfit-items">
                      {outfit.items.map((item, idx) => (
                        <span key={idx}>{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#666", padding: "1rem" }}>
                아직 저장된 아웃핏이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
