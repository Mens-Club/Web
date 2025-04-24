// src/api/auth.js
import api from './axios';

export const signup = async (formData) => {
  const response = await api.post('/signup/', formData);
  return response.data;
};

export const login = async (formData) => {
    const response = await api.post('/login/', formData);
    return response.data;
  };