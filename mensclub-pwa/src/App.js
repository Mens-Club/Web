import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/PageWrapper'; // ✅ 페이지 감싸는 애니메이션 컴포넌트

import MainPage from './pages/MainPage.js';
import CameraPage from './pages/CameraPage.js';
import FashionPage from './pages/FashoinPage.js';
import MyPage from './pages/Mypage.js';
import BottomNav from './components/BottomNav.js';
import TopNav from './components/TopNav.js';
import FirstPage from './pages/FirstPage.js';
import LoginPage from './pages/LoginPage.js';
import FindIDPage from './pages/FindidPage.js'; // ✅ 정확한 경로와 대소문자
import SignupPage from './pages/SignupPage.js';
import FindPWPage from './pages/FindpwPage.js';
import SettingPage from './pages/SettingPage.js';
import ResetSetPage from './pages/ResetPwPage.js';
import DetailPage from './pages/DetailPage.js';

function App() {
  return (
    <BrowserRouter>
      <AppWithNav />
    </BrowserRouter>
  );
}

function AppWithNav() {
  const location = useLocation();

  // 숨길 경로 (TopNav와 BottomNav 모두 숨길)
  const hideNavOnPaths = ['/', '/signup', '/login', '/find-id', '/find-pw', '/setting'];
  const shouldHideNav = hideNavOnPaths.includes(location.pathname);

  // 보여줄 경로 (TopNav, BottomNav 둘 다 보여줄)
  const showNavOnPaths = ['/main', '/camera', '/fashion', '/my', '/product-detail'];
  const shouldShowNav = showNavOnPaths.includes(location.pathname);

  return (
    <>
      {/* ✅ TopNav는 보여줄 경로에만 렌더링 */}
      {shouldShowNav && <TopNav />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <FirstPage />
              </PageWrapper>
            }
          />
          <Route
            path="/login"
            element={
              <PageWrapper>
                <LoginPage />
              </PageWrapper>
            }
          />
          <Route
            path="/signup"
            element={
              <PageWrapper>
                <SignupPage />
              </PageWrapper>
            }
          />
          <Route
            path="/main"
            element={
              <PageWrapper>
                <MainPage />
              </PageWrapper>
            }
          />
          <Route
            path="/camera"
            element={
              <PageWrapper>
                <CameraPage />
              </PageWrapper>
            }
          />
          <Route
            path="/fashion"
            element={
              <PageWrapper>
                <FashionPage />
              </PageWrapper>
            }
          />
          <Route
            path="/my"
            element={
              <PageWrapper>
                <MyPage />
              </PageWrapper>
            }
          />
          <Route
            path="/setting"
            element={
              <PageWrapper>
                <SettingPage />
              </PageWrapper>
            }
          />
          <Route
            path="/find-id"
            element={
              <PageWrapper>
                <FindIDPage />
              </PageWrapper>
            }
          />
          <Route
            path="/find-pw"
            element={
              <PageWrapper>
                <FindPWPage />
              </PageWrapper>
            }
          />
          <Route
            path="/reset-pw"
            element={
              <PageWrapper>
                <ResetSetPage />
              </PageWrapper>
            }
          />
          <Route
            path="/product-detail"
            element={
              <PageWrapper>
                <DetailPage />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>

      {/* ✅ BottomNav도 보여줄 경로에만 렌더링 */}
      {shouldShowNav && <BottomNav />}
    </>
  );
}

export default App;
