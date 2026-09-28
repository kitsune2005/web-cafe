import React, { useState, useEffect } from 'react';
import localData from '../../../data/data.json';
import './Instagram.css';

const Instagram = ({ images: propImages }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadFallbackData = () => {
      const fallback = propImages || localData.instagramImages || localData.instagram || [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=500&auto=format&fit=crop"
      ];
      setImages(fallback);
    };

    const fetchInstagram = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/instagram');
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || data);
        } else {
          loadFallbackData();
        }
      } catch (err) {
        loadFallbackData();
      }
    };

    fetchInstagram();
  }, [propImages]);

  return (
    <section className="instagram-section">
      <div className="container">
        {/* TIÊU ĐỀ SECTION */}
        <div className="instagram-head">
          <h2 className="instagram-title">THEO DÕI TRÊN INSTAGRAM</h2>
          <p className="instagram-desc">
            Khám phá thế giới đa dạng của cà phê thông qua những hình ảnh tuyệt đẹp. Đắm chìm trong hương vị
            đậm đà và thơm ngon của cà phê, cùng tận hưởng sự sáng tạo và cảm nhận sâu lắng từ mỗi giọt cà phê.
            Hãy để chúng tôi dẫn bạn vào cuộc hành trình khám phá vị ngon và thú vị của cà phê!
          </p>
        </div>

        {/* LƯỚI 5 ẢNH VUÔNG */}
        <div className="instagram-grid">
          {images.map((img, idx) => (
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="insta-item" 
              key={idx}
            >
              <img src={img} alt={`Instagram cà phê ${idx + 1}`} loading="lazy" />
              <div className="insta-overlay">
                <i className="fa-brands fa-instagram"></i>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;