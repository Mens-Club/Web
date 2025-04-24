// 📁 src/App.js

import '../styles/MainPage.css';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Layout.css'; // ✅ 공통 레이아웃 스타일 불러오기

function MainPage() {


  return (
    <div className="container">
      <main className="main-content">
       {/* 날씨 영역 */}
        <div className="header-section">

          <div className="title-area">
            <h1>오늘의 날씨 ⭐</h1>
            <div className="weather-info">
              <span>서울특별시 • 2023.03.13</span>
              <div className="stats">
                <span>습도 85%</span>
                <span>바람 3m/s</span>
                <span>강수확률 15%</span>
              </div>
            </div>
          </div>

          {/* 데스크탑용 서비스 박스만 이곳에 둠 */}
          <div className="service-box desktop-only">
            <h2>남성 맞춤 패션 스타일링 서비스</h2>
            <p>스타일, 서비스 고객 맞춤 특별 구매하세요!</p>
            <Link to="/camera">
            <button>1분만에 쇼핑 추천받기</button>
            </Link>
          </div>

        </div>

        {/* 모바일 전용 서비스 박스 - 날씨 아래, 추천 위 */}
        <div className="service-box mobile-only">
          <h2>남성 맞춤 패션 스타일링 서비스</h2>
          <p>스타일, 서비스 고객 맞춤 특별 구매하세요!</p>
          <Link to="/camera">
            <button>1분만에 쇼핑 추천받기</button>
          </Link>
        </div>


        {/* 추천 코디 섹션 */}
        <div className="coordination-section">
          <h2>오늘의 추천 👔</h2>
          <div className="coordination-slider">
            <button className="slider-btn prev">&lt;</button>
            <div className="coordination-cards">
              <div className="card">
                <img src="./images/outfit1.jpg" alt="essential round knit" />
                <div className="card-info"><h3>essential round knit</h3></div>
              </div>
              <div className="card">
                <img src="./images/outfit2.jpg" alt="new growth blue wide denim" />
                <div className="card-info"><h3>new growth blue wide denim</h3></div>
              </div>
              <div className="card">
                <img src="./images/outfit3.jpg" alt="W206 side pin tuck cotton pants" />
                <div className="card-info"><h3>W206 side pin tuck cotton pants</h3></div>
              </div>
              <div className="card">
                <img src="./images/outfit4.jpg" alt="W206 side pin tuck cotton pants" />
                <div className="card-info"><h3>W206 side pin tuck cotton pants</h3></div>
              </div>
            </div>
            <button className="slider-btn next">&gt;</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
