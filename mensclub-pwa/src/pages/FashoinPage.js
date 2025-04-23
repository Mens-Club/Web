import '../styles/FashoinPage.css';
import BottomNav from '../components/BottomNav';
import React, { useRef, useState } from 'react';

function FashoinPage() {
  return (
    <div className='container'>
      <div className='content'>
    <h1>👗 패션 화면입니다!</h1>
    <BottomNav />
      </div>
    </div>
  );
}

export default FashoinPage;