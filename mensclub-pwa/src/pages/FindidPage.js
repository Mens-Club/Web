import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FindidPage.css';
import api from '../api/axios'; // ✅ axios 인스턴스

function FindidPage() {
  const [username, setName] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFindID = async () => {
    setResult('');
    setError('');
    if (!username.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    try {
      const response = await api.post('/api/account/v1/find_email/', { username });
      const data = response.data;
      if (response.ok) {
        if (data.email && data.email.length > 0) {
          setResult(`ID : ${data.email}`);
        } else {
          setError('일치하는 정보가 없습니다.');
        }
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

          <h1>아이디 찾기</h1>

          <div className="input-group">
            <input type="text" placeholder="이름" value={username} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <button className="find-btn" onClick={handleFindID}>
              아이디 찾기
            </button>
            <div className="result_container">
              {result && <div className="result"> {result}</div>}
              {error && <div className="error"> {error}</div>}
            </div>
          </div>
          <div className="bottom-links">
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
            <Link to="/find-pw">비밀번호 찾기</Link>
            <Link to="/">홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindidPage;
