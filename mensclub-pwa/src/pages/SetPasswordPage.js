import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SetPasswordPage.css';
import api from '../api/axios'; // ✅ axios 인스턴스

function SetPasswordPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = form;
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const newErrors = {};
    let valid = true;

    if (newPassword === currentPassword) {
      newErrors.newPassword = '새 비밀번호는 기존 비밀번호와 달라야 합니다.';
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.put(
        '/api/account/v1/change_password/',
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/my');
    } catch (err) {
      const errorData = err.response?.data;
      const newErrors = {};

      if (errorData?.current_password) {
        newErrors.currentPassword = errorData.current_password.join(' ');
      }

      if (errorData?.new_password) {
        newErrors.newPassword = errorData.new_password.join(' ');
      }

      if (errorData?.detail) {
        newErrors.currentPassword = errorData.detail;
      }

      setErrors(newErrors);
    }
  };

  return (
    <div className="change-container">
      <div className="change-header">
        <button className="change-close" onClick={() => navigate(-1)}>×</button>
        <h2>비밀번호 설정</h2>
      </div>

      <div className="change-info-text">
        <span className="change-info-highlight">안전한 비밀번호를 설정하면</span><br />
        개인정보를 안전하게 보호하고<br />
        서비스를 더 편리하게 이용할 수 있어요
      </div>
      <div className="edit-tab-menu">
        <span className="active">회원 개인정보</span>
      </div>
      <form className="change-form" onSubmit={handleSubmit}>
        <label>
          현재 비밀번호
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
          {errors.currentPassword && (
            <span className="error-message">{errors.currentPassword}</span>
          )}
        </label>

        <label>
          새 비밀번호
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <small className="password-hint">
            영문자, 숫자, 특수문자를 포함하여 8자 이상 입력하세요.
          </small>
          {errors.newPassword && (
            <span className="error-message">{errors.newPassword}</span>
          )}
        </label>

        <label>
          새 비밀번호 확인
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </label>

        <div className="button-row">
          <button type="submit" className="change-save-btn">변경하기</button>
        </div>
      </form>
    </div>
  );
}

export default SetPasswordPage;
