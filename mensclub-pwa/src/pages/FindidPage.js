import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FindidPage.css'; // CSS 파일 분리해서 import

function FindidPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleFindID = () => {
    console.log('이름:', name);
    console.log('이메일:', email);
    // TODO: 백엔드로 요청 보내기
  };

  return (
    <div className="container">
      <div className="content">
        <div className="find-id-form">
          <div className="logo">
            <img src="/images/logo.png" alt="MEN'S CLUB" />
          </div>

          <h1>아이디 찾기</h1>

          <div className="input-group">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="find-btn" onClick={handleFindID}>
            아이디 찾기
          </button>

          <div className="bottom-links">
            <Link to="/login">로그인</Link>
            <Link to="/find-pw">비밀번호 찾기</Link>
            <Link to="/signup">회원가입</Link>
            <Link to="/">홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindidPage;
