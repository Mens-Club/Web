import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // ✅ axios 인스턴스 import
import '../styles/LoginPage.css';
import '../styles/Layout.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/account/v1/login/', {
        username,
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
          <h1>Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            <button type="submit" className="login-btn2">Login</button>
          </form>
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
