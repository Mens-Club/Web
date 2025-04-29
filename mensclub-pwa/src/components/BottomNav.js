
import React from "react";
import { NavLink } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './BottomNav.css';

function BottomNav() {
  return (
    <>
      {/* 바닥 채우기용 흰색 div 추가 */}
      <div className="bottom-filler" />
      
      {/* 진짜 바텀 네비 */}
      <nav className="bottom-nav">
        <ul className="nav-items">
          <li>
            <NavLink to="/camera" className="nav-item">
              <i className="fas fa-camera"></i>
              <span>카메라</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/main" className="nav-item">
              <img src="/icons/logo.png" alt="Logo" style={{ width: "24px", height: "24px", marginBottom: "4px" }} />
              <span>홈</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/my" className="nav-item">
              <i className="fas fa-user"></i>
              <span>마이페이지</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default BottomNav;