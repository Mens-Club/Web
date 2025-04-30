import React, { useState } from 'react';
import '../styles/EditProfilePage.css';
import { useNavigate } from 'react-router-dom';


// 이미 정보가 있는 경우, 정보 를 올린후 수정


function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPw: '',
    age: '',
    sex: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    //api 수정 해야함
    try {
      const response = await fetch('api/account/v1/update_profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          age: form.age,
          sex: form.sex,
        }),
      });

      if (response.ok) {
        alert('회원정보가 수정되었습니다!');
        navigate('/my');
      } else {
        const data = await response.json();
        alert(`수정 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-header">
      <button className="edit-close" onClick={() => navigate(-1)}>×</button>
        <h2>회원정보 수정</h2>
      </div>

      <div className="edit-info-text">
        <span className="edit-info-highlight">회원정보를 등록하면</span><br />
        맞춤형 서비스를 이용할 수 있고,<br />
        다양한 혜택을 받아볼 수 있어요
      </div>

      <div className="edit-tab-menu">
        <span className="active">회원 상세정보</span>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <label>
          이메일
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          사용자 이름
          <input type="text" name="username" value={form.username} onChange={handleChange} required />
        </label>
        <label>
          비밀번호
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          비밀번호 확인
          <input type="password" name="confirmPw" value={form.confirmPw} onChange={handleChange} required />
        </label>
        <label>
          나이
          <input type="number" name="age" value={form.age} onChange={handleChange} required />
        </label>
        <div className="edit-radio-group">
          <label>
            <input type="radio" name="sex" value="male" onChange={handleChange} checked={form.sex === 'male'} />
            남성
          </label>
          <label>
            <input type="radio" name="sex" value="female" onChange={handleChange} checked={form.sex === 'female'} />
            여성
          </label>
        </div>
        <button type="submit" className="edit-save-btn">저장하기</button>
      </form>
    </div>
  );
}

export default EditProfilePage;
