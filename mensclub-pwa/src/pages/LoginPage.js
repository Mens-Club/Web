import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // ✅ axios 인스턴스 import
import '../styles/LoginPage.css';
import '../styles/Layout.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/account/v1/login/', {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;

      // ✅ 토큰 저장
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // ✅ 홈으로 이동
      navigate('/main');
    } catch (err) {
      console.error('❌ 로그인 실패:', err);
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="login-card">
          <div className="gradient-circle"></div>
          <div className="logo">
            <img src="/images/logo.png" alt="MEN'S CLUB" />
          </div>
          <h1>Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            <div className="input-group">
            <button type="submit" className="login-btn2">
              Login
            </button>
            </div>
          </form>
          <div className="bottom-links">
            <Link to="/signup">회원가입</Link>
            <Link to="/find-id">아이디 찾기</Link>
            <Link to="/find-pw">비밀번호 찾기</Link>
            <Link to="/">홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
