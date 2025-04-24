import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; // ✅ axios 인스턴스 import
import '../styles/LoginPage.css';
import '../styles/SignupPage.css';
import '../styles/Layout.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPw) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await api.post('/api/account/v1/signup/', {
        email,
        username,
        password,
        height: height ? parseInt(height, 10) : null,
        weight: weight ? parseInt(weight, 10) : null,
        age: age ? parseInt(age, 10) : null,
        sex: sex || null
      });

      console.log('✅ 회원가입 성공:', response.data);
      setSuccess(true);
      setError('');
    } catch (err) {
      console.error('❌ 회원가입 실패:', err);
      if (err.response?.data) {
        const messages = Object.values(err.response.data)
          .flat()
          .join(', ');
        setError(messages);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
      setSuccess(false);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="login-card">
          <div className="gradient-circle"></div>
          <h1>Sign Up</h1>
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
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUserName(e.target.value)}
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
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="input-group">
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>회원가입이 완료되었습니다!</p>}

            <button type="submit" className="login-btn2">Sign Up</button>
          </form>
          <div className="signup-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
