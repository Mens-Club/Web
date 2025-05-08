import React, { useState, useEffect } from 'react';
import '../styles/EditProfilePage.css';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // ✅ axios 인스턴스

function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    age: '',
    sex: '',
  });

  // ✅ 기존 회원정보 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/account/v1/update/');
        const { username, age, sex } = res.data;
        setForm({
          username: username || '',
          age: age || '',
          sex: sex || '',
        });
      } catch (err) {
        console.error('❌ 회원 정보 요청 실패:', err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 회원정보 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.patch('/api/account/v1/update/', {
        username: form.username,
        age: form.age,
        sex: form.sex,
      });

      alert('회원정보가 수정되었습니다!');
      navigate('/my');
    } catch (err) {
      const error = err.response?.data;
      const message =
        error?.detail || error?.username?.[0] || error?.age?.[0] || error?.sex?.[0] || '알 수 없는 오류';
      alert('수정 실패: ' + message);
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
          사용자 이름
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          나이
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          성별
          <select name="sex" value={form.sex} onChange={handleChange} required>
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </label>
        <button type="submit" className="edit-save-btn">저장하기</button>
      </form>
    </div>
  );
}

export default EditProfilePage;
