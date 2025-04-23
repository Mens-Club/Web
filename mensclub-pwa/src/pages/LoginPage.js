import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginPage.css';
import PageWrapper from '../components/PageWrapper';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 나중에 DB 연동을 위한 틀
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🟡 로그인 시도:', { email, password });

    // TODO: 백엔드 API 요청 보내기
    // axios.post('/api/login', { email, password })
    //   .then(response => console.log(response))
    //   .catch(err => console.error(err));
  };

  return (
    <div className="container">
      <div className="content">
        <div className='login-card'>
        <div className="gradient-circle"></div>
        <h1>Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
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
