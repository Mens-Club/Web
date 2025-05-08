// src/api/auth.js
import api from './axios';


//회원가입
export const signup = async (formData) => {
  const response = await api.post('/signup/', formData);
  return response.data;
};

//로그인
export const login = async (formData) => {
    const response = await api.post('/login/', formData);
    return response.data;
  };


//비밀번호 변경 
export const changePassword = async (formData, token) => {
  const response = await api.put(
    '/change_password/',  // 또는 '/account/v1/change_password/' ← 백엔드 경로에 따라 조정
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 회원 정보(키/몸무게) 불러오기
export const getBodyInfo = async () => {
  const res = await api.get('/update/');
  return res.data;
};

// 회원 정보(키/몸무게) 수정하기
export const updateBodyInfo = async (height, weight) => {
  const res = await api.patch('/update/', {
    height: String(height),
    weight: String(weight),
  });
  return res.data;
};
