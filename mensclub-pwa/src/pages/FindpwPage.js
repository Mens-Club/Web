import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/FindpwPage.css'; // CSS 파일 분리해서 import

function FindpwPage() {
  const [email, setEmail] = useState('');
  const [username, setUserName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const handleFindID = async () => {
    setResult('');
    setError('');
    if (!username.trim() || email.trim()) {
      alert('공란 없이 모두 작성해주세요');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/account/v1/find_password/', {
        method: 'POST',
        headers: {
          'content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        navigate(`/reset-password?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || '일치하는 정보가 없습니다.');
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="find-id-form">
          <div className="logo">
            <img src="/images/logo.png" alt="MEN'S CLUB" />
          </div>

          <h1>비밀번호 변경</h1>

          <div className="input-group">
            <input type="text" placeholder="이름" value={username} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <button className="find-btn" onClick={handleFindID}>
              비밀번호 변경
            </button>
          </div>
          <div className="result_container">{error && <div className="error"> {error}</div>}</div>
          <div className="bottom-links">
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
            <Link to="/find-id">아이디 찾기</Link>
            <Link to="/">홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FindpwPage;
