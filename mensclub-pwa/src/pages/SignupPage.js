import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // ✅ axios 인스턴스 import
import '../styles/LoginPage.css';
import '../styles/SignupPage.css';
import '../styles/Layout.css';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPw: '',
    height: '',
    weight: '',
    age: '',
    sex: '',
    bodyPicture: '',
  });

  // 필드별 에러 메시지를 관리하는 상태 추가
  const [formErrors, setFormErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPw: '',
    general: '', // 일반적인 에러 메시지
  });

  const [status, setStatus] = useState({
    success: false,
    message: '',
    countdown: 0,
  });

  // 비밀번호 일치 여부 실시간 반환
  useEffect(() => {
    // 비밀번호와 비밀번호 확인이 모두 입력되었을 때만 검사
    if (formData.password && formData.confirmPw) {
      if (formData.password !== formData.confirmPw) {
        setStatus((prevStatus) => ({
          ...prevStatus,
          error: '비밀번호가 일치하지 않습니다.',
        }));
      } else {
        setStatus((prevStatus) => ({
          ...prevStatus,
          error: '',
        }));
      }
    }
  }, [formData.password, formData.confirmPw]);

  // 회원가입 완료 후 리다이렉션 및 카운트다운 useEffect
  useEffect(() => {
    let timer;
    if (status.countdown > 0) {
      timer = setTimeout(() => {
        const newCountdown = status.countdown - 1;
        setStatus((prev) => ({
          ...prev,
          countdown: newCountdown,
          message: `회원가입이 완료되었습니다 🥰 ${newCountdown}초 후 메인 페이지로 이동합니다.`,
        }));

        if (newCountdown === 0) {
          navigate('/');
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [status.countdown, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 폼 제출 전 에러 초기화
    setFormErrors({
      email: '',
      username: '',
      password: '',
      confirmPw: '',
      general: '',
    });

    try {
      const response = await api.post(
        '/api/account/v1/signup/',
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          height: formData.height ? formData.height : null,
          weight: formData.weight ? formData.weight : null,
          age: formData.age ? parseInt(formData.age, 10) : null,
          sex: formData.sex || 'M',
        },
        {
          withCredentials: false,
        }
      );

      console.log(' 회원가입 성공:', response.data);

      const countdownTime = 3;
      setStatus((prevStatus) => ({
        ...prevStatus,
        error: '',
        success: true,
        countdown: countdownTime,
        message: `회원가입이 완료되었습니다 🥰 
                  ${countdownTime}초 후 메인 로그인 페이지로 이동합니다.`,
      }));
    } catch (err) {
      console.error('❌ 회원가입 실패:', err);
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (err.response?.data) {
        const errorData = err.response.data;
        const newErrors = { ...formErrors };

        if (errorData.email) {
          newErrors.email = Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email;
        }
        if (errorData.username) {
          newErrors.username = Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username;
        }

        // 상태 업데이트 호출 추가
        setFormErrors(newErrors);
      } else {
        setFormErrors({
          ...formErrors,
          general: '회원가입 중 오류가 발생했습니다.',
        });
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="container">
        <div className="content">
          <div className="login-card">
            <div className="gradient-circle"></div>
            <div className="logo-signup">
              <img src="/images/logo.png" alt="MEN'S CLUB" />
            </div>
            <h1>Sign Up</h1>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors.email && (
                  <p style={{ color: 'red', paddingLeft: '10px', marginBottom: '-19px', fontSize: '1rem' }}>
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  placeholder="이름"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
                {formErrors.username && (
                  <p style={{ color: 'red', paddingLeft: '10px', marginBottom: '-19px', fontSize: '1rem' }}>
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPw"
                  placeholder="비밀번호 확인"
                  required
                  value={formData.confirmPw}
                  onChange={handleChange}
                />
                {status.error && (
                  <p style={{ color: 'red', paddingLeft: '10px', marginBottom: '-19px', fontSize: '1rem' }}>
                    {status.error}
                  </p>
                )}
              </div>
              {/* <div className="input-group">
              <input
                type="number"
                name="height"
                placeholder="키 (cm)"
                value={formData.height}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="weight"
                placeholder="몸무게 (kg)"
                value={formData.weight}
                onChange={handleChange}
              />
            </div> */}
              <div className="input-group">
                <input type="number" name="age" placeholder="나이" value={formData.age} onChange={handleChange} />
              </div>
              <div className="input-group">
                <select value={formData.sex} name="sex" onChange={handleChange}>
                  <option value="">성별 선택</option>
                  <option value="M">남자</option>
                  <option value="F">여자</option>
                </select>
              </div>
              <div className="input-group">
                <button className="login-btn2">Sign Up</button>
              </div>
              {status.success && <p style={{ color: 'green', textAlign: 'center', width: '100%' }}>{status.message}</p>}
            </form>
            <div className="bottom-links">
              <Link to="/login">로그인</Link>
              <Link to="/find-id">아이디 찾기</Link>
              <Link to="/find-pw">비밀번호 찾기</Link>
              <Link to="/">홈으로</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
