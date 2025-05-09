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

// 회원 프로필 수정 (이름, 비밀번호, 나이, 성별)
export const updateProfile = async (formData) => {
  const res = await api.patch('/api/account/v1/update_profile/', {
    username: formData.username,
    password: formData.password,
    age: formData.age,
    sex: formData.sex,
  });
  return res.data;
};

// 추천 찜 추가
export const addLike = async (recommendId) => {
  const res = await api.post('/api/picked/v1/main_like/', {
    main_recommend_id: recommendId,
  });
  return res.data;
};

// 추천 찜 삭제
export const cancelLike = async (recommendId) => {
  const res = await api.delete('/api/picked/v1/main_like_cancel/', {
    data: { recommend_id: recommendId },
  });
  return res.data;
};
