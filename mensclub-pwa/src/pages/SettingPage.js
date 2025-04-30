import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // ✅ 백엔드 호출용 axios 인스턴스
import '../styles/SettingPage.css';

function SettingPage() {
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  // ✅ 사용자 정보를 저장할 상태
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
  });

  const showPopup = (action) => {
    setCurrentAction(action);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setPopupVisible(false);
  };

  const handleAction = () => {
    hidePopup();
  
    setTimeout(() => {
      if (currentAction === 'logout') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
      } else if (currentAction === 'edit') {
        navigate('/edit-profile');
      } else if (currentAction === 'password') {
        navigate('/set-password');
      } else if (currentAction === 'preferences') {
        navigate('/set-body');
      } else if (currentAction === 'profile') {
        navigate('/profile');
      }
    }, 500); // ✅ 팝업 닫는 애니메이션 고려
  };
  

  const popupMessages = {
    edit: '회원정보를 수정하시겠습니까?',
    password: '비밀번호를 설정하시겠습니까?',
    preferences: '맞춤 정보를 변경하시겠습니까?',
    profile: '프로필을 설정하시겠습니까?',
    logout: '로그아웃 하시겠습니까?',
  };

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
  
        const { username, email } = response.data;
        setUserInfo({ username, email });
      } catch (error) {
        console.error('❌ 사용자 정보 불러오기 실패:', error);
      }
    }
  
    fetchUserInfo();
  }, []);
  

  return (
    <div className="setting-container">
      <div className="setting-content">
        <div className="setting-header">
          <button className="setting-back-btn" onClick={() => navigate(-1)}>←</button>
          <h1 className="setting-title">내 정보</h1>
        </div>

        {/* ✅ 백엔드에서 받아온 사용자 정보 출력 */}
        <div className="setting-profile-section">
          <h2>{userInfo.username ? maskName(userInfo.username) : ''}</h2>
          <p className="setting-email">{userInfo.email ? maskEmail(userInfo.email) : ''}</p>
        </div>

        <div className="setting-menu-list">
          <div className="setting-menu-item" onClick={() => showPopup('edit')}>
            <span>회원정보 수정</span>
            <span className="setting-arrow">→</span>
          </div>
          <div className="setting-menu-item" onClick={() => showPopup('password')}>
            <span>비밀번호 설정</span>
            <div className="setting-right-section">
              <span className="setting-text">설정하기</span>
              <span className="setting-arrow">→</span>
            </div>
          </div>
          <div className="setting-menu-item" onClick={() => showPopup('preferences')}>
            <span>맞춤 정보</span>
            <div className="setting-right-section">
              <span className="setting-text">변경하기</span>
              <span className="setting-arrow">→</span>
            </div>
          </div>
          <div className="setting-menu-item" onClick={() => showPopup('profile')}>
            <span>프로필 설정</span>
            <div className="setting-profile-code">
              <img src="/images/logo.png" alt="프로필" className="setting-small-profile" />
              <span className="setting-arrow">→</span>
            </div>
          </div>
          <div className="setting-menu-item" onClick={() => showPopup('logout')}>
            <span>로그아웃</span>
            <span className="setting-arrow">→</span>
          </div>
        </div>
      </div>

      {/* 팝업 */}
      {popupVisible && (
        <div className={`setting-popup-overlay ${popupVisible ? 'show' : ''}`}>
          <div className="setting-popup-content">
            <div className="setting-popup-text">{popupMessages[currentAction]}</div>
            <div className="setting-popup-buttons">
              <button className="setting-popup-btn cancel" onClick={hidePopup}>취소</button>
              <button className="setting-popup-btn confirm" onClick={handleAction}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ 이름 마스킹 (예: "원예은" → "원*은")
function maskName(name) {
  if (name.length < 2) return name;
  return name[0] + '*' + name.slice(2);
}

// ✅ 이메일 마스킹 (예: "test@example.com" → "te******@example.com")
function maskEmail(email) {
  const [localPart, domain] = email.split('@');
  if (localPart.length < 2) return email;
  const maskedLocal = localPart.slice(0, 2) + '*'.repeat(localPart.length - 2);
  return `${maskedLocal}@${domain}`;
}

export default SettingPage;
