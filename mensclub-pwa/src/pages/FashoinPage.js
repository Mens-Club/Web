import '../styles/FashoinPage.css';
import React, { useRef, useState, useEffect} from 'react';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기
import api from '../api/axios'; // ✅ 백엔드 호출용 axios 인스턴스

function FashionPage() {
  // 임시 가짜 데이터
  const dummyData = [
    { id: 1, imageUrl: '/images/outfit1.jpg' },
    { id: 2, imageUrl: '/images/outfit2.jpg' },
    { id: 3, imageUrl: '/images/outfit3.jpg' },
    { id: 4, imageUrl: '/images/outfit4.jpg' },
  ];

  const [outfits, setOutfits] = useState([]);
  const [liked, setLiked] = useState([]);
  const [currentAction, setCurrentAction] = useState('');

    // ✅ 사용자 정보를 저장할 상태
    const [userInfo, setUserInfo] = useState({
      username: '',
    });

  useEffect(() => {
    // 가짜 데이터로 세팅
    setOutfits(dummyData);
    setLiked(new Array(dummyData.length).fill(false));
  }, []);

  // ✅ 백엔드에서 사용자 정보 불러오기
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('❌ 토큰이 없습니다. 로그인 필요.');
          return;
        }
  
        const response = await api.get('/api/account/v1/user_info/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,  // ✅ 추가
        });
  
        const { username} = response.data;
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

    // 추후 실제 서버로 POST 요청 시 아래 코드 사용
    // axios.post('/api/like', {
    //   outfitId: outfits[index].id,
    //   liked: newLiked[index]
    // });
  };

  return (
    <div className="container">
      <div className="content">
        <div className="recommendation-container">
          <h2>🧷 {userInfo.username}님의 추천 코디 👔</h2>
          <div className="recommend-grid">
            {outfits.map((item, index) => (
              <div key={item.id} className="recommend-card">
                <img src={item.imageUrl} alt={`recommend ${index + 1}`} />
                <button
                  className={`like-btn ${liked[index] ? 'liked' : ''}`}
                  onClick={() => toggleLike(index)}
                >
                  ♥
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
