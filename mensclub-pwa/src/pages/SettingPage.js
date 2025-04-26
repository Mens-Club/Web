import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingPage.css';

function SettingPage() {
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  const showPopup = (action) => {
    setCurrentAction(action);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setPopupVisible(false);
  };

  const handleAction = () => {
    if (currentAction === 'logout') {
      // ✅ 팝업 먼저 닫고
      hidePopup();

      // ✅ 부드럽게 500ms 정도 기다렸다가
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/'); // ✅ 로그인 화면으로 이동
      }, 500); // 0.5초 뒤 이동
    } else {
      hidePopup();
    }
  };

  const popupMessages = {
    edit: '회원정보를 수정하시겠습니까?',
    password: '비밀번호를 설정하시겠습니까?',
    preferences: '맞춤 정보를 변경하시겠습니까?',
    profile: '프로필을 설정하시겠습니까?',
    logout: '로그아웃 하시겠습니까?',
  };

  return (
    <div className="setting-container">
      <div className="setting-content">
        <div className="setting-header">
          <button className="setting-back-btn" onClick={() => navigate(-1)}>←</button>
          <h1 className="setting-title">내 정보</h1>
        </div>

        <div className="setting-profile-section">
          <h2>원*은</h2>
          <p className="setting-email">91******@naver.com</p>
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

      {/* ✅ 팝업 */}
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

export default SettingPage;
