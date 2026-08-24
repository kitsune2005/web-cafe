import React, { useState, useEffect, useRef } from 'react';
import localData from '../../../data/data.json';
import './Testimonials.css';

const Testimonials = ({ testimonials: propTestimonials }) => {
  const trackRef = useRef(null);
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);

  useEffect(() => {
    const loadFallbackData = () => {
      const fallback = propTestimonials || localData.testimonials || [
        {
          id: 1,
          rating: 5,
          title: "Sản phẩm chất lượng",
          content: "Tôi rất ấn tượng với chất lượng sản phẩm. Sự tươi mới và tự nhiên của sản phẩm khiến tôi cảm thấy hài lòng và cảm thấy đáng giá với số tiền mình đã bỏ ra",
          author: "Văn Long",
          role: "Khách hàng"
        },
        {
          id: 2,
          rating: 5,
          title: "Quá tuyệt vời",
          content: "Tôi rất ấn tượng với chất lượng sản phẩm. Sự tươi mới và tự nhiên của sản phẩm khiến tôi cảm thấy hài lòng và cảm thấy đáng giá với số tiền mình đã bỏ ra",
          author: "Lê Hảo",
          role: "Khách hàng"
        },
        {
          id: 3,
          rating: 5,
          title: "Rất hài lòng",
          content: "Tôi rất ấn tượng với chất lượng sản phẩm. Sự tươi mới và tự nhiên của sản phẩm khiến tôi cảm thấy hài lòng và cảm thấy đáng giá với số tiền mình đã bỏ ra",
          author: "Bạch Ngân.",
          role: "Khách hàng"
        },
        {
          id: 4,
          rating: 5,
          title: "Hương vị đậm đà",
          content: "Cà phê giữ được hương thơm nguyên bản lâu, uống vào buổi sáng giúp tôi tràn đầy năng lượng làm việc cả ngày.",
          author: "Trần Đạt",
          role: "Khách hàng"
        }
      ];
      setTestimonials(fallback);
    };

    const fetchTestimonials = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.testimonials || data);
        } else {
          loadFallbackData();
        }
      } catch (err) {
        loadFallbackData();
      }
    };

    fetchTestimonials();
  }, [propTestimonials]);

  const totalItems = testimonials.length || 4;

  // Cuộn từng thẻ đánh giá một (1 item width + gap)
  const handleNext = () => {
    if (trackRef.current && trackRef.current.children.length > 0) {
      const itemWidth = trackRef.current.children[0].offsetWidth + 24; // 24px gap
      trackRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (trackRef.current && trackRef.current.children.length > 0) {
      const itemWidth = trackRef.current.children[0].offsetWidth + 24;
      trackRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (trackRef.current && trackRef.current.children.length > 0) {
      const scrollLeft = trackRef.current.scrollLeft;
      const itemWidth = trackRef.current.children[0].offsetWidth + 24;
      const newIndex = Math.round(scrollLeft / itemWidth) + 1;
      const clampedIndex = Math.min(Math.max(newIndex, 1), totalItems);
      setCurrentIndex(clampedIndex);
    }
  };

  return (
    <section className="testimonials-section">
      <div className="container">
        {/* TIÊU ĐỀ */}
        <div className="testimonials-head">
          <h2 className="testimonials-title">KHÁCH HÀNG ĐÁNH GIÁ</h2>
          <p className="testimonials-desc">
            Nhâm nhi mỗi ngày với những loại cà phê đặc biệt như Arabica, Robusta, Espresso và nhiều hơn nữa!
          </p>
        </div>

        {/* TRACK 3 CỘT */}
        <div className="testimonials-carousel-wrapper">
          <div 
            className="testimonials-track" 
            ref={trackRef}
            onScroll={handleScroll}
          >
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.id}>
                {/* 5 SAO ĐÁNH GIÁ */}
                <div className="testimonial-rating">
                  {[...Array(Number(item.rating) || 5)].map((_, i) => (
                    <i className="fa-solid fa-star" key={i}></i>
                  ))}
                </div>

                <h3 className="testimonial-card-title">{item.title}</h3>
                
                <p className="testimonial-card-content">{item.content}</p>

                {/* ĐƯỜNG KẺ VÀ TÁC GIẢ */}
                <div className="testimonial-divider"></div>

                <p className="testimonial-author">
                  <span className="author-name">{item.author}</span> - {item.role || 'Khách hàng'}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ĐIỀU HƯỚNG BÊN DƯỚI */}
        <div className="testimonials-controls">
          <button className="testimonials-nav-btn" onClick={handlePrev} aria-label="Trang trước">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="testimonials-page-num">
            {currentIndex} / {totalItems}
          </span>
          <button className="testimonials-nav-btn" onClick={handleNext} aria-label="Trang sau">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;