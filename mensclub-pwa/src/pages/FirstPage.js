import React from 'react';
import '../styles/FirstPage.css';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

function FirstPage() {
  const backendBaseURL = 'https://mensclub-backend.store'; // 👉 배포 시 도메인으로 수정

  const handleSocialLogin = (provider) => {
    // 백엔드의 소셜 로그인 URL로 리다이렉트
    window.location.href = `${backendBaseURL}/accounts/${provider}/login/`;
  };

  return (
    <div className="container">
      <div className="content">
        <div className="main-section">
          <div className="text-section">
            <h1>
              MEN'S
              <br />
              CLUB
            </h1>
            <p>
              내일 입을 옷이 고민인다면?
              <br />
              당신의 스타일을
              <br />
              바로 찾아볼 수 있는
              <br />
              mens club을 이용해보세요!
              <br />
            </p>
          </div>

          <div className="image-section">
            <img src="/images/clothes.jpg" alt="이미지" />
          </div>
        </div>

        <div className="login-section">
          <button onClick={() => handleSocialLogin('kakao')} className="kakao-btn">
            <img src="/images/kakao-logo.png" alt="카카오" className="social-logo" />
            카카오로 로그인
          </button>
          <button onClick={() => handleSocialLogin('google')} className="google-btn">
            <img src="/images/google-logo.png" alt="구글" className="social-logo" />
            구글로 로그인
          </button>
          <button onClick={() => handleSocialLogin('naver')} className="naver-btn">
            <img src="/images/naver-logo.png" alt="네이버" className="social-logo" />
            네이버로 로그인
          </button>

          <div className="divider">
            <span>또는</span>
          </div>

          <Link to="/login" className="login-btn">
            일반 로그인
          </Link>

          <div className="bottom-links">
            <Link to="/signup">회원가입</Link>
            <Link to="/find-id">아이디 찾기</Link>
            <Link to="/find-pw">비밀번호 찾기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirstPage;
