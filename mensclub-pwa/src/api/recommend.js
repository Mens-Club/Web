// src/api/recommend.js
//추천 관련 API, 찜 관련 API
import api from './axios';

// ✅ 오늘의 랜덤 추천 (4개)
export const fetchRandomRecommendations = async () => {
  const res = await api.get('/api/picked/v1/main/random/', {
    params: { count: 4 },
  });
  return res.data;
};

// ✅ 가격대별 추천 (10만원대, 20만원대, 30만원대)
export const fetchPriceRecommendations = async (priceLabel) => {
  const brackets = '100000,200000,300000'; // 고정된 가격 구간
  const res = await api.get('/api/picked/v1/main/by-price/', {
    params: { brackets, per: 4 },
  });
  return res.data[priceLabel] || [];
};

// ✅ 스타일별 추천 (미니멀, 캐주얼 등)
export const fetchStyleRecommendations = async (style) => {
  const res = await api.get('/api/picked/v1/main/by-style/', {
    params: { style, count: 4 },
  });
  return res.data;
};

// ✅ 찜 추가
export const addLike = async (recommendId) => {
  const res = await api.post('/api/picked/v1/main_like/', {
    main_recommend_id: recommendId,
  });
  return res.data;
};

// ✅ 찜 삭제
export const cancelLike = async (recommendId) => {
  const res = await api.delete('/api/picked/v1/main_like_cancel/', {
    data: { recommend_id: recommendId },
  });
  return res.data;
};
