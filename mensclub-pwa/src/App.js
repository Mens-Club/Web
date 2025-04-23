// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import MainPage from './pages/MainPage.js';
import CameraPage from './pages/CameraPage.js';
import FashionPage from './pages/FashoinPage.js';
import MyPage from './pages/Mypage.js';
import BottomNav from './components/BottomNav.js';
import FirstPage from './pages/FirstPage.js';
import LoginPage from './pages/LoginPage.js';
import SignupPage from './pages/SignupPage.js'

function App() {
  return (
    <BrowserRouter>
      <AppWithNav />
    </BrowserRouter>
  );
}

function AppWithNav() {
  const location = useLocation();
  const hideNavOnPaths = ['/', '/signup', '/login']; // 여기서 숨길 경로 지정

  const shouldHideNav = hideNavOnPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/fashion" element={<FashionPage />} />
        <Route path="/my" element={<MyPage />} />
      </Routes>

      {/* 조건부 렌더링 */}
      {!shouldHideNav && <BottomNav />}
    </>
  );
}

export default App;
