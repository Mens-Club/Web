import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/FindpwPage.css';

function ResetSetPage() {
  //이전 페이지에서 가지고 온 이름 및 이메일 저장
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const username = params.get('username');
  const email = params.get('email');

  // 패스워드 관리
  const [passwordForm, setPassword] = useState({
    password: '',
    confirmPw: '',
  });

  //에러 메세지 관리 상태
  const [error, setError] = useState({
    password: '',
    confirmPw: '',
  });

  // 상태 관리
  const [status, setStatus] = useState({
    success: false,
    message: '',
  });

  // 자료 변경 관리
  const handleChange = (e) => {
    const { name, value } = e.target;

    setPassword((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [result, setResult] = useState('');

  useEffect(() => {
    //비밀번호와 비밀번호 확인이 모두 입력되면 검사
    if (passwordForm.password && passwordForm.confirmPw) {
      if (passwordForm.password !== passwordForm.confirmPw) {
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
  }, [passwordForm.password, passwordForm.confirmPw]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    if (!passwordForm.password || !passwordForm.confirmPw) {
      setStatus({ ...status, error: '비밀번호를 모두 입력해주세요.' });
      return;
    }

    // username, email, password를 API로 전송
    try {
      const response = await fetch(
        '/api/account', //백엔드 api 요청부분
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            password: passwordForm.password,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.', error: '' });
      } else {
        setStatus({ ...status, error: data.error || '비밀번호 변경에 실패했습니다.' });
      }
    } catch (err) {
      setStatus({ ...status, error: '서버와 통신 중 오류가 발생했습니다.' });
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="reset_pw">
          <div className="logo">
            <img src="/images/logo.png" alt="MEN'S CLUB" />
          </div>

          <h1>비밀번호 변경</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={passwordForm.password}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="confirmPw"
                placeholder="비밀번호 확인"
                value={passwordForm.confirmPw}
                onChange={handleChange}
              />
            </div>
            {status.error && (
              <p
                style={{
                  color: 'red',
                  paddingLeft: '25px',
                  // marginBottom: '-19px',
                  fontSize: '1rem',
                }}>
                {status.error}
              </p>
            )}
            <div className="input-group">
              <button className="find-btn">비밀번호 변경하기</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetSetPage;
