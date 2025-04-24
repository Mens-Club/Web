import React from 'react';
import '../styles/FirstPage.css';
import { Link } from 'react-router-dom';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기

function FirstPage() {
  return (
    
    <div className='container'>
      <div className="content">

        <div className="main-section">
          <div className="text-section">
            <h1>MEN'S<br />CLUB</h1>
            <p>
              내일 입을 옷이 고민인다면?<br />
              당신의 스타일을<br />
              바로 찾아볼 수 있는<br />
              mens club을 이용해보세요!<br />
            </p>
          </div>

          <div className="image-section">
            <img
              src="/images/clothes.jpg"
              alt="이미지"
            />
          </div>
        </div>

        <div className="login-section">
          <Link to="/login" className="login-btn">LOGIN</Link>
          <Link to="/signup" className="signup-btn">SIGNUP</Link>
          <Link to="/main" className="guest-link">비회원으로 이용하기</Link>
        </div>

      </div>
    </div>
  );
}

export default FirstPage;
