import React from "react";
import { NavLink, useNavigate  } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './BottomNav.css';



// 비회원일때만 로고 버튼 누르면 firstpage로 이동동
function BottomNav() {
  return (
    <nav className="bottom-nav">
      {/* <NavLink to="/main" className="nav-item">
        <i className="fas fa-home"></i>
      </NavLink> */}
      <NavLink to="/camera" className="nav-item">
        <i className="fas fa-camera"></i>
      </NavLink>
      <NavLink to ="./main" className="nav-item">
      <img src="./icons/logo.png" alt="Logo" style={{ width: "30px", height: "30px" }} />
      </NavLink>
      {/* <NavLink to="/fashoin" className="nav-item">
        <i className="fas fa-tshirt"></i>
      </NavLink> */}
      <NavLink to="/my" className="nav-item">
        <i className="fas fa-user"></i>
      </NavLink> 
      
    </nav>
  );
}

export default BottomNav;
