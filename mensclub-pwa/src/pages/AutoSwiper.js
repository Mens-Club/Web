// AutoSwiper.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import '../styles/AutoSwiper.css'

const AutoSwiper = ({ images }) => {
  return (
    <div className="fashionswiper">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.2}
        loop={true}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <img src={img} alt={`배너 ${idx}`} className="banner-slide-img" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AutoSwiper;
