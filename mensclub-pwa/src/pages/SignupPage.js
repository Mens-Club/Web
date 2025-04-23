import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginPage.css'; // 로그인과 동일한 스타일 재사용
import '../styles/SignupPage.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🟢 회원가입 시도:', {
      email,
      password,
      confirmPw,
      height,
      weight,
      gender
    });

    // TODO: 비밀번호 확인 및 백엔드 연동
    // if (password !== confirmPw) { ... }
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

            {/* ✅ 선택 입력: 키 */}
            <div className="input-group">
              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            {/* ✅ 선택 입력: 몸무게 */}
            <div className="input-group">
              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {/* ✅ 선택 입력: 성별 */}
            <div className="input-group">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

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
