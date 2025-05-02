import React from 'react';
import { useLocation } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
  const location = useLocation();

  // ✅ 경로 ➔ 타이틀 매핑
  const titles = {
    '/main': 'MENSCLUB',
    '/camera': '카메라',
    '/fashion': '패션페이지',
    '/my': '마이페이지',
    '/setting': '설정',
  };

  // ✅ 경로에 맞는 타이틀 찾기 (없으면 기본 MensClub)
  const title = titles[location.pathname] || 'MENSCLUB';

  return (
    <header className="top-nav">
      <img src="/images/logo.png" alt="Logo" className="top-nav-logo" />   
      <h1 className="top-nav-title">{title}</h1>
    </header>
  );
}

export default TopNav;
