import '../styles/FashoinPage.css';
import React, { useRef, useState, useEffect } from 'react';
import '../styles/Layout.css';
import api from '../api/axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from 'react-router-dom'; // ✅ 추가

function FashionPage() {
  const navigate = useNavigate(); // ✅ 추가

  const dummyData = [
    { id: 1, imageUrl: '/images/outfit1.jpg' },
    { id: 2, imageUrl: '/images/outfit2.jpg' },
    { id: 3, imageUrl: '/images/outfit3.jpg' },
    { id: 4, imageUrl: '/images/outfit4.jpg' },
  ];

  const [outfits, setOutfits] = useState([]);
  const [liked, setLiked] = useState([]);
  const [userInfo, setUserInfo] = useState({ username: '' });

  useEffect(() => {
    setOutfits(dummyData);
    setLiked(new Array(dummyData.length).fill(false));
  }, []);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('❌ 토큰이 없습니다. 로그인 필요.');
          return;
        }
        const response = await api.get('/api/account/v1/user_info/', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const { username } = response.data;
        setUserInfo({ username });
      } catch (error) {
        console.error('❌ 사용자 정보 불러오기 실패:', error);
      }
    }
    fetchUserInfo();
  }, []);

  const toggleLike = (index) => {
    const newLiked = [...liked];
    newLiked[index] = !newLiked[index];
    setLiked(newLiked);

    // ✅ TODO: 서버에 찜 상태 업데이트
    /*
    const outfitId = outfits[index].id;
    const isLiked = newLiked[index];
    const token = localStorage.getItem('accessToken');
    if (isLiked) {
      await api.post('/clothes/v1/picked_clothes/add/', { outfitId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await api.delete('/clothes/v1/picked_clothes/delete/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { outfitId },
      });
    }
    */
  };

  // ✅ 이미지 클릭 시 상세페이지 이동
  const handleImageClick = (id) => {
    navigate(`/outfit/${id}`);
  };

  return (
    <div className="container">
      <div className="content">
        <div className="recommendation-container">
          <h2>🧷 {userInfo.username}님의 추천 코디 👔</h2>
          <div className="recommend-grid">
            {outfits.map((item, index) => (
              <div key={item.id} className="recommend-card">
                <img
                  src={item.imageUrl}
                  alt={`recommend ${index + 1}`}
                  onClick={() => handleImageClick(item.id)} // ✅ 클릭 핸들러
                  className="clickable-img"
                />
                <button
                  className="heart-button"
                  onClick={() => toggleLike(index)}
                  aria-label={liked[index] ? "찜 해제" : "찜 추가"}
                >
                  <FontAwesomeIcon
                    icon={liked[index] ? solidHeart : regularHeart}
                    className={`heart-icon ${liked[index] ? "liked" : ""}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FashionPage;
